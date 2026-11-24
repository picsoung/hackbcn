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
