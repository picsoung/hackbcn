import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { getAuthCookieOptions, getSafeReturnPath } from '../lib/auth/shared.ts'
import {
  DIGEST_ISSUER,
  getIdentityConfig,
} from '../lib/auth/identity-config.ts'
import {
  identityCookieName,
  randomSessionToken,
  sessionTokenHash,
  seal,
  unseal,
  readTransaction,
} from '../lib/auth/security.ts'
import { beginSignIn, finishSignIn, refreshIdentity } from '../lib/auth/oidc.ts'
import {
  IdentityUnavailable,
  resolveIdentitySession,
} from '../lib/auth/session-engine.ts'

const key = randomBytes(32).toString('hex')
const subject = '9bb7e222-bbcb-4abc-8cee-d7d7988c27b1'
const account = {
  id: subject,
  email: 'member@example.test',
  emailVerified: true,
  name: 'Example Builder',
  avatarUrl: null,
}
const config = {
  issuer: 'https://identity.example.test/auth/v1',
  clientId: 'website-client',
  clientSecret: 'server-client-secret',
  redirectUri: 'https://website.example.test/auth/callback',
  encryptionKey: key,
}

function provider(overrides = {}) {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  })
  const rogue = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey
  const jwk = {
    ...publicKey.export({ format: 'jwk' }),
    kid: 'test-key',
    alg: 'ES256',
    use: 'sig',
  }
  const state = {
    nonce: '',
    challenge: '',
    used: new Set(),
    calls: [],
    ...overrides,
  }
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  const metadata = {
    issuer: config.issuer,
    authorization_endpoint: config.issuer + '/authorize',
    token_endpoint: config.issuer + '/token',
    userinfo_endpoint: config.issuer + '/userinfo',
    jwks_uri: config.issuer + '/jwks',
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['ES256'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    code_challenge_methods_supported: ['S256'],
    ...overrides.metadata,
  }
  function jwt() {
    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: config.issuer,
      aud: config.clientId,
      sub: subject,
      iat: now,
      exp: now + 3600,
      nonce: state.nonce,
      ...state.claims,
    }
    const body = [
      Buffer.from(JSON.stringify({ alg: 'ES256', kid: 'test-key' })).toString(
        'base64url',
      ),
      Buffer.from(JSON.stringify(claims)).toString('base64url'),
    ].join('.')
    return (
      body +
      '.' +
      sign('sha256', Buffer.from(body), {
        key: state.badSignature ? rogue : privateKey,
        dsaEncoding: 'ieee-p1363',
      }).toString('base64url')
    )
  }
  const fetch = async (input, init) => {
    const url = String(input)
    state.calls.push({ url, method: init?.method ?? 'GET' })
    if (url.includes('.well-known/openid-configuration')) return json(metadata)
    if (url === metadata.jwks_uri) return json({ keys: [jwk] })
    if (url === metadata.token_endpoint) {
      const form = new URLSearchParams(init.body)
      assert.equal(form.get('client_id'), config.clientId)
      assert.equal(form.get('client_secret'), config.clientSecret)
      if (form.get('grant_type') === 'authorization_code') {
        const code = form.get('code')
        const challenge = createHash('sha256')
          .update(form.get('code_verifier') || '')
          .digest('base64url')
        if (
          code !== 'valid-code' ||
          state.used.has(code) ||
          challenge !== state.challenge
        )
          return json({ error: 'invalid_grant' }, 400)
        state.used.add(code)
        assert.equal(form.get('redirect_uri'), config.redirectUri)
      } else {
        assert.equal(form.get('grant_type'), 'refresh_token')
        assert.equal(form.get('refresh_token'), 'refresh-one')
      }
      return json({
        access_token: 'access-token',
        refresh_token: 'refresh-two',
        token_type: 'Bearer',
        expires_in: 3600,
        ...(state.omitIdToken ? {} : { id_token: jwt() }),
      })
    }
    if (url === metadata.userinfo_endpoint)
      return json({
        sub: subject,
        name: account.name,
        email: account.email,
        email_verified: true,
        private_role: 'not-public',
        ...state.userinfo,
      })
    throw new Error('Unexpected test-provider request: ' + url)
  }
  const begin = async () => {
    const result = await beginSignIn(config, '/fr/projects', 'fr', fetch)
    state.nonce = result.transaction.nonce
    state.challenge = result.url.searchParams.get('code_challenge')
    const callback = new URL(config.redirectUri)
    callback.searchParams.set('state', result.transaction.state)
    callback.searchParams.set('code', 'valid-code')
    return { ...result, callback }
  }
  return { state, fetch, begin }
}

