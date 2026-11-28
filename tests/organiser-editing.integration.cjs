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
    const { saveCreatorPrivacy } = require('../lib/admin/creator-privacy.ts')
    const { getProjectCatalog } = require('../lib/project-catalog.ts')
    const {
      listAllProjects,
      listProjects,
      exportShareable,
      listProjectCounts,
    } = require('../lib/live/projects.ts')
    const { getProjectPageContext } = require('../lib/builder-catalog.ts')
    const { projectBuilder } = require('../lib/project-detail.ts')
    await database.insert(tables.liveProjects).values({
      eventSlug: 'hacknight-5-jevathon-2026',
      slug: 'privacy-team-fixture',
      name: 'Privacy team fixture',
      tagline: 'Project remains public while credit visibility changes.',
      url: 'https://example.test/project',
      creatorName: 'Colin Stark',
      creatorEmail: 'private-team@example.test',
      linkedinUrl: 'https://www.linkedin.com/in/starklink/',
      hackers: [
        {
          name: 'Colin Stark',
          linkedinUrl: 'https://www.linkedin.com/in/starklink/',
        },
        {
          name: 'Remaining Builder',
          linkedinUrl: 'https://www.linkedin.com/in/remaining-fixture/',
        },
      ],
      shareConsent: true,
    })
    const projectSubject = `project:${key}`,
      builderSubject = `builder:${builder.slug}`
    const teamKey = 'submitted:hacknight-5-jevathon-2026:privacy-team-fixture'
    const privateTeam = (await organiserCatalog(admin, 'en')).projects.find(
      (row) => row.project.key === teamKey,
    ).project
    const [secondEvidence] = await database
      .insert(tables.projectClaimEvidence)
      .values({
        projectKey: teamKey,
        creditIndex: 1,
        emailHash: 'd'.repeat(64),
        keyId: 'b'.repeat(16),
        rosterDigest: claimRosterDigest(privateTeam.hackers),
        sourceDigest: 'e'.repeat(64),
      })
      .returning()
    await database.insert(tables.projectClaims).values({
      projectKey: teamKey,
      accountId: stranger.id,
      status: 'verified',
      verificationMethod: 'email',
      evidenceId: secondEvidence.id,
    })
    await database.insert(tables.communityProfiles).values({
      accountId: stranger.id,
      displayName: 'Verified Remaining Builder',
    })
    const totalsBefore = await listProjectCounts()
    const originalCreatorCount = (
      await getPublicArchivedProject(['aisummit25', 'travel-tetris'])
    ).data.hackers.length
    await assert.rejects(
      () => saveCreatorPrivacy(stranger, projectSubject, true, 0),
      { status: 403 },
    )
    await saveCreatorPrivacy(admin, projectSubject, true, 0)
    await assert.rejects(
      () => saveCreatorPrivacy(admin, projectSubject, false, 0),
      { status: 409 },
    )
    const anonymousArchive = await getPublicArchivedProject([
      'aisummit25',
      'travel-tetris',
    ])
    assert.ok(anonymousArchive)
    assert.deepEqual(anonymousArchive.data.hackers, [])
    const anonymousCard = (await getProjectCatalog('en')).find(
      (project) => project.key === key,
    )
    assert.equal(anonymousCard.creator, '')
    assert.deepEqual(anonymousCard.hackers, [])
    assert.deepEqual(anonymousCard.builders, [])
    assert.ok(
      !(await getBuilderCatalog('en')).profiles
        .find((profile) => profile.slug === builder.slug)
        .projectKeys.includes(key),
    )
    await saveCreatorPrivacy(admin, builderSubject, true, 0)
    assert.ok(
      !(await getBuilderCatalog('en')).profiles.some(
        (profile) => profile.slug === builder.slug,
      ),
    )
    for (const list of [
      await listAllProjects(),
      await listProjects('hacknight-5-jevathon-2026'),
      await exportShareable('hacknight-5-jevathon-2026'),
    ]) {
      const team = list.find((row) => row.slug === 'privacy-team-fixture')
      assert.equal(team.creatorName, 'Remaining Builder')
      assert.equal(team.hackers.length, 1)
      assert.equal(team.hackers[0].creditIndex, 1)
      assert.doesNotMatch(JSON.stringify(team.hackers), /Colin|starklink/)
    }
    const safeTeam = (await getProjectCatalog('en')).find(
      (project) => project.key === teamKey,
    )
    const teamContext = await getProjectPageContext(
      safeTeam,
      safeTeam.hackers.map(projectBuilder),
      'en',
    )
    assert.equal(teamContext.builders.length, 1)
    assert.equal(
      teamContext.builders[0].name,
      'Verified Remaining Builder',
      'Filtering the first teammate preserves the second teammate’s original credit/claim binding',
    )
    assert.ok(teamContext.builders[0].href)
    assert.deepEqual(await listProjectCounts(), totalsBefore)
    const internalCatalog = await organiserCatalog(admin, 'en')
    assert.equal(
      internalCatalog.projects.find((row) => row.project.key === teamKey)
        .project.hackers.length,
      2,
    )
    assert.equal(
      internalCatalog.profiles.find((profile) => profile.slug === builder.slug)
        .creatorPrivacy.hidden,
      true,
    )
    assert.equal(
      internalCatalog.projects.find((row) => row.project.key === teamKey)
        .hasHiddenCreators,
      true,
    )
    assert.equal(
      (await projectEditor(member, credit.projectKey, 'en')).organiser,
      false,
    )
    await saveCreatorPrivacy(admin, projectSubject, false, 1)
    const remainingCredits = (
      await getPublicArchivedProject(['aisummit25', 'travel-tetris'])
    ).data.hackers
    assert.equal(remainingCredits.length, originalCreatorCount - 1)
    assert.ok(
      remainingCredits.every(
        (person) => !person.links.linkedin?.includes('/starklink/'),
      ),
    )
    await saveCreatorPrivacy(admin, projectSubject, true, 2)
    await saveCreatorPrivacy(admin, builderSubject, false, 1)
    assert.deepEqual(
      (await getPublicArchivedProject(['aisummit25', 'travel-tetris'])).data
        .hackers,
      [],
    )
    await saveCreatorPrivacy(admin, projectSubject, false, 3)
    assert.equal(
      (await getPublicArchivedProject(['aisummit25', 'travel-tetris'])).data
        .hackers.length,
      originalCreatorCount,
    )
    assert.ok(
      (await getBuilderCatalog('en')).profiles.some(
        (profile) => profile.slug === builder.slug,
      ),
    )
    assert.equal(
      (await database.select().from(tables.creatorPrivacyHistory)).length,
      6,
    )
    const privacyRoute = require('../app/api/admin/creator-privacy/route.ts')
    sessionUser = stranger
    assert.equal(
      (
        await privacyRoute.PATCH(
          request({ subjectKey: projectSubject, hidden: true, revision: 4 }),
        )
      ).status,
      403,
    )
    sessionUser = admin
    assert.equal(
      (
        await privacyRoute.PATCH(
          request(
            { subjectKey: projectSubject, hidden: true, revision: 4 },
            'https://attacker.example',
          ),
        )
      ).status,
      403,
    )
    console.log(
      'PASS per-project and global creator privacy, public exports, stable credit indices, claimed teammates, hidden builders, retained organiser attribution, unchanged totals, precedence, restoration, audit and CSRF',
    )
    const {
      projectPrivacyOptions,
      accountPrivacyOptions,
    } = require('../lib/projects/privacy-store.ts')
    await database.insert(tables.projectClaims).values({
      projectKey: teamKey,
      accountId: member.id,
      status: 'verified',
      verificationMethod: 'organiser',
    })
    const teamOptions = await projectPrivacyOptions(member, teamKey)
    const secondCredit = teamOptions.credits.find(
      (item) => item.name === 'Remaining Builder',
    )
    assert.ok(secondCredit)
    await saveCreatorPrivacy(
      member,
      secondCredit.setting.subjectKey,
      true,
      0,
      [],
    )
    assert.deepEqual(
      (
        await getPublicProject(
          'hacknight-5-jevathon-2026',
          'privacy-team-fixture',
        )
      ).hackers.map((person) => person.name),
      ['Colin Stark'],
    )
    await saveCreatorPrivacy(
      member,
      secondCredit.setting.subjectKey,
      false,
      1,
      ['linkedin'],
    )
    let visibleTeam = await getPublicProject(
      'hacknight-5-jevathon-2026',
      'privacy-team-fixture',
    )
    assert.equal(visibleTeam.hackers.length, 2)
    assert.equal(visibleTeam.hackers[1].linkedinUrl, null)
    assert.ok(visibleTeam.hackers[0].linkedinUrl)
    await database
      .update(tables.liveProjects)
      .set({
        url: 'https://github.com/example/private-link-fixture',
        videoUrl: 'https://youtu.be/privacytest',
      })
      .where(eq(tables.liveProjects.slug, 'privacy-team-fixture'))
    await saveCreatorPrivacy(member, teamOptions.project.subjectKey, false, 0, [
      'github',
      'otherLinks',
    ])
    visibleTeam = await getPublicProject(
      'hacknight-5-jevathon-2026',
      'privacy-team-fixture',
    )
    assert.equal(visibleTeam.url, '')
    assert.equal(visibleTeam.videoUrl, null)
    const { getCommunityProfile } = require('../lib/community/profile-store.ts')
    const beforeProfile = await getCommunityProfile(member)
    const storedProfile = await saveCommunityProfile(member.id, {
      ...beforeProfile,
      linkedinUrl: 'https://www.linkedin.com/in/starklink/',
      bio: 'A private retained biography.',
    })
    const ownGlobal = (await accountPrivacyOptions(member)).find(
      (item) => item.setting.subjectKey === builderSubject,
    )
    assert.ok(ownGlobal)
    await saveCreatorPrivacy(
      member,
      builderSubject,
      false,
      ownGlobal.setting.revision,
      ['github', 'photo', 'bio'],
    )
    const maskedProfile = (await getBuilderCatalog('en')).profiles.find(
      (profile) => profile.slug === builder.slug,
    )
    assert.ok(maskedProfile)
    assert.ok(maskedProfile.links.linkedin)
    assert.equal(maskedProfile.links.github, undefined)
    assert.equal(maskedProfile.image, undefined)
    assert.equal(maskedProfile.bio, undefined)
    const maskedTeam = (await getProjectCatalog('en')).find(
      (project) => project.key === teamKey,
    )
    const maskedContext = await getProjectPageContext(
      maskedTeam,
      maskedTeam.hackers.map(projectBuilder),
      'en',
    )
    const maskedMaker = maskedContext.builders.find(
      (person) => person.name === storedProfile.displayName,
    )
    assert.ok(maskedMaker)
    assert.equal(maskedMaker.links.github, undefined)
    assert.equal(maskedMaker.image, undefined)
    assert.equal(
      (await getCommunityProfile(member)).githubUrl,
      storedProfile.githubUrl,
    )
    await saveCreatorPrivacy(
      stranger,
      teamOptions.project.subjectKey,
      false,
      1,
      [],
    )
    assert.ok(
      (
        await getPublicProject(
          'hacknight-5-jevathon-2026',
          'privacy-team-fixture',
        )
      ).url,
    )
    assert.equal(
      (await getBuilderCatalog('en')).profiles.find(
        (profile) => profile.slug === builder.slug,
      ).links.github,
      undefined,
      'A teammate cannot restore globally hidden profile details by changing project settings',
    )
    await assert.rejects(
      () =>
        saveCreatorPrivacy(
          stranger,
          builderSubject,
          false,
          ownGlobal.setting.revision + 1,
          [],
        ),
      { status: 403 },
    )
    await saveCreatorPrivacy(
      member,
      builderSubject,
      true,
      ownGlobal.setting.revision + 1,
      ['github'],
    )
    assert.ok(
      !(await getBuilderCatalog('en')).profiles.some(
        (profile) => profile.slug === builder.slug,
      ),
    )
    assert.equal(
      (
        await getPublicProject(
          'hacknight-5-jevathon-2026',
          'privacy-team-fixture',
        )
      ).hackers.length,
      1,
    )
    await saveCreatorPrivacy(
      member,
      builderSubject,
      false,
      ownGlobal.setting.revision + 2,
      [],
    )
    assert.ok(
      (await getBuilderCatalog('en')).profiles.find(
        (profile) => profile.slug === builder.slug,
      ).links.github,
    )
    const projectTotals = await listProjectCounts()
    await changeProjectVisibility(member, teamKey, 'private', 0)
    assert.equal(
      await getPublicProject(
        'hacknight-5-jevathon-2026',
        'privacy-team-fixture',
      ),
      null,
    )
    assert.deepEqual(await listProjectCounts(), projectTotals)
    await changeProjectVisibility(admin, teamKey, 'public', 1)
    assert.equal(
      (
        await getPublicProject(
          'hacknight-5-jevathon-2026',
          'privacy-team-fixture',
        )
      ).hackers[1].linkedinUrl,
      null,
    )
    await assert.rejects(
      () =>
        saveCreatorPrivacy(member, teamOptions.project.subjectKey, false, 2, [
          'accountId',
        ]),
      { status: 422 },
    )
    await assert.rejects(
      () =>
        saveCreatorPrivacy(
          member,
          teamOptions.project.subjectKey,
          false,
          0,
          [],
        ),
      { status: 409 },
    )
    const accountPrivacyRoute = require('../app/api/account/privacy/route.ts')
    sessionUser = member
    assert.equal(
      (
        await accountPrivacyRoute.PATCH(
          request({
            subjectKey: teamOptions.project.subjectKey,
            hidden: false,
            revision: 2,
            hiddenFields: ['github'],
          }),
        )
      ).status,
      200,
    )
    assert.equal(
      (
        await privacyRoute.PATCH(
          request({
            subjectKey: teamOptions.project.subjectKey,
            hidden: false,
            revision: 3,
            hiddenFields: [],
          }),
        )
      ).status,
      403,
      'Admin route remains organiser-only',
    )
    assert.equal(
      (
        await accountPrivacyRoute.PATCH(
          request({
            subjectKey: 'project:archive:AQ-App',
            hidden: true,
            revision: 0,
            role: 'admin',
            accountId: admin.id,
          }),
        )
      ).status,
      403,
    )
    const noProfileUser = actor('no-public-profile')
    await database
      .insert(tables.identityAccounts)
      .values({ ...noProfileUser, issuer: 'https://digest.hackbarna.com' })
    await database.insert(tables.liveProjects).values({
      eventSlug: 'hacknight-5-jevathon-2026',
      slug: 'no-profile-privacy-fixture',
      name: 'Profile-free fixture',
      tagline: 'Verified ownership without publishing a profile.',
      url: 'https://example.test',
      creatorName: 'Profile-free Builder',
      creatorEmail: 'private-no-profile@example.test',
      linkedinUrl: 'https://www.linkedin.com/in/no-profile-privacy-fixture/',
    })
    const noProfileKey =
      'submitted:hacknight-5-jevathon-2026:no-profile-privacy-fixture'
    const noProfileSource = (await organiserCatalog(admin, 'en')).projects.find(
      (row) => row.project.key === noProfileKey,
    ).project
    const [noProfileProof] = await database
      .insert(tables.projectClaimEvidence)
      .values({
        projectKey: noProfileKey,
        creditIndex: 0,
        emailHash: 'f'.repeat(64),
        keyId: 'b'.repeat(16),
        rosterDigest: claimRosterDigest(noProfileSource.hackers),
        sourceDigest: 'a'.repeat(64),
      })
      .returning()
    const [noProfileClaim] = await database
      .insert(tables.projectClaims)
      .values({
        projectKey: noProfileKey,
        accountId: noProfileUser.id,
        status: 'verified',
        verificationMethod: 'email',
        evidenceId: noProfileProof.id,
      })
      .returning()
    const ownWithoutProfile = await accountPrivacyOptions(noProfileUser)
    assert.equal(ownWithoutProfile.length, 1)
    await saveCreatorPrivacy(
      noProfileUser,
      ownWithoutProfile[0].setting.subjectKey,
      true,
      0,
      [],
    )
    await database
      .update(tables.projectClaims)
      .set({ status: 'revoked' })
      .where(eq(tables.projectClaims.id, noProfileClaim.id))
    await assert.rejects(
      () =>
        saveCreatorPrivacy(
          noProfileUser,
          ownWithoutProfile[0].setting.subjectKey,
          false,
          1,
          [],
        ),
      { status: 403 },
    )
    console.log(
      'PASS owner/admin independent project, individual-credit and global privacy, selective links/photos/bios, retained values, immediate publication, no team-to-global privilege escalation, no-profile claims, revocation, field validation and totals',
    )
    let matrixRevision = (await projectPrivacyOptions(member, teamKey)).project
      .revision
    let visibilityRevision = (await projectEditor(member, teamKey, 'en'))
      .visibilityRevision
    const matrixTotals = await listProjectCounts()
    for (const hiddenProject of [false, true]) {
      await changeProjectVisibility(
        member,
        teamKey,
        hiddenProject ? 'private' : 'public',
        visibilityRevision++,
      )
      for (const hiddenCreator of [false, true])
        for (let bits = 0; bits < 8; bits++) {
          const fields = ['linkedin', 'github', 'otherLinks'].filter(
            (_, index) => bits & (1 << index),
          )
          await saveCreatorPrivacy(
            member,
            teamOptions.project.subjectKey,
            hiddenCreator,
            matrixRevision++,
            fields,
          )
          const record = await getPublicProject(
            'hacknight-5-jevathon-2026',
            'privacy-team-fixture',
          )
          if (hiddenProject) {
            assert.equal(record, null)
            continue
          }
          assert.ok(record)
          assert.equal(record.name, 'Privacy team fixture')
          assert.equal(record.hackers.length, hiddenCreator ? 0 : 2)
          assert.equal(
            record.url,
            fields.includes('github')
              ? ''
              : 'https://github.com/example/private-link-fixture',
          )
          assert.equal(
            record.videoUrl,
            fields.includes('otherLinks')
              ? null
              : 'https://youtu.be/privacytest',
          )
          if (!hiddenCreator)
            assert.equal(
              record.hackers[0].linkedinUrl,
              fields.includes('linkedin')
                ? null
                : 'https://www.linkedin.com/in/starklink/',
            )
        }
      assert.deepEqual(await listProjectCounts(), matrixTotals)
    }
    console.log(
      'PASS all 32 project/creator/link visibility combinations with owner permissions and unchanged participation totals',
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
