// Real loopback Postgres only. All fixtures live in a disposable schema.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const { execFileSync } = require('node:child_process')
const root = process.cwd(),
  resolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (request, ...args) {
  return resolve.call(
    this,
    request.startsWith('@/') ? path.join(root, request.slice(2)) : request,
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
  const detail = process.env.TEST_DATABASE_URL
    ? { context: 'dev', connection_string: process.env.TEST_DATABASE_URL }
    : JSON.parse(
        execFileSync('netlify', ['db', 'connect', '--json'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }),
      )
  assert.equal(detail.context, 'dev')
  assert.ok(
    ['localhost', '127.0.0.1', '[::1]'].includes(
      new URL(detail.connection_string).hostname,
    ),
  )
  const { Client, Pool } = require('pg'),
    client = new Client({ connectionString: detail.connection_string })
  await client.connect()
  const schema = `organiser_${randomUUID().replaceAll('-', '')}`
  let pool
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    for (const directory of fs
      .readdirSync('netlify/database/migrations')
      .sort())
      await client.query(
        fs.readFileSync(
          path.join('netlify/database/migrations', directory, 'migration.sql'),
          'utf8',
        ),
      )
    pool = new Pool({
      connectionString: detail.connection_string,
      options: `-c search_path=${schema}`,
      max: 6,
    })
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
    let sessionUser = null
    const authPath = require.resolve('../lib/auth/identity-server.ts')
    require.cache[authPath] = {
      id: authPath,
      filename: authPath,
      loaded: true,
      exports: { getCurrentIdentity: async () => sessionUser },
    }
    const tables = require('../db/schema.ts'),
      { eq } = require('drizzle-orm')
    const actor = (name) => ({
      id: randomUUID(),
      name,
      email: `${name}@example.test`,
      emailVerified: true,
      avatarUrl: null,
    })
    const admin = actor('organiser'),
      member = actor('member'),
      stranger = actor('stranger')
    for (const user of [admin, member, stranger])
      await database
        .insert(tables.identityAccounts)
        .values({ ...user, issuer: 'https://digest.hackbarna.com' })
    process.env.HACKBARNA_ORGANISER_IDS = admin.id
    process.env.HACKBARNA_OIDC_CLIENT_ID = 'fixture-client'
    process.env.HACKBARNA_OIDC_CLIENT_SECRET = 'fixture-secret'
    process.env.HACKBARNA_OIDC_REDIRECT_URI =
      'http://localhost:8888/auth/callback'
    process.env.HACKBARNA_SESSION_KEY = 'd'.repeat(64)
    const { organiserCatalog } = require('../lib/admin/catalog.ts')
    const {
      organiserBuilderEditor,
      saveOrganiserBuilder,
    } = require('../lib/admin/profiles.ts')
    const {
      projectEditor,
      saveProjectEdit,
    } = require('../lib/projects/edit-store.ts')
    const {
      changeProjectVisibility,
    } = require('../lib/projects/ownership-store.ts')
    const {
      getPublicArchivedProject,
    } = require('../lib/projects/archive-visibility.ts')
    const { getBuilderCatalog } = require('../lib/builder-catalog.ts')
    const { claimRosterDigest } = require('../lib/projects/email-proof.ts')
    const {
      publicMedia,
      discardMedia,
      canManageProjectImage,
    } = require('../lib/media/store.ts')
    const { managedImageId } = require('../lib/media/shared.ts')
    await assert.rejects(() => organiserCatalog(stranger, 'en'), {
      status: 403,
    })
    await assert.rejects(
      () => organiserCatalog({ ...admin, emailVerified: false }, 'en'),
      { status: 403 },
    )
    const key = 'archive:aisummit25/travel-tetris'
    const initial = await projectEditor(admin, key, 'en')
    assert.equal(initial.organiser, true)
    await assert.rejects(() => projectEditor(stranger, key, 'en'), {
      status: 403,
    })
    const changes = { ...initial.content, name: 'Organiser corrected project' }
    const saved = await saveProjectEdit(admin, key, initial.revision, changes)
    assert.equal(saved.status, 'approved')
    assert.equal(
      (await getPublicArchivedProject(['aisummit25', 'travel-tetris'])).data
        .title,
      changes.name,
    )
    await assert.rejects(
      () => saveProjectEdit(admin, key, initial.revision, changes),
      { status: 409 },
    )
    await assert.rejects(
      () => saveProjectEdit(stranger, key, saved.revision, changes),
      { status: 403 },
    )
    assert.equal(await canManageProjectImage(admin, key), true)
    assert.equal(await canManageProjectImage(stranger, key), false)
    await changeProjectVisibility(admin, key, 'private', 0)
    await saveProjectEdit(admin, key, saved.revision, {
      ...changes,
      description: 'Corrected while hidden.',
    })
    assert.equal(
      await getPublicArchivedProject(['aisummit25', 'travel-tetris']),
      null,
    )
    let catalog = await organiserCatalog(admin, 'en')
    assert.equal(
      catalog.projects.find((row) => row.project.key === key).visibility,
      'private',
    )
    assert.equal(
      catalog.projects.find((row) => row.project.key === key).project.name,
      changes.name,
    )
    assert.doesNotMatch(
      JSON.stringify(catalog),
      /creatorEmail|example\.test|accountId|emailHash/,
    )
    await changeProjectVisibility(admin, key, 'public', 1)
    const liveKey = 'submitted:hacknight-5-jevathon-2026:organiser-fixture'
    await database.insert(tables.liveProjects).values({
      eventSlug: 'hacknight-5-jevathon-2026',
      slug: 'organiser-fixture',
      name: 'Live fixture',
      tagline: 'A live submission.',
      url: 'https://example.test',
      creatorName: 'Fixture Builder',
      creatorEmail: 'private-creator@example.test',
      linkedinUrl: '',
      visibility: 'private',
    })
    const liveEditor = await projectEditor(admin, liveKey, 'en')
    assert.equal(liveEditor.visibility, 'private')
    await saveProjectEdit(admin, liveKey, 0, {
      ...liveEditor.content,
      name: 'Corrected live submission',
    })
    assert.equal(
      (await organiserCatalog(admin, 'en')).projects.find(
        (row) => row.project.key === liveKey,
      ).project.name,
      'Corrected live submission',
    )
    const { getPublicProject } = require('../lib/live/projects.ts')
    assert.equal(
      await getPublicProject('hacknight-5-jevathon-2026', 'organiser-fixture'),
      null,
    )
    await changeProjectVisibility(admin, liveKey, 'public', 0)
    assert.equal(
      (await getPublicProject('hacknight-5-jevathon-2026', 'organiser-fixture'))
        .name,
      'Corrected live submission',
    )
    const builder = catalog.profiles.find((profile) =>
      profile.links.linkedin?.includes('/starklink/'),
    )
    assert.ok(builder)
    let editor = await organiserBuilderEditor(admin, builder.slug, 'en')
    const imageId = randomUUID(),
      imageUrl = `http://localhost:8888/api/media/${imageId.toUpperCase()}`
    await database.insert(tables.mediaAssets).values({
      id: imageId,
      ownerId: admin.id,
      purpose: 'avatar',
      ready: true,
    })
    const updated = await saveOrganiserBuilder(
      admin,
      builder.slug,
      editor.version,
      {
        ...editor.profile,
        displayName: 'Colin, corrected by organiser',
        avatarUrl: imageUrl,
        bio: 'Public builder correction.',
        githubUrl: 'https://github.com/colinstark',
      },
    )
    assert.equal(updated.profile.revision, 1)
    await assert.rejects(
      () =>
        saveOrganiserBuilder(
          admin,
          builder.slug,
          editor.version,
          editor.profile,
        ),
      { status: 409 },
    )
    await assert.rejects(
      () =>
        saveOrganiserBuilder(
          stranger,
          builder.slug,
          updated.version,
          updated.profile,
        ),
      { status: 403 },
    )
    const publicBuilder = (await getBuilderCatalog('en')).profiles.find(
      (profile) => profile.slug === builder.slug,
    )
    assert.equal(publicBuilder.name, updated.profile.displayName)
    assert.deepEqual(
      new Set(publicBuilder.projectKeys),
      new Set(builder.projectKeys),
    )
    assert.equal(publicBuilder.claimed, undefined)
    const [asset] = await database
      .select()
      .from(tables.mediaAssets)
      .where(eq(tables.mediaAssets.id, imageId))
    assert.equal(await publicMedia(asset), true)
    await assert.rejects(() => discardMedia(admin, imageId), { status: 409 })
    // A later verified account takes precedence over historical organiser corrections.
    const credit = builder.credits[0],
      roster = catalog.projects.find(
        (row) => row.project.key === credit.projectKey,
      ).project.hackers
    const [evidence] = await database
      .insert(tables.projectClaimEvidence)
      .values({
        projectKey: credit.projectKey,
        creditIndex: credit.index,
        emailHash: 'a'.repeat(64),
        keyId: 'b'.repeat(16),
        rosterDigest: claimRosterDigest(roster),
        sourceDigest: 'c'.repeat(64),
      })
      .returning()
    await database.insert(tables.projectClaims).values({
      projectKey: credit.projectKey,
      accountId: member.id,
      status: 'verified',
      verificationMethod: 'email',
      evidenceId: evidence.id,
    })
    await database.insert(tables.communityProfiles).values({
      accountId: member.id,
      displayName: 'Claimed Colin',
      githubUrl: 'https://github.com/colinstark',
    })
    editor = await organiserBuilderEditor(admin, builder.slug, 'en')
    assert.equal(editor.builder.claimed, true)
    assert.equal(editor.profile.displayName, 'Claimed Colin')
    assert.notEqual(editor.version, updated.version)
    const claimedSave = await saveOrganiserBuilder(
      admin,
      builder.slug,
      editor.version,
      {
        ...editor.profile,
        bio: 'Updated shared profile.',
        avatarUrl: imageUrl,
      },
    )
    const [shared] = await database
      .select()
      .from(tables.communityProfiles)
      .where(eq(tables.communityProfiles.accountId, member.id))
    assert.equal(shared.bio, claimedSave.profile.bio)
    assert.equal(
      await publicMedia(asset),
      true,
      'An organiser-uploaded avatar remains public on a member profile',
    )
    assert.equal(managedImageId(shared.avatarUrl), imageId)
    const {
      saveCommunityProfile,
    } = require('../lib/community/profile-store.ts')
    const memberProfile = await saveCommunityProfile(member.id, {
      ...claimedSave.profile,
      bio: 'Member keeps their organiser-uploaded photo.',
    })
    assert.equal(memberProfile.avatarUrl, imageUrl)
    const memberEditor = await projectEditor(member, credit.projectKey, 'en')
    const memberSave = await saveProjectEdit(
      member,
      credit.projectKey,
      memberEditor.revision,
      {
        ...memberEditor.content,
        description: 'Member proposal still requires review.',
      },
    )
    assert.equal(memberSave.status, 'pending')
    // A member save racing an organiser save must fail rather than overwrite either version.
    await assert.rejects(
      () =>
        saveOrganiserBuilder(
          admin,
          builder.slug,
          claimedSave.version,
          claimedSave.profile,
        ),
      { status: 409 },
    )
    const history = await database.select().from(tables.builderProfileHistory)
    assert.equal(history.length, 2)
    assert.equal(history[1].actorId, admin.id)
    assert.equal(history[1].previousContent.displayName, 'Claimed Colin')
    // Real API boundary: auth, CSRF, injection and field validation.
    const route = require('../app/api/admin/builders/route.ts')
    const request = (body, origin = 'http://localhost:8888') =>
      new Request('http://localhost:8888/api/admin/builders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Origin: origin },
        body: JSON.stringify(body),
      })
    assert.equal((await route.PATCH(request({}))).status, 401)
    sessionUser = stranger
    assert.equal(
      (
        await route.PATCH(
          request({
            builder: builder.slug,
            version: editor.version,
            profile: editor.profile,
            role: 'admin',
          }),
        )
      ).status,
      403,
    )
    sessionUser = admin
    editor = await organiserBuilderEditor(admin, builder.slug, 'en')
    const body = {
      builder: builder.slug,
      version: editor.version,
      profile: { ...editor.profile, bio: 'API update' },
    }
    assert.equal(
      (await route.PATCH(request(body, 'https://attacker.example'))).status,
      403,
    )
    assert.equal(
      (
        await route.PATCH(
          request({
            ...body,
            profile: { ...body.profile, linkedinUrl: 'javascript:alert(1)' },
          }),
        )
      ).status,
      422,
    )
    assert.equal((await route.PATCH(request(body))).status, 200)
    assert.equal((await route.PATCH(request(body))).status, 409)
    console.log(
      'PASS organiser access, archive editing, hidden records, immediate publication, owner review, stable builder identity, claimed profile sync, media binding, audit history, concurrency and CSRF',
    )
  } finally {
    if (pool) await pool.end()
    await client.query(`DROP SCHEMA "${schema}" CASCADE`)
    await client.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