test('configuration uses the existing issuer and fails closed when incomplete or unsafe', () => {
  assert.equal(getIdentityConfig({}), null)
  const env = {
    HACKBARNA_OIDC_CLIENT_ID: 'client',
    HACKBARNA_OIDC_CLIENT_SECRET: 'secret',
    HACKBARNA_OIDC_REDIRECT_URI: 'http://localhost:8888/auth/callback',
    HACKBARNA_SESSION_KEY: key,
  }
  assert.equal(getIdentityConfig(env).issuer, DIGEST_ISSUER)
  for (const change of [
    { HACKBARNA_SESSION_KEY: 'short' },
    { HACKBARNA_OIDC_ISSUER: 'http://evil.test' },
    {
      HACKBARNA_OIDC_REDIRECT_URI: 'http://website.example.test/auth/callback',
    },
    {
      HACKBARNA_OIDC_REDIRECT_URI:
        'https://website.example.test/auth/callback?next=https://evil.test',
    },
  ])
    assert.throws(() => getIdentityConfig({ ...env, ...change }))
})

test('production session cookies are HttpOnly, host-only and protected against sibling-domain cookie shadowing', () => {
  for (const host of [
    'hackbarna.com',
    'www.hackbarna.com',
    'digest.hackbarna.com',
  ]) {
    assert.deepEqual(getAuthCookieOptions(host), {
      path: '/',
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
    })
  }
  assert.equal(getAuthCookieOptions('localhost').secure, false)
  assert.equal(identityCookieName('session', true), '__Host-hb_session')
  assert.equal(
    identityCookieName('transaction', true),
    '__Host-hb_auth_transaction',
  )
  assert.equal(identityCookieName('session', false), 'hb_session')
  const token = randomSessionToken()
  assert.equal(token.length, 43)
  assert.notEqual(sessionTokenHash(token), token)
  assert.equal(sessionTokenHash('user-controlled-short-cookie'), null)
})

test('return paths reject external destinations, callback loops and encoded redirect tricks', () => {
  const fallback = '/en/account'
  for (const value of [
    null,
    '',
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/%2f%2fevil.test',
    '/%5cevil.test',
    '/%0aevil',
    '/bad\npath',
    '/bad%escape',
    ['/en/projects', '/fr/projects'],
    '/' + 'a'.repeat(1025),
    '/fr/auth/complete',
    '/auth/start',
    '/auth/callback?code=x',
    '/auth/signout',
    '/en/auth?next=/en/auth',
  ])
    assert.equal(getSafeReturnPath(value, fallback), fallback, String(value))
  assert.equal(
    getSafeReturnPath('/es/projects/demo?tab=team#members', fallback),
    '/es/projects/demo?tab=team#members',
  )
})

test('encrypted credentials reject tampering, wrong keys and transaction/credential substitution', () => {
  const value = {
    accessToken: 'private-access',
    refreshToken: 'private-refresh',
  }
  const encrypted = seal(value, key, 'credentials')
  assert.deepEqual(unseal(encrypted, key, 'credentials'), value)
  assert.ok(!encrypted.includes('private-access'))
  assert.throws(() =>
    unseal(encrypted, randomBytes(32).toString('hex'), 'credentials'),
  )
  assert.throws(() => unseal(encrypted, key, 'transaction'))
  const parts = encrypted.split('.')
  parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1)
  assert.throws(() => unseal(parts.join('.'), key, 'credentials'))
})

