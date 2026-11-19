// Opt-in integration check against a running Netlify Dev and its loopback Postgres.
// Uses an isolated fixture, exercises the real session store/routes, then removes it.
const path = require('node:path'),
  assert = require('node:assert/strict'),
  { randomUUID } = require('node:crypto'),
  { execFileSync } = require('node:child_process')
const root = process.cwd()
const original = require('node:module')._resolveFilename
require('node:module')._resolveFilename = function (request, ...args) {
  return original.call(
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
const detail = JSON.parse(
  execFileSync('netlify', ['db', 'connect', '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }),
)
if (
  detail.context !== 'dev' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(
    new URL(detail.connection_string).hostname,
  )
)
  throw Error('Local database required')
process.env.NETLIFY_DB_URL = detail.connection_string
require('@next/env').loadEnvConfig(root)
const { getDb } = require('../db/index.ts'),
  { identityAccounts, identitySessions } = require('../db/schema.ts'),
  { eq } = require('drizzle-orm')
const { getIdentityConfig } = require('../lib/auth/identity-config.ts'),
  {
    createIdentitySession,
    identitySessionStore,
    revokeIdentityToken,
  } = require('../lib/auth/session-store.ts'),
  { sessionTokenHash } = require('../lib/auth/security.ts')
const config = getIdentityConfig(),
  user = {
    id: randomUUID(),
    email: 'local-identity-fixture@example.test',
    emailVerified: true,
    name: 'Local Identity Fixture',
    avatarUrl: null,
  },
  credentials = {
    accessToken: 'fixture-private-access',
    refreshToken: 'fixture-private-refresh',
    expiresAt: Date.now() + 3600000,
  }
;(async () => {
  try {
    const token = await createIdentitySession(config, user, credentials),
      hash = sessionTokenHash(token),
      store = identitySessionStore(config)
    const first = await store.load(hash)
    assert.equal(first.user.id, user.id)
    assert.equal(first.credentials.accessToken, credentials.accessToken)
    const [stored] = await getDb()
      .select()
      .from(identitySessions)
      .where(eq(identitySessions.tokenHash, hash))
    assert.notEqual(stored.tokenHash, token)
    assert.ok(!stored.credentials.includes(credentials.accessToken))
    assert.equal(await store.lock(first.id, 0, 'first', Date.now()), true)
    assert.equal(await store.lock(first.id, 0, 'second', Date.now()), false)
    await store.release(first.id, 'second')
    assert.equal(
      await store.rotate(first.id, 'second', user, credentials),
      false,
    )
    assert.equal(await store.rotate(first.id, 'first', user, credentials), true)
    assert.equal(
      await store.lock(first.id, 0, 'old-version', Date.now()),
      false,
    )
    const session = await fetch('http://localhost:8888/api/auth/session', {
      headers: { cookie: 'hb_session=' + token },
    })
    assert.equal(session.status, 200)
    const publicUser = await session.json()
    assert.equal(publicUser.user.id, user.id)
    assert.ok(!JSON.stringify(publicUser).includes('accessToken'))
    const page = await fetch('http://localhost:8888/en/account', {
      headers: { cookie: 'hb_session=' + token },
    })
    const html = await page.text()
    assert.equal(page.status, 200)
    assert.ok(html.includes(user.name))
    assert.ok(html.includes('noindex'))
    assert.ok(!html.includes(credentials.accessToken))
    const publicPage = await fetch('http://localhost:8888/en', {
      headers: { cookie: 'hb_session=' + token },
    })
    assert.ok(!(await publicPage.text()).includes(user.email))
    const rejected = await fetch('http://localhost:8888/auth/signout', {
      method: 'POST',
      headers: {
        origin: 'https://untrusted.example',
        cookie: 'hb_session=' + token,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'locale=en',
      redirect: 'manual',
    })
    assert.ok(rejected.status >= 400)
    assert.equal(rejected.headers.get('set-cookie'), null)
    assert.ok(await store.load(hash))
    const logout = await fetch('http://localhost:8888/auth/signout', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:8888',
        cookie: 'hb_session=' + token,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'locale=en',
      redirect: 'manual',
    })
    assert.equal(logout.status, 303)
    assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'))
    assert.equal(await store.load(hash), null)
    assert.equal(
      await store.rotate(first.id, 'first', user, credentials),
      false,
    )
    assert.equal(
      (
        await (
          await fetch('http://localhost:8888/api/auth/session', {
            headers: { cookie: 'hb_session=' + token },
          })
        ).json()
      ).user,
      null,
    )
    const nextToken = await createIdentitySession(config, user, credentials)
    const nextHash = sessionTokenHash(nextToken)
    await getDb()
      .update(identitySessions)
      .set({ expiresAt: new Date(Date.now() - 1) })
      .where(eq(identitySessions.tokenHash, nextHash))
    assert.equal(await store.load(nextHash), null)
    await assert.rejects(() =>
      createIdentitySession(
        { ...config, issuer: 'https://different.example.test/auth/v1' },
        user,
        credentials,
      ),
    )
    await revokeIdentityToken(nextToken)
    console.log(
      'PASS: local Postgres encryption, leases/version checks, issuer binding, authenticated API/account, public isolation, CSRF rejection, immediate logout, expired sessions',
    )
  } finally {
    await getDb()
      .delete(identityAccounts)
      .where(eq(identityAccounts.id, user.id))
    console.log('Removed the isolated local fixture and its sessions')
  }
})().then(
  () => process.exit(0),
  () => {
    console.error('Local identity integration check failed')
    process.exit(1)
  },
)
