// Production-rendered authenticated routes against the disposable CI database.
const assert = require('node:assert/strict')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const { spawn } = require('node:child_process')
const resolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith('@/')
      ? path.join(process.cwd(), request.slice(2))
      : request,
    ...args,
  )
}
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})

async function main() {
  // The client search module must not pull historical creator corrections into downloadable JS.
  const { globSync } = require('glob'),
    { readFileSync } = require('node:fs')
  const bundles = globSync('.next/static/**/*.js')
  assert.ok(bundles.length > 0)
  for (const file of bundles) {
    const source = readFileSync(file, 'utf8')
    for (const credit of [
      'Eduard Blancode',
      'Arnab Dey, Alex Garcia',
      'Chloe, Xénia & Majo',
    ])
      assert.ok(
        !source.includes(credit),
        `Historical creator mapping shipped in ${file}`,
      )
  }
  const url = new URL(process.env.TEST_DATABASE_URL || '')
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname))
  assert.equal(url.pathname, '/hackbarna_test')
  const port = 3101,
    origin = `http://127.0.0.1:${port}`
  const admin = {
    id: randomUUID(),
    name: 'Organiser route fixture',
    email: 'admin-route@example.test',
    emailVerified: true,
    avatarUrl: null,
  }
  const member = {
    ...admin,
    id: randomUUID(),
    name: 'Member route fixture',
    email: 'member-route@example.test',
  }
  Object.assign(process.env, {
    NETLIFY_DB_URL: url.href,
    HACKBARNA_ORGANISER_IDS: '',
    HACKBARNA_OWNER_ID: admin.id,
    HACKBARNA_OIDC_CLIENT_ID: 'route-fixture',
    HACKBARNA_OIDC_CLIENT_SECRET: 'route-fixture-secret',
    HACKBARNA_OIDC_REDIRECT_URI: `${origin}/auth/callback`,
    HACKBARNA_SESSION_KEY: 'f'.repeat(64),
  })
  const { Pool } = require('pg'),
    pool = new Pool({ connectionString: url.href })
  const database = require('drizzle-orm/node-postgres').drizzle({
    client: pool,
  })
  const dbPath = require.resolve('../db/index.ts')
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: { getDb: () => database },
  }
  const { createIdentitySession } = require('../lib/auth/session-store.ts')
  const { getIdentityConfig } = require('../lib/auth/identity-config.ts')
  const {
      identityAccounts,
      creatorPrivacy,
      creatorPrivacyHistory,
      liveProjects,
      projectClaimEvidence,
      projectClaims,
      projectVisibility,
      projectVisibilityAudit,
    } = require('../db/schema.ts'),
    { inArray, eq } = require('drizzle-orm')
  const privacySubjects = [
    'project:archive:aisummit25/travel-tetris',
    'builder:starklink-255870758bcc',
    'project:submitted:hacknight-5-jevathon-2026:creator-privacy-route-fixture',
  ]
  let server,
    logs = ''
  let ownerProofId
  try {
    const tokens = await Promise.all(
      [admin, member].map((user) =>
        createIdentitySession(getIdentityConfig(), user, {
          accessToken: 'local-route-fixture',
          expiresAt: Date.now() + 3600000,
        }),
      ),
    )
    server = spawn(
      process.execPath,
      [
        'node_modules/next/dist/bin/next',
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(port),
      ],
      { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    server.stdout.on('data', (data) => {
      logs = (logs + data).slice(-24000)
    })
    server.stderr.on('data', (data) => {
      logs = (logs + data).slice(-24000)
    })
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        await fetch(`${origin}/en/account/admin`, { redirect: 'manual' })
        ready = true
        break
      } catch {}
      if (server.exitCode !== null) break
      await new Promise((done) => setTimeout(done, 200))
    }
    assert.ok(ready, 'Production route server did not start')
    const read = (route, index = 0) =>
      fetch(origin + route, {
        headers: { Cookie: `hb_session=${tokens[index]}` },
        redirect: 'manual',
      })
    assert.equal(
      (await fetch(`${origin}/en/account/admin`, { redirect: 'manual' }))
        .status,
      307,
    )
    assert.equal((await read('/en/account/admin', 1)).status, 404)
    for (const locale of ['en', 'es', 'ca', 'fr']) {
      const { organiserCopy } = require('../data/organiser.ts'),
        copy = organiserCopy(locale)
      const response = await read(`/${locale}/account/admin`),
        html = await response.text()
      assert.equal(response.status, 200)
      assert.match(html, /noindex/)
      assert.ok(html.includes(copy.projects))
      assert.ok(html.includes(copy.builders))
      assert.ok(html.includes(`/${locale}/account/review`))
      assert.ok(html.includes('name="q"'))
      assert.ok(html.includes('name="event"'))
      const buildersResponse = await read(
          `/${locale}/account/admin?tab=builders&q=Colin`,
        ),
        builders = await buildersResponse.text()
      assert.equal(buildersResponse.status, 200)
      const builderPath = `/${locale}/account/admin/builders/starklink-255870758bcc`
      assert.ok(builders.includes(builderPath))
      const detailResponse = await read(builderPath),
        detail = await detailResponse.text()
      assert.equal(detailResponse.status, 200)
      assert.ok(detail.includes('Colin Stark'))
      assert.ok(detail.includes('name="linkedinUrl"'))
      assert.ok(detail.includes('name="githubUrl"'))
      assert.ok(detail.includes(copy.save))
      assert.ok(detail.includes('data-creator-privacy="builder"'))
      assert.ok(detail.includes('Travel Tetris'))
      assert.equal((await read(builderPath, 1)).status, 404)
      const edit = await read(
          `/${locale}/account/projects/edit?project=archive%3Aaisummit25%2Ftravel-tetris`,
        ),
        editHtml = await edit.text()
      assert.equal(edit.status, 200)
      assert.ok(editHtml.includes(copy.projectHelp))
      assert.ok(editHtml.includes(copy.visibility))
      assert.ok(editHtml.includes(copy.save))
      assert.ok(editHtml.includes('data-creator-privacy="project"'))
      assert.equal(
        (
          await read(
            `/${locale}/account/projects/edit?project=archive%3Aaisummit25%2Ftravel-tetris`,
            1,
          )
        ).status,
        404,
      )
    }
    const noMatches = await (
      await read('/en/account/admin?q=fixture-with-no-matching-project')
    ).text()
    assert.ok(noMatches.includes('No matches.'))
    const changePrivacy = async (subjectKey, hidden, revision) => {
      const response = await fetch(`${origin}/api/admin/creator-privacy`, {
        method: 'PATCH',
        headers: {
          Cookie: `hb_session=${tokens[0]}`,
          Origin: origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectKey, hidden, revision }),
      })
      assert.equal(response.status, 200, await response.clone().text())
    }
    const liveSlug = 'creator-privacy-route-fixture'
    await database.insert(liveProjects).values({
      eventSlug: 'hacknight-5-jevathon-2026',
      slug: liveSlug,
      name: 'Public project with private credits',
      tagline:
        'This project stays public while all creator credits are hidden.',
      url: 'https://example.test/privacy-project',
      creatorName: 'Private Route Creator',
      creatorEmail: 'private-route-creator@example.test',
      linkedinUrl: 'https://www.linkedin.com/in/private-route-creator/',
      shareConsent: true,
      category: 'tools',
    })
    await changePrivacy(privacySubjects[0], true, 0)
    await changePrivacy(privacySubjects[1], true, 0)
    await changePrivacy(privacySubjects[2], true, 0)
    for (const locale of ['en', 'es', 'ca', 'fr']) {
      assert.equal(
        (await fetch(`${origin}/${locale}/builders/starklink-255870758bcc`))
          .status,
        404,
      )
      const archive = await fetch(
          `${origin}/${locale}/projects/aisummit25/travel-tetris`,
        ),
        archiveHtml = await archive.text()
      assert.equal(archive.status, 200)
      assert.ok(!archiveHtml.includes('project-builders-heading'))
      const archiveJson = [
        ...archiveHtml.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        ),
      ].map((match) => JSON.parse(match[1]))
      const work = archiveJson.find((item) => item['@type'] === 'CreativeWork')
      assert.ok(work)
      assert.equal(work.author, undefined)
      const live = await fetch(
          `${origin}/${locale}/events/hacknight-5-jevathon-2026/projects/${liveSlug}`,
        ),
        liveHtml = await live.text()
      assert.equal(live.status, 200)
      assert.ok(!liveHtml.includes('Private Route Creator'))
      assert.ok(!liveHtml.includes('private-route-creator'))
      assert.ok(!liveHtml.includes('project-builders-heading'))
      const manage = await (
        await read(`/${locale}/account/admin?tab=builders&q=Colin`)
      ).text()
      assert.ok(manage.includes('Colin Stark'))
    }
    for (const path of [
      '/api/live/hacknight-5-jevathon-2026/projects',
      '/api/live/hacknight-5-jevathon-2026/export',
      '/api/live/hacknight-5-jevathon-2026/leaderboard',
    ]) {
      const response = await fetch(origin + path),
        payload = await response.json()
      assert.equal(response.status, 200)
      const text = JSON.stringify(payload)
      assert.ok(!text.includes('Private Route Creator'))
      assert.ok(!text.includes('private-route-creator'))
      const rows = Array.isArray(payload) ? payload : payload.projects
      assert.ok(rows.some((row) => row.slug === liveSlug))
    }
    const sitemapResponse = await fetch(`${origin}/sitemap.xml`),
      sitemap = await sitemapResponse.text()
    assert.equal(sitemapResponse.status, 200)
    assert.ok(!sitemap.includes('/builders/starklink-255870758bcc'))
    assert.ok(sitemap.includes('/projects/aisummit25/travel-tetris'))
    const page = await (await fetch(`${origin}/en/projects`)).text()
    assert.ok(!page.includes('Colin Stark'))
    assert.ok(page.includes('Travel Tetris'))
    await changePrivacy(privacySubjects[1], false, 1)
    assert.equal(
      (await fetch(`${origin}/en/builders/starklink-255870758bcc`)).status,
      200,
    )
    assert.ok(
      !(
        await (
          await fetch(`${origin}/en/projects/aisummit25/travel-tetris`)
        ).text()
      ).includes('project-builders-heading'),
      'Restoring a builder must not override project-level privacy',
    )
    const { getBuiltProject } = require('../app/helpers/projects.ts')
    const { archivedProjectCard } = require('../lib/project-cards.ts')
    const { claimRosterDigest } = require('../lib/projects/email-proof.ts')
    const ownerProject = 'archive:aisummit25/travel-tetris'
    const source = archivedProjectCard(
      getBuiltProject(['aisummit25', 'travel-tetris']),
      'en',
    )
    const [proof] = await database
      .insert(projectClaimEvidence)
      .values({
        projectKey: ownerProject,
        creditIndex: 0,
        emailHash: 'a'.repeat(64),
        keyId: 'b'.repeat(16),
        rosterDigest: claimRosterDigest(source.hackers),
        sourceDigest: 'c'.repeat(64),
      })
      .returning()
    ownerProofId = proof.id
    await database.insert(projectClaims).values({
      projectKey: ownerProject,
      accountId: member.id,
      status: 'verified',
      verificationMethod: 'email',
      evidenceId: proof.id,
    })
    const {
      projectPrivacyOptions,
    } = require('../lib/projects/privacy-store.ts')
    const options = await projectPrivacyOptions(member, ownerProject)
    const changeAsOwner = async (
      subjectKey,
      hidden,
      revision,
      hiddenFields = [],
    ) => {
      const response = await fetch(`${origin}/api/account/privacy`, {
        method: 'PATCH',
        headers: {
          Cookie: `hb_session=${tokens[1]}`,
          Origin: origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectKey, hidden, revision, hiddenFields }),
      })
      assert.equal(response.status, 200, await response.clone().text())
    }
    await changeAsOwner(privacySubjects[0], false, 1, ['github'])
    const teammate = options.credits.find((item) => item.name !== 'Colin Stark')
    assert.ok(teammate)
    privacySubjects.push(teammate.setting.subjectKey)
    await changeAsOwner(teammate.setting.subjectKey, true, 0)
    await changeAsOwner(privacySubjects[1], false, 2, [
      'linkedin',
      'github',
      'otherLinks',
      'photo',
      'bio',
    ])
    for (const locale of ['en', 'es', 'ca', 'fr']) {
      const edit = await read(
          `/${locale}/account/projects/edit?project=${encodeURIComponent(ownerProject)}`,
          1,
        ),
        html = await edit.text()
      assert.equal(edit.status, 200)
      for (const name of [
        'hide-linkedin',
        'hide-github',
        'hide-otherLinks',
        'hide-photo',
        'hide-bio',
      ])
        assert.ok(html.includes(`name="${name}"`))
      assert.ok(html.includes('data-creator-privacy="credit"'))
      const account = await read(`/${locale}/account`, 1),
        accountHtml = await account.text()
      assert.equal(account.status, 200)
      assert.ok(
        accountHtml.includes('data-creator-privacy="builder"'),
        'Verified claims allow global privacy before saving a public profile',
      )
      const page = await fetch(
          `${origin}/${locale}/projects/aisummit25/travel-tetris`,
        ),
        htmlPublic = await page.text()
      assert.equal(page.status, 200)
      const work = [
        ...htmlPublic.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        ),
      ]
        .map((m) => JSON.parse(m[1]))
        .find((item) => item['@type'] === 'CreativeWork')
      assert.ok(!work.author.some((person) => person.name === teammate.name))
      const colin = work.author.find((person) => person.name === 'Colin Stark')
      assert.ok(colin)
      assert.deepEqual(colin.sameAs, [])
    }
    await changeAsOwner(privacySubjects[1], true, 3)
    assert.equal(
      (await fetch(`${origin}/en/builders/starklink-255870758bcc`)).status,
      404,
    )
    assert.equal(
      (await fetch(`${origin}/en/projects/aisummit25/travel-tetris`)).status,
      200,
    )
    const { getEventProjects } = require('../lib/project-catalog.ts')
    const beforeTotal = (await getEventProjects('en', 'aisummit25')).total
    const visibility = await fetch(
      `${origin}/api/account/projects/visibility`,
      {
        method: 'PATCH',
        headers: {
          Cookie: `hb_session=${tokens[1]}`,
          Origin: origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: ownerProject,
          visibility: 'private',
          revision: 0,
        }),
      },
    )
    assert.equal(visibility.status, 200)
    assert.equal(
      (await fetch(`${origin}/en/projects/aisummit25/travel-tetris`)).status,
      404,
    )
    assert.equal(
      (await getEventProjects('en', 'aisummit25')).total,
      beforeTotal,
    )
    console.log(
      'PASS production-rendered organiser lists, search, project/profile editors and access isolation in all four locales',
    )
  } catch (error) {
    console.error(logs)
    throw error
  } finally {
    if (server) {
      server.kill('SIGTERM')
      await new Promise((done) =>
        server.exitCode !== null ? done() : server.once('exit', done),
      )
    }
    await database
      .delete(creatorPrivacyHistory)
      .where(inArray(creatorPrivacyHistory.subjectKey, privacySubjects))
    await database
      .delete(creatorPrivacy)
      .where(inArray(creatorPrivacy.subjectKey, privacySubjects))
    await database
      .delete(liveProjects)
      .where(eq(liveProjects.slug, 'creator-privacy-route-fixture'))
    await database
      .delete(identityAccounts)
      .where(inArray(identityAccounts.id, [admin.id, member.id]))
    if (ownerProofId)
      await database
        .delete(projectClaimEvidence)
        .where(eq(projectClaimEvidence.id, ownerProofId))
    await database
      .delete(projectVisibilityAudit)
      .where(
        eq(
          projectVisibilityAudit.projectKey,
          'archive:aisummit25/travel-tetris',
        ),
      )
    await database
      .delete(projectVisibility)
      .where(
        eq(projectVisibility.projectKey, 'archive:aisummit25/travel-tetris'),
      )
    await pool.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