test('sign-in uses distinct state, nonce and S256 PKCE; no secret or verifier enters the authorization URL', async () => {
  const p = provider(),
    first = await p.begin(),
    second = await p.begin()
  assert.equal(first.url.searchParams.get('code_challenge_method'), 'S256')
  assert.equal(first.url.searchParams.get('response_type'), 'code')
  assert.equal(
    first.url.searchParams.get('scope'),
    'openid profile email offline_access',
  )
  assert.notEqual(first.transaction.state, second.transaction.state)
  assert.notEqual(first.transaction.nonce, second.transaction.nonce)
  assert.notEqual(first.transaction.verifier, second.transaction.verifier)
  assert.ok(!first.url.href.includes(config.clientSecret))
  assert.ok(!first.url.href.includes(first.transaction.verifier))
  const sealed = seal(first.transaction, key, 'transaction')
  assert.deepEqual(
    readTransaction(sealed, key, config.redirectUri),
    first.transaction,
  )
  assert.throws(() =>
    readTransaction(
      sealed,
      key,
      config.redirectUri,
      first.transaction.expiresAt,
    ),
  )
  assert.throws(() =>
    readTransaction(sealed, key, 'https://other.test/auth/callback'),
  )
})

test('the code exchange verifies a signed identity, allowlists user fields and rejects replay', async () => {
  const p = provider(),
    start = await p.begin()
  const result = await finishSignIn(
    config,
    start.callback,
    start.transaction,
    p.fetch,
  )
  assert.deepEqual(result.user, account)
  assert.equal(result.credentials.refreshToken, 'refresh-two')
  assert.ok(result.credentials.expiresAt > Date.now())
  assert.ok(!JSON.stringify(result.user).includes('private_role'))
  assert.ok(p.state.calls.some((c) => c.url.endsWith('/jwks')))
  await assert.rejects(() =>
    finishSignIn(config, start.callback, start.transaction, p.fetch),
  )
})

test('mismatched state is rejected before exchanging a code', async () => {
  const p = provider(),
    start = await p.begin()
  start.callback.searchParams.set('state', 'wrong-state')
  await assert.rejects(() =>
    finishSignIn(config, start.callback, start.transaction, p.fetch),
  )
  assert.ok(!p.state.calls.some((c) => c.url.endsWith('/token')))
})

test('PKCE mismatch cannot obtain an identity', async () => {
  const p = provider(),
    start = await p.begin()
  await assert.rejects(() =>
    finishSignIn(
      config,
      start.callback,
      { ...start.transaction, verifier: randomSessionToken() },
      p.fetch,
    ),
  )
})

for (const [label, changes] of [
  ['nonce', { claims: { nonce: 'different-nonce' } }],
  ['issuer', { claims: { iss: 'https://evil.test' } }],
  ['audience', { claims: { aud: 'other-client' } }],
  ['expiry', { claims: { exp: Math.floor(Date.now() / 1000) - 600 } }],
  ['signature', { badSignature: true }],
  ['missing ID token', { omitIdToken: true }],
  [
    'userinfo subject',
    { userinfo: { sub: 'f3fa303a-7bca-4b48-8e1e-b8262f08d839' } },
  ],
])
  test(`untrusted ${label} is rejected`, async () => {
    const p = provider(changes),
      start = await p.begin()
    await assert.rejects(() =>
      finishSignIn(config, start.callback, start.transaction, p.fetch),
    )
  })

test('provider discovery cannot redirect credentials to an unrelated token host', async () => {
  const p = provider({
    metadata: { token_endpoint: 'https://evil.test/token' },
  })
  await assert.rejects(() => p.begin())
  assert.ok(!p.state.calls.some((c) => c.url.startsWith('https://evil.test')))
})

