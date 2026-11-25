const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
const { randomUUID } = require('node:crypto')
const originalResolve = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (name, ...args) {
  return originalResolve.call(
    this,
    name.startsWith('@/') ? path.join(process.cwd(), name.slice(2)) : name,
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
  const url = new URL(process.env.TEST_DATABASE_URL || '')
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname))
  assert.equal(url.pathname, '/hackbarna_test')
  const { Client, Pool } = require('pg')
  const client = new Client({ connectionString: url.href })
  await client.connect()
  const schema = 'communications_' + randomUUID().replaceAll('-', '')
  let pool
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    for (const migration of fs
      .readdirSync('netlify/database/migrations')
      .sort())
      await client.query(
        fs.readFileSync(
          `netlify/database/migrations/${migration}/migration.sql`,
          'utf8',
        ),
      )
    pool = new Pool({
      connectionString: url.href,
      options: `-c search_path=${schema}`,
      max: 6,
    })
    const database = require('drizzle-orm/node-postgres').drizzle({
      client: pool,
    })
    function mock(file, exports) {
      const id = require.resolve(file)
      require.cache[id] = { id, filename: id, loaded: true, exports }
    }
    mock('../db/index.ts', { getDb: () => database })
    let user = null
    mock('../lib/auth/identity-server.ts', {
      getCurrentIdentity: async () => user,
    })
    process.env.HACKBARNA_OIDC_CLIENT_ID = 'fixture'
    process.env.HACKBARNA_OIDC_CLIENT_SECRET = 'fixture-secret'
    process.env.HACKBARNA_OIDC_REDIRECT_URI =
      'http://localhost:8888/auth/callback'
    process.env.HACKBARNA_SESSION_KEY = 'a'.repeat(64)
    process.env.HACKBARNA_CONTACT_SYNC_ENABLED = 'false'
    process.env.SITE_ORIGIN = 'https://www.hackbarna.com'
    const route = require('../app/api/account/preferences/route.ts')
    const store = require('../lib/account/communication-store.ts')
    const { accountCommunications } = require('../db/schema.ts')
    const { eq } = require('drizzle-orm')
    const { NextRequest } = require('next/server')
    const request = (body, origin = 'http://localhost:8888') =>
      new NextRequest('http://localhost:8888/api/account/preferences', {
        method: body ? 'PATCH' : 'GET',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        ...(body
          ? { body: typeof body === 'string' ? body : JSON.stringify(body) }
          : {}),
      })
    const actor = () => ({
      id: randomUUID(),
      name: 'Builder',
      email: 'builder@example.test',
      emailVerified: true,
      avatarUrl: null,
    })
    const alice = actor(),
      bob = actor()
    assert.equal((await route.GET(request())).status, 401)
    user = alice
    assert.equal(
      (await (await route.GET(request())).json()).preferences
        .communicationLanguage,
      null,
    )
    const patch = await route.PATCH(
      request({ communicationLanguage: 'ca', revision: 0 }),
    )
    assert.equal(patch.status, 200)
    assert.equal((await patch.json()).preferences.revision, 1)
    assert.equal(
      (await route.PATCH(request({ communicationLanguage: 'es', revision: 0 })))
        .status,
      409,
    )
    assert.equal(
      (
        await route.PATCH(
          request({
            communicationLanguage: 'en',
            revision: 1,
            accountId: bob.id,
          }),
        )
      ).status,
      400,
    )
    assert.equal(
      (
        await route.PATCH(
          request(
            { communicationLanguage: 'en', revision: 1 },
            'https://attacker.test',
          ),
        )
      ).status,
      403,
    )
    assert.equal((await route.PATCH(request('x'.repeat(3000)))).status, 413)
    user = { ...alice, emailVerified: false }
    assert.equal(
      (await route.PATCH(request({ communicationLanguage: 'en', revision: 1 })))
        .status,
      403,
    )
    user = bob
    assert.equal(
      (await (await route.GET(request())).json()).preferences.revision,
      0,
    )
    process.env.HACKBARNA_CONTACT_SYNC_ENABLED = 'true'
    process.env.HACKBARNA_RESEND_API_KEY = 'fixture-not-a-real-key'
    let calls = 0
    await store.dispatchContactPreferences(alice.id, async () => {
      calls++
      return new Response(null, { status: 500 })
    })
    assert.equal(calls, 1)
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).communicationLanguage,
      'ca',
    )
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).contactSync,
      'pending',
    )
    await database
      .update(accountCommunications)
      .set({ nextAttemptAt: new Date(0) })
      .where(eq(accountCommunications.accountId, alice.id))
    await store.dispatchContactPreferences(alice.id, async () =>
      Response.json({ id: 'contact' }),
    )
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).contactSync,
      'synced',
    )
    await store.dispatchContactPreferences(alice.id, async () => {
      throw Error('Already synced contact should not be sent again')
    })
    await store.saveCommunicationPreferences(alice, {
      communicationLanguage: 'en',
      revision: 1,
    })
    await store.dispatchContactPreferences(alice.id, async () => {
      await store.saveCommunicationPreferences(alice, {
        communicationLanguage: 'es',
        revision: 2,
      })
      return Response.json({ id: 'contact' })
    })
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).contactSync,
      'pending',
    )
    await store.dispatchContactPreferences(alice.id, async (_, options) => {
      assert.equal(
        JSON.parse(options.body).properties.communication_language,
        'es',
      )
      return Response.json({ id: 'contact' })
    })
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).contactSync,
      'synced',
    )
    process.env.HACKBARNA_INVITATION_KEY = 'f'.repeat(64)
    const optOut = require('../lib/email/invitation-opt-out.ts')
    const optOutStore = require('../lib/email/invitation-opt-out-store.ts')
    const optOutRoute = require('../app/api/invitations/unsubscribe/route.ts')
    assert.equal(
      await optOutStore.profileInvitationsStopped('recipient@example.test'),
      false,
    )
    assert.equal(await optOutStore.stopProfileInvitations('forged'), false)
    const token = optOut.invitationOptOutToken('recipient@example.test')
    assert.equal(
      (
        await optOutRoute.GET(
          new Request(
            `http://localhost:8888/api/invitations/unsubscribe?token=${token}`,
          ),
        )
      ).status,
      303,
    )
    assert.equal(
      await optOutStore.profileInvitationsStopped('recipient@example.test'),
      false,
    )
    const unsubscribe = (body) =>
      new Request('http://localhost:8888/api/invitations/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
    const savedOptOut = await optOutRoute.POST(
      unsubscribe(new URLSearchParams({ token, locale: 'ca' })),
    )
    assert.equal(savedOptOut.status, 303)
    assert.equal(
      savedOptOut.headers.get('location'),
      '/ca/invitations/unsubscribe?done=1',
    )
    assert.equal(savedOptOut.headers.get('cache-control'), 'private, no-store')
    assert.equal(
      await optOutStore.profileInvitationsStopped('recipient@example.test'),
      true,
    )
    assert.equal(
      await optOutStore.profileInvitationsStopped('other@example.test'),
      false,
    )
    await optOutRoute.POST(
      unsubscribe(new URLSearchParams({ token, locale: 'ca' })),
    )
    const optedOutRows = await pool.query(
      'SELECT * FROM profile_invitation_opt_outs',
    )
    assert.equal(optedOutRows.rows.length, 1)
    assert.equal(
      JSON.stringify(optedOutRows.rows).includes('recipient@example.test'),
      false,
    )
    assert.equal(
      (await optOutRoute.POST(unsubscribe('x'.repeat(1500)))).status,
      413,
    )
    const oneClickToken = optOut.invitationOptOutToken('one-click@example.test')
    const oneClick = new Request(
      `http://localhost:8888/api/invitations/unsubscribe?token=${oneClickToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'List-Unsubscribe=One-Click',
      },
    )
    assert.equal((await optOutRoute.POST(oneClick)).status, 200)
    assert.equal(
      await optOutStore.profileInvitationsStopped('one-click@example.test'),
      true,
    )
    // Opting out cannot alter the account language or newsletter properties.
    assert.equal(
      (await store.getCommunicationPreferences(alice.id)).communicationLanguage,
      'es',
    )
    console.log(
      'PASS private preferences, account isolation, durable retry, newer-save race and signed invitation-only opt-outs',
    )
  } finally {
    await pool?.end()
    await client.query(`DROP SCHEMA "${schema}" CASCADE`)
    await client.end()
  }
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
