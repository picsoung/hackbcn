// Real loopback Postgres; an isolated schema is dropped even on assertion failure.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
const { randomUUID } = require('node:crypto'),
  { execFileSync } = require('node:child_process')
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
  const schema = `ownership_${randomUUID().replaceAll('-', '')}`
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
      { eq, and } = require('drizzle-orm')
    const { DIGEST_ISSUER } = require('../lib/auth/identity-config.ts')
    const actor = (name, emailVerified = true) => ({
      id: randomUUID(),
      name,
      email: `${name}@example.test`,
      emailVerified,
      avatarUrl: null,
    })
    const organiser = actor('organiser'),
      alice = actor('alice'),
      bob = actor('bob'),
      stranger = actor('stranger'),
      unverified = actor('unverified', false)
    for (const user of [organiser, alice, bob, stranger, unverified])
      await database
        .insert(tables.identityAccounts)
        .values({ ...user, issuer: DIGEST_ISSUER })
    process.env.HACKBARNA_ORGANISER_IDS = organiser.id
    process.env.HACKBARNA_PROJECT_CLAIM_KEY = 'a'.repeat(64)
    process.env.HACKBARNA_OIDC_CLIENT_ID = 'fixture-client'
    process.env.HACKBARNA_OIDC_CLIENT_SECRET = 'fixture-secret'
    process.env.HACKBARNA_OIDC_REDIRECT_URI =
      'http://localhost:8888/auth/callback'
    process.env.HACKBARNA_SESSION_KEY = 'd'.repeat(64)
    const store = require('../lib/projects/ownership-store.ts'),
      proof = require('../lib/projects/email-proof.ts'),
      { importProjectEvidence } = require('../lib/projects/evidence-import.ts')
    const {
      getPublicArchivedProject,
    } = require('../lib/projects/archive-visibility.ts')
    const projectKey = 'archive:aisummit26/nito',
      source = await store.sourceProject(projectKey, 'en')
    const evidence = (key, card, users) => ({
      version: 1,
      keyId: proof.claimKeyId(process.env.HACKBARNA_PROJECT_CLAIM_KEY),
      projectKeys: [key],
      evidence: users.map((user, index) => ({
        projectKey: key,
        creditIndex: index,
        emailHash: proof.claimEmailHash(
          user.email,
          process.env.HACKBARNA_PROJECT_CLAIM_KEY,
        ),
        rosterDigest: proof.claimRosterDigest(card.hackers),
        sourceDigest: 'c'.repeat(64),
      })),
    })
    const payload = evidence(projectKey, source.card, [alice])
    await assert.rejects(
      () => importProjectEvidence(stranger, payload),
      (error) => error.status === 403,
    )
    await importProjectEvidence(organiser, payload)
    const before = await store.accountProjects(alice, 'en')
    assert.equal(before.available.length, 1)
    assert.equal(before.claims.length, 0)
    await assert.rejects(
      () => store.changeProjectVisibility(alice, projectKey, 'public', 0),
      (error) => error.status === 403,
    )
    assert.equal(
      (
        await store.requestProjectClaim(
          alice,
          projectKey,
          'My individual email match',
        )
      ).status,
      'verified',
    )
    assert.equal(
      (await store.accountProjects(stranger, 'en')).available.length,
      0,
    )
    assert.equal(
      (
        await store.requestProjectClaim(
          stranger,
          projectKey,
          'My name is Tair Asim',
        )
      ).status,
      'pending',
    )
    await assert.rejects(
      () => store.changeProjectVisibility(stranger, projectKey, 'private', 0),
      (error) => error.status === 403,
    )
    await assert.rejects(
      () => store.requestProjectClaim(unverified, projectKey, ''),
      (error) => error.status === 403,
    )
    await store.changeProjectVisibility(alice, projectKey, 'public', 0)
    assert.ok(await getPublicArchivedProject(['aisummit26', 'nito']))
    const teammate = await store.requestProjectClaim(
      bob,
      projectKey,
      'I was on this team',
    )
    await assert.rejects(
      () =>
        store.reviewProjectClaim(
          stranger,
          teammate.id,
          'approve',
          'Pretend organiser',
        ),
      (error) => error.status === 403,
    )
    await store.reviewProjectClaim(
      organiser,
      teammate.id,
      'approve',
      'Checked individual registration and original submission (fixture).',
    )
    await store.changeProjectVisibility(bob, projectKey, 'private', 1)
    assert.equal(await getPublicArchivedProject(['aisummit26', 'nito']), null)
    await assert.rejects(
      () => store.changeProjectVisibility(alice, projectKey, 'public', 1),
      (error) => error.status === 409,
    )
    const simultaneous = await Promise.allSettled([
      store.changeProjectVisibility(alice, projectKey, 'public', 2),
      store.changeProjectVisibility(bob, projectKey, 'private', 2),
    ])
    assert.equal(
      simultaneous.filter((result) => result.status === 'fulfilled').length,
      1,
    )
    assert.equal(
      simultaneous.filter(
        (result) =>
          result.status === 'rejected' && result.reason.status === 409,
      ).length,
      1,
    )
    const { getEventProjects } = require('../lib/project-catalog.ts')
    assert.equal((await getEventProjects('en', 'aisummit26')).total, 65)
    const ownerData = await store.accountProjects(alice, 'en')
    assert.ok(
      ownerData.projects.some((item) => item.project.key === projectKey),
    )
    assert.doesNotMatch(
      JSON.stringify(ownerData),
      /emailHash|evidenceId|reviewNote|sourceDigest|@example/,
    )
    console.log(
      'PASS automatic individual claims, manual team claims, non-owner denial, archive hide/restore, unchanged totals and concurrent revision conflicts',
    )

    const claimApi = require('../app/api/account/projects/claims/route.ts'),
      visibilityApi = require('../app/api/account/projects/visibility/route.ts')
    const request = (body, origin = 'http://localhost:8888') =>
      new Request('http://localhost:8888/api/account/projects/visibility', {
        method: 'PATCH',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    sessionUser = alice
    assert.equal(
      (
        await visibilityApi.PATCH(
          request(
            { project: projectKey, visibility: 'private', revision: 3 },
            'https://evil.example',
          ),
        )
      ).status,
      403,
    )
    sessionUser = null
    assert.equal(
      (
        await visibilityApi.PATCH(
          request({ project: projectKey, visibility: 'private', revision: 3 }),
        )
      ).status,
      401,
    )
    sessionUser = stranger
    const denied = await visibilityApi.PATCH(
      request({
        project: projectKey,
        visibility: 'private',
        revision: 3,
        accountId: alice.id,
        role: 'admin',
      }),
    )
    assert.equal(denied.status, 403)
    assert.match(denied.headers.get('cache-control'), /no-store/)
    sessionUser = unverified
    assert.equal(
      (
        await claimApi.POST(
          request({ project: projectKey, message: 'A claim' }),
        )
      ).status,
      403,
    )
    sessionUser = alice
    assert.equal(
      (
        await claimApi.POST(
          request({ project: projectKey, message: 'x'.repeat(9000) }),
        )
      ).status,
      413,
    )
    assert.equal(
      (
        await store.requestProjectClaim(
          stranger,
          'archive:unknown-private-reference',
          'Please review',
        )
      ).status,
      'pending',
    )
    console.log(
      'PASS authenticated API boundary, CSRF, unverified accounts, forged account IDs and body limits',
    )

    const event = 'hacknight-5-jevathon-2026',
      submitted = `submitted:${event}:ownership-fixture`
    await database.insert(tables.liveProjects).values({
      eventSlug: event,
      slug: 'ownership-fixture',
      name: 'Ownership fixture',
      tagline: 'Fixture',
      url: 'https://example.test',
      creatorName: 'Alice',
      creatorEmail: alice.email,
      linkedinUrl: '',
      hackers: [
        { name: 'Alice', linkedinUrl: null },
        { name: 'Bob', linkedinUrl: null },
      ],
    })
    const liveSource = await store.sourceProject(submitted, 'en'),
      liveProof = evidence(submitted, liveSource.card, [alice, bob])
    const shared = structuredClone(liveProof)
    shared.evidence[1].emailHash = shared.evidence[0].emailHash
    await assert.rejects(
      () => importProjectEvidence(organiser, shared),
      (error) => error.status === 422,
    )
    await importProjectEvidence(organiser, liveProof)
    assert.equal(
      (await store.requestProjectClaim(alice, submitted, 'My email')).status,
      'verified',
    )
    assert.equal(
      (await store.requestProjectClaim(bob, submitted, 'My email')).status,
      'verified',
    )
    await store.changeProjectVisibility(alice, submitted, 'private', 0)
    const publicStore = require('../lib/live/projects.ts')
    assert.deepEqual(await publicStore.listProjects(event), [])
    assert.deepEqual(await publicStore.listProjectCounts(event), [
      { eventSlug: event, count: 1 },
    ])
    await store.changeProjectVisibility(bob, submitted, 'public', 1)
    assert.equal((await publicStore.listProjects(event)).length, 1)
    await importProjectEvidence(organiser, { ...liveProof, evidence: [] })
    await assert.rejects(
      () => store.changeProjectVisibility(alice, submitted, 'private', 2),
      (error) => error.status === 403,
    )
    assert.equal(
      (await store.requestProjectClaim(alice, submitted, 'Request again'))
        .status,
      'pending',
    )
    await importProjectEvidence(organiser, liveProof)
    assert.equal(
      (await store.requestProjectClaim(alice, submitted, 'Request again'))
        .status,
      'pending',
    )
    await assert.rejects(
      () => store.changeProjectVisibility(alice, submitted, 'private', 2),
      (error) => error.status === 403,
    )
    const [pending] = await database
      .select()
      .from(tables.projectClaims)
      .where(
        and(
          eq(tables.projectClaims.accountId, alice.id),
          eq(tables.projectClaims.projectKey, submitted),
        ),
      )
    await store.reviewProjectClaim(
      organiser,
      pending.id,
      'approve',
      'Reviewed the corrected individual source evidence (fixture).',
    )
    await store.changeProjectVisibility(alice, submitted, 'private', 2)
    console.log(
      'PASS submitted team hide/restore, shared-email rejection, changed evidence revocation and no automatic reclaim after review blocks',
    )
    // Editing uses the same verified memberships, with independent content revisions.
    const edits = require('../lib/projects/edit-store.ts')
    const archiveEdit = await edits.projectEditor(alice, projectKey, 'en')
    const content = {
      ...archiveEdit.content,
      name: 'Reviewed archive title',
      description: 'A verified team update.',
      website: 'https://example.test/demo',
      video: '',
    }
    await assert.rejects(
      () => edits.projectEditor(stranger, projectKey, 'en'),
      (error) => error.status === 403,
    )
    await assert.rejects(
      () => edits.saveProjectEdit(unverified, projectKey, 0, content),
      (error) => error.status === 403,
    )
    await assert.rejects(
      () =>
        edits.saveProjectEdit(alice, projectKey, 0, {
          ...content,
          visibility: 'public',
        }),
      (error) => error.status === 422,
    )
    await assert.rejects(
      () =>
        edits.saveProjectEdit(alice, projectKey, 0, {
          ...content,
          website: 'javascript:alert(1)',
        }),
      (error) => error.status === 422,
    )
    await store.changeProjectVisibility(alice, projectKey, 'private', 3)
    const concurrentEdits = await Promise.allSettled([
      edits.saveProjectEdit(alice, projectKey, 0, content),
      edits.saveProjectEdit(bob, projectKey, 0, content),
    ])
    assert.equal(
      concurrentEdits.filter((result) => result.status === 'fulfilled').length,
      1,
    )
    assert.equal(
      concurrentEdits.filter(
        (result) =>
          result.status === 'rejected' && result.reason.status === 409,
      ).length,
      1,
    )
    assert.equal(await getPublicArchivedProject(['aisummit26', 'nito']), null)
    await assert.rejects(
      () =>
        edits.reviewProjectEdit(
          stranger,
          projectKey,
          1,
          'approve',
          'Pretend organiser',
        ),
      (error) => error.status === 403,
    )
    await edits.reviewProjectEdit(
      organiser,
      projectKey,
      1,
      'approve',
      'Reviewed content and external links (fixture).',
    )
    assert.equal(
      await getPublicArchivedProject(['aisummit26', 'nito']),
      null,
      'Approving edits cannot undo a hide',
    )
    await store.changeProjectVisibility(bob, projectKey, 'public', 4)
    assert.equal(
      (await getPublicArchivedProject(['aisummit26', 'nito'])).data.title,
      content.name,
    )
    const publicArchives =
      await require('../lib/projects/archive-visibility.ts').getPublicArchivedProjects()
    assert.equal(
      publicArchives.find((project) => project.slug === 'aisummit26/nito').data
        .description,
      content.description,
    )
    await edits.saveProjectEdit(alice, projectKey, 2, {
      ...content,
      name: 'Pending private revision',
    })
    assert.equal(
      (await getPublicArchivedProject(['aisummit26', 'nito'])).data.title,
      content.name,
    )
    assert.equal((await getEventProjects('en', 'aisummit26')).total, 65)
    await assert.rejects(
      () =>
        edits.reviewProjectEdit(
          organiser,
          projectKey,
          2,
          'approve',
          'Stale review attempt',
        ),
      (error) => error.status === 409,
    )
    console.log(
      'PASS owner/team editing, validation, concurrent content revisions, pending isolation, stale reviews and hide-versus-approval privacy',
    )

    const liveEdit = await edits.projectEditor(alice, submitted, 'en')
    const liveContent = {
      ...liveEdit.content,
      name: 'Reviewed live title',
      description: 'A live team update.',
    }
    await edits.saveProjectEdit(alice, submitted, 0, liveContent)
    await edits.reviewProjectEdit(
      organiser,
      submitted,
      1,
      'reject',
      'Please improve the project description (fixture).',
    )
    assert.equal(
      (await edits.projectEditor(alice, submitted, 'en')).status,
      'rejected',
    )
    await edits.saveProjectEdit(alice, submitted, 2, liveContent)
    await edits.reviewProjectEdit(
      organiser,
      submitted,
      3,
      'approve',
      'Rechecked summary and links (fixture).',
    )
    assert.equal(
      await publicStore.getPublicProject(event, 'ownership-fixture'),
      null,
    )
    await store.changeProjectVisibility(alice, submitted, 'public', 3)
    assert.equal(
      (await publicStore.getPublicProject(event, 'ownership-fixture')).name,
      liveContent.name,
    )
    assert.equal(
      (await publicStore.listProjects(event))[0].name,
      liveContent.name,
    )
    assert.equal(
      (await publicStore.listAllProjects())[0].tagline,
      liveContent.description,
    )
    await database
      .update(tables.liveProjects)
      .set({ shareConsent: true })
      .where(eq(tables.liveProjects.slug, 'ownership-fixture'))
    assert.equal(
      (await publicStore.exportShareable(event))[0].name,
      liveContent.name,
    )
    const history = await database
      .select()
      .from(tables.projectContentHistory)
      .where(eq(tables.projectContentHistory.projectKey, submitted))
    assert.deepEqual(history.map((row) => row.revision).sort(), [1, 2, 3, 4])
    const editApi = require('../app/api/account/projects/content/route.ts')
    sessionUser = stranger
    assert.equal(
      (
        await editApi.PATCH(
          request({
            project: submitted,
            revision: 4,
            content: liveContent,
            accountId: alice.id,
          }),
        )
      ).status,
      403,
    )
    sessionUser = alice
    assert.equal(
      (
        await editApi.POST(
          request({
            project: submitted,
            revision: 4,
            decision: 'approve',
            note: 'Forged organiser review',
          }),
        )
      ).status,
      403,
    )
    assert.equal(
      (
        await editApi.PATCH(
          request(
            { project: submitted, revision: 4, content: liveContent },
            'https://evil.example',
          ),
        )
      ).status,
      403,
    )
    console.log(
      'PASS live edit review/rejection, all public read surfaces, immutable history and editing API authorization/CSRF',
    )
    const media = require('../lib/media/store.ts'),
      sharp = require('sharp')
    const assets = new Map()
    media.mediaStore = () => ({
      delete: async (key) => {
        assets.delete(key)
      },
      set: async (key, value) => {
        assets.set(key, new Uint8Array(value))
        return {}
      },
      get: async (key) => assets.get(key)?.buffer ?? null,
    })
    const uploadApi = require('../app/api/account/media/route.ts'),
      imageApi = require('../app/api/media/[asset]/route.ts')
    const imageBytes = await sharp({
      create: { width: 80, height: 60, channels: 3, background: '#e97ca6' },
    })
      .png()
      .toBuffer()
    const uploadRequest = (purpose, key, origin = 'http://localhost:8888') =>
      new Request(
        `http://localhost:8888/api/account/media?purpose=${purpose}${key ? '&project=' + encodeURIComponent(key) : ''}`,
        {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'image/png' },
          body: imageBytes,
        },
      )
    sessionUser = null
    assert.equal((await uploadApi.POST(uploadRequest('avatar'))).status, 401)
    sessionUser = stranger
    assert.equal(
      (await uploadApi.POST(uploadRequest('project', submitted))).status,
      403,
    )
    sessionUser = unverified
    assert.equal((await uploadApi.POST(uploadRequest('avatar'))).status, 403)
    sessionUser = alice
    assert.equal(
      (
        await uploadApi.POST(
          uploadRequest('avatar', null, 'https://evil.example'),
        )
      ).status,
      403,
    )
    const portraitResponse = await uploadApi.POST(uploadRequest('avatar'))
    assert.equal(portraitResponse.status, 200)
    const portraitUrl = (await portraitResponse.json()).url,
      portraitId = portraitUrl.split('/').pop()
    const assetRequest = (id) =>
      imageApi.GET(new Request(`http://localhost:8888/api/media/${id}`), {
        params: { asset: id },
      })
    sessionUser = null
    assert.equal(
      (await assetRequest(portraitId)).status,
      404,
      'Uncommitted avatar is private',
    )
    sessionUser = alice
    assert.equal((await assetRequest(portraitId)).status, 200)
    const profiles = require('../lib/community/profile-store.ts')
    const profile = {
      displayName: 'Alice',
      avatarUrl: portraitUrl,
      bio: '',
      linkedinUrl: '',
      githubUrl: '',
      revision: 0,
    }
    await assert.rejects(
      () => profiles.saveCommunityProfile(stranger.id, profile),
      (error) => error.status === 422,
    )
    await profiles.saveCommunityProfile(alice.id, profile)
    sessionUser = null
    const publicPortrait = await assetRequest(portraitId)
    assert.equal(publicPortrait.status, 200)
    assert.match(publicPortrait.headers.get('content-type'), /image\/webp/)
    assert.match(publicPortrait.headers.get('cache-control'), /no-store/)
    await assert.rejects(
      () => media.discardMedia(alice, portraitId),
      (error) => error.status === 409,
    )
    const storedBytes = assets.get(portraitId + '.webp')
    assert.equal((await sharp(storedBytes).metadata()).width, 512)
    console.log(
      'PASS upload authentication/CSRF, verified accounts, avatar ownership and private staging before profile save',
    )

    sessionUser = alice
    const projectResponse = await uploadApi.POST(
      uploadRequest('project', submitted),
    )
    assert.equal(projectResponse.status, 200)
    const projectUrl = (await projectResponse.json()).url,
      projectId = projectUrl.split('/').pop()
    const currentEdit = await edits.projectEditor(alice, submitted, 'en')
    await assert.rejects(
      () =>
        edits.saveProjectEdit(alice, submitted, currentEdit.revision, {
          ...currentEdit.content,
          image: portraitUrl,
        }),
      (error) => error.status === 422,
    )
    await assert.rejects(
      () =>
        edits.saveProjectEdit(alice, projectKey, 3, {
          ...content,
          image: projectUrl,
        }),
      (error) => error.status === 422,
    )
    await edits.saveProjectEdit(alice, submitted, currentEdit.revision, {
      ...currentEdit.content,
      image: projectUrl,
    })
    sessionUser = null
    assert.equal(
      (await assetRequest(projectId)).status,
      404,
      'Pending project image cannot be fetched anonymously',
    )
    sessionUser = stranger
    assert.equal((await assetRequest(projectId)).status, 404)
    sessionUser = organiser
    assert.equal(
      (await assetRequest(projectId)).status,
      200,
      'Organisers can inspect pending images',
    )
    await assert.rejects(
      () =>
        edits.reviewProjectEdit(
          organiser,
          submitted,
          currentEdit.revision + 1,
          'reject',
          '',
        ),
      (error) => error.status === 422,
    )
    await edits.reviewProjectEdit(
      organiser,
      submitted,
      currentEdit.revision + 1,
      'approve',
      '',
    )
    assert.equal(
      (await edits.projectEditor(alice, submitted, 'en')).reviewNote,
      null,
      'Approval notes are not sent to builders',
    )
    sessionUser = null
    assert.equal((await assetRequest(projectId)).status, 200)
    assert.equal(
      (await publicStore.getPublicProject(event, 'ownership-fixture')).imageUrl,
      projectUrl,
    )
    await store.changeProjectVisibility(alice, submitted, 'private', 4)
    assert.equal(
      (await assetRequest(projectId)).status,
      404,
      'Hiding also revokes public image access',
    )
    sessionUser = alice
    assert.equal((await assetRequest(projectId)).status, 200)
    const archiveImage = await media.reserveMedia(alice, 'project', projectKey)
    assets.set(archiveImage.id + '.webp', storedBytes)
    await database
      .update(tables.mediaAssets)
      .set({ ready: true })
      .where(eq(tables.mediaAssets.id, archiveImage.id))
    await edits.saveProjectEdit(alice, projectKey, 3, {
      ...content,
      image: media.mediaUrl(archiveImage.id),
    })
    await edits.reviewProjectEdit(
      organiser,
      projectKey,
      4,
      'approve',
      'Internal approval details must remain private.',
    )
    assert.equal(
      (await edits.projectEditor(alice, projectKey, 'en')).reviewNote,
      null,
    )
    sessionUser = null
    assert.equal((await assetRequest(archiveImage.id)).status, 200)
    assert.equal(
      (await getPublicArchivedProject(['aisummit26', 'nito'])).data
        .thumbnailUrl,
      media.mediaUrl(archiveImage.id),
    )
    await store.changeProjectVisibility(alice, projectKey, 'private', 5)
    assert.equal((await assetRequest(archiveImage.id)).status, 404)
    for (let count = 0; count < 17; count++)
      await media.reserveMedia(alice, 'avatar', null)
    const reserved = await database
      .select()
      .from(tables.mediaAssets)
      .where(
        and(
          eq(tables.mediaAssets.ownerId, alice.id),
          eq(tables.mediaAssets.ready, false),
        ),
      )
    await media.discardMedia(alice, reserved[0].id)
    await assert.rejects(
      () => media.reserveMedia(alice, 'avatar', null),
      (error) => error.status === 429,
    )
    assert.equal((await assetRequest('not-a-uuid')).status, 404)
    console.log(
      'PASS project image scope, held-image privacy, organiser review, archive/live cover publication, immediate hiding and upload limits',
    )
    // Notifications use fake provider calls, with a real PostgreSQL outbox.
    process.env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED = 'true'
    process.env.SITE_ORIGIN = 'https://www.hackbarna.com'
    process.env.HACKBARNA_REVIEW_SLACK_WEBHOOK =
      'https://hooks.slack.com/services/T_FIXTURE/B_FIXTURE/TEST_ONLY_NOT_A_TOKEN'
    const {
      dispatchReviewNotifications,
    } = require('../lib/projects/review-dispatch.ts')
    let posts = []
    const delivered = async (url, options) => {
      posts.push({ url, options })
      return new Response('ok')
    }
    const nextEdit = async (label) => {
      const editor = await edits.projectEditor(alice, projectKey, 'en')
      return edits.saveProjectEdit(alice, projectKey, editor.revision, {
        ...editor.content,
        name: label,
      })
    }
    await nextEdit('Review alert fixture')
    const queued = await database.select().from(tables.reviewNotifications)
    assert.equal(queued.length, 1)
    assert.equal(queued[0].status, 'pending')
    assert.deepEqual(queued[0].payload.fields, ['Name'])
    assert.doesNotMatch(
      JSON.stringify(queued),
      /hooks\.slack\.com|@example\.test|A verified team update|api\/media/,
    )
    assert.equal(posts.length, 0, 'Saving never makes provider calls')
    let delivery = await dispatchReviewNotifications(
      async () => new Response('private provider error', { status: 500 }),
    )
    assert.equal(delivery.retried, 1)
    const retry = (await database.select().from(tables.reviewNotifications))[0]
    assert.equal(retry.lastError, 'http_500')
    assert.equal(
      (await edits.projectEditor(alice, projectKey, 'en')).status,
      'pending',
    )
    await database
      .update(tables.reviewNotifications)
      .set({ nextAttemptAt: new Date(0) })
      .where(eq(tables.reviewNotifications.id, retry.id))
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 1)
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 0)
    assert.equal(posts.length, 1)
    assert.equal(posts[0].options.redirect, 'error')
    assert.equal(
      JSON.parse(posts[0].options.body).blocks[2].elements[0].url,
      'https://www.hackbarna.com/en/account/review?project=' +
        encodeURIComponent(projectKey) +
        '#project-review',
    )
    await nextEdit('Superseded alert fixture')
    await nextEdit('Latest alert fixture')
    delivery = await dispatchReviewNotifications(delivered)
    assert.equal(delivery.cancelled, 1)
    assert.equal(delivery.sent, 1)
    assert.match(posts.at(-1).options.body, /Latest alert fixture/)
    console.log(
      'PASS transactional outbox, provider-failure isolation, bounded retries, acknowledged-message deduplication and stale-revision cancellation',
    )

    const claimKey = 'archive:notification-unknown-fixture'
    const manual = await store.requestProjectClaim(
      stranger,
      claimKey,
      'Please verify my contribution privately',
    )
    const beforeRepeat = await database
      .select()
      .from(tables.reviewNotifications)
    await store.requestProjectClaim(
      stranger,
      claimKey,
      'Updated private claim explanation',
    )
    assert.equal(
      (await database.select().from(tables.reviewNotifications)).length,
      beforeRepeat.length,
    )
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 1)
    assert.doesNotMatch(
      posts.at(-1).options.body,
      /explanation|@example|contribution privately/,
    )
    await store.reviewProjectClaim(
      organiser,
      manual.id,
      'reject',
      'Could not verify this ownership fixture.',
    )
    await store.requestProjectClaim(
      stranger,
      claimKey,
      'New evidence for another review',
    )
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 1)
    const alreadyKnown = await store.requestProjectClaim(
      bob,
      'archive:AQ-App',
      'Please verify this contribution',
    )
    await store.reviewProjectClaim(
      organiser,
      alreadyKnown.id,
      'approve',
      'Verified original team evidence for fixture.',
    )
    const countBefore = posts.length
    assert.equal((await dispatchReviewNotifications(delivered)).cancelled, 1)
    assert.equal(posts.length, countBefore)
    console.log(
      'PASS manual claim alerts, repeated-pending deduplication, resubmission after rejection and cancellation after organiser review',
    )

    await nextEdit('Concurrent worker fixture')
    const concurrentDelivery = await Promise.all([
      dispatchReviewNotifications(delivered),
      dispatchReviewNotifications(delivered),
    ])
    assert.equal(
      concurrentDelivery.reduce((sum, item) => sum + item.sent, 0),
      1,
    )
    await nextEdit('Rate-limit fixture')
    delivery = await dispatchReviewNotifications(
      async () =>
        new Response('rate limited', {
          status: 429,
          headers: { 'Retry-After': '600' },
        }),
    )
    assert.equal(delivery.retried, 1)
    const [rateLimited] = await database
      .select()
      .from(tables.reviewNotifications)
      .where(eq(tables.reviewNotifications.status, 'pending'))
    assert.ok(rateLimited.nextAttemptAt.getTime() > Date.now() + 590000)
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 0)
    const pendingEditor = await edits.projectEditor(alice, projectKey, 'en')
    await edits.reviewProjectEdit(
      organiser,
      projectKey,
      pendingEditor.revision,
      'approve',
      '',
    )
    await database
      .update(tables.reviewNotifications)
      .set({ nextAttemptAt: new Date(0) })
      .where(eq(tables.reviewNotifications.id, rateLimited.id))
    assert.equal((await dispatchReviewNotifications(delivered)).cancelled, 1)
    await nextEdit('Webhook rotation fixture')
    process.env.HACKBARNA_REVIEW_SLACK_WEBHOOK =
      'https://hooks.slack.com/services/T_FIXTURE/B_FIXTURE/ROTATED_TEST_TOKEN'
    assert.equal((await dispatchReviewNotifications(delivered)).cancelled, 1)
    await nextEdit('Abandoned lease fixture')
    const [abandoned] = await database
      .select()
      .from(tables.reviewNotifications)
      .where(eq(tables.reviewNotifications.status, 'pending'))
    await database
      .update(tables.reviewNotifications)
      .set({ status: 'sending', lease: randomUUID(), lockedUntil: new Date(0) })
      .where(eq(tables.reviewNotifications.id, abandoned.id))
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 1)
    await nextEdit('Permanent failure fixture')
    assert.equal(
      (
        await dispatchReviewNotifications(
          async () => new Response('do not log this secret', { status: 404 }),
        )
      ).failed,
      1,
    )
    assert.equal((await dispatchReviewNotifications(delivered)).sent, 0)
    process.env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED = 'false'
    assert.equal((await dispatchReviewNotifications(delivered)).disabled, true)
    const dispatchApi = require('../app/api/internal/review-notifications/route.ts')
    process.env.HACKBARNA_REVIEW_DISPATCH_TOKEN = 'b'.repeat(64)
    assert.equal(
      (
        await dispatchApi.POST(
          new Request('http://localhost/internal', { method: 'POST' }),
        )
      ).status,
      401,
    )
    assert.equal(
      (
        await dispatchApi.POST(
          new Request('http://localhost/internal', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + 'c'.repeat(64) },
          }),
        )
      ).status,
      401,
    )
    const permitted = await dispatchApi.POST(
      new Request('http://localhost/internal', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + 'b'.repeat(64) },
      }),
    )
    assert.equal(permitted.status, 200)
    assert.equal((await permitted.json()).disabled, true)
    console.log(
      'PASS concurrent worker lease, global rate-limit cooldown, rotated destination cancellation, abandoned-lease recovery, permanent failures and dispatcher authentication',
    )
  } finally {
    if (pool) await pool.end()
    await client.query('SET search_path TO public')
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    await client.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