test('refresh rotates credentials and verifies that userinfo retains the original subject', async () => {
  const p = provider(),
    start = await p.begin()
  const result = await refreshIdentity(
    config,
    { accessToken: 'old', refreshToken: 'refresh-one', expiresAt: 0 },
    subject,
    p.fetch,
  )
  assert.equal(result.credentials.refreshToken, 'refresh-two')
  assert.equal(result.user.id, subject)
  p.state.userinfo = { sub: 'f3fa303a-7bca-4b48-8e1e-b8262f08d839' }
  await assert.rejects(() =>
    refreshIdentity(
      config,
      { accessToken: 'old', refreshToken: 'refresh-one', expiresAt: 0 },
      subject,
      p.fetch,
    ),
  )
})

function memoryStore(overrides = {}) {
  let row = {
    id: 'session',
    user: account,
    credentials: {
      accessToken: 'old',
      refreshToken: 'refresh-one',
      expiresAt: Date.now() - 1,
    },
    expiresAt: Date.now() + 86400000,
    revoked: false,
    refreshVersion: 0,
    ...overrides,
  }
  let lease = null
  return {
    get row() {
      return row
    },
    async load() {
      return structuredClone(row)
    },
    async lock(id, version, next) {
      if (lease || row.revoked || version !== row.refreshVersion) return false
      lease = next
      return true
    },
    async rotate(id, expected, user, credentials) {
      if (row.revoked || expected !== lease) return false
      row = {
        ...row,
        user,
        credentials,
        refreshVersion: row.refreshVersion + 1,
      }
      lease = null
      return true
    },
    async release(id, expected) {
      if (lease === expected) lease = null
    },
    async revoke() {
      row.revoked = true
      lease = null
    },
  }
}
const rotated = () => ({
  user: account,
  credentials: {
    accessToken: 'new',
    refreshToken: 'rotated',
    expiresAt: Date.now() + 3600000,
  },
})

test('revoked and absolutely expired sessions are denied without provider calls', async () => {
  for (const override of [{ revoked: true }, { expiresAt: Date.now() - 1 }]) {
    const store = memoryStore(override)
    assert.equal(
      await resolveIdentitySession(
        'hash',
        store,
        () => {
          throw Error('must not call')
        },
        () => false,
      ),
      null,
    )
  }
})

test('concurrent expired-session reads share one refresh and cannot rotate stale credentials', async () => {
  const store = memoryStore()
  let calls = 0
  const refresh = async () => {
    calls++
    await new Promise((r) => setTimeout(r, 5))
    return rotated()
  }
  const users = await Promise.all([
    resolveIdentitySession('hash', store, refresh, () => false),
    resolveIdentitySession('hash', store, refresh, () => false),
  ])
  assert.equal(calls, 1)
  assert.equal(store.row.refreshVersion, 1)
  assert.ok(users.every((u) => u.id === subject))
  assert.ok(!JSON.stringify(users).includes('accessToken'))
})

test('logout during a refresh cannot resurrect a session', async () => {
  const store = memoryStore()
  assert.equal(
    await resolveIdentitySession(
      'hash',
      store,
      async () => {
        await store.revoke()
        return rotated()
      },
      () => false,
    ),
    null,
  )
})

test('a refresh returning a different identity revokes the session', async () => {
  const store = memoryStore()
  assert.equal(
    await resolveIdentitySession(
      'hash',
      store,
      async () => ({ ...rotated(), user: { ...account, id: 'other-user' } }),
      () => false,
    ),
    null,
  )
  assert.equal(store.row.revoked, true)
})

test('revoked refresh grants log out; transport failures preserve the cookie but deny expired access', async () => {
  const denied = memoryStore()
  assert.equal(
    await resolveIdentitySession(
      'hash',
      denied,
      async () => {
        throw Error('revoked')
      },
      () => true,
    ),
    null,
  )
  assert.equal(denied.row.revoked, true)
  const offline = memoryStore()
  await assert.rejects(
    () =>
      resolveIdentitySession(
        'hash',
        offline,
        async () => {
          throw Error('offline')
        },
        () => false,
      ),
    IdentityUnavailable,
  )
  assert.equal(offline.row.revoked, false)
})
