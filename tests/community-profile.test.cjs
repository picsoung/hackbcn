const assert = require('node:assert/strict')
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})
const { test } = require('node:test')
const { generateKeyPairSync } = require('node:crypto')
const { SignJWT, createLocalJWKSet } = require('jose')
const {
  validateCommunityProfile,
  profileMatchesLinks,
  ProfileValidationError,
} = require('../lib/community/profile.ts')
const { verifyProfileBearer } = require('../lib/auth/profile-bearer.ts')
const input = {
  displayName: 'A Builder',
  bio: 'Building useful things',
  avatarUrl: 'https://images.example.test/avatar.jpg',
  linkedinUrl: 'https://linkedin.com/in/a-builder/?tracking=discard',
  githubUrl: 'https://github.com/a-builder',
  revision: 0,
}
const subject = '30000000-0000-4000-a000-000000000001'
const { privateKey, publicKey } = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
})
const keys = createLocalJWKSet({
  keys: [
    { ...publicKey.export({ format: 'jwk' }), alg: 'ES256', kid: 'fixture' },
  ],
})
async function token(
  extra = {},
  issuer = 'https://usfkgslefvtrtlwexnfo.supabase.co/auth/v1',
) {
  return new SignJWT({
    sub: subject,
    aud: 'authenticated',
    role: 'authenticated',
    user_metadata: {
      full_name: 'Builder',
      avatar_url: 'https://images.example.test/me.jpg',
    },
    ...extra,
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'fixture' })
    .setIssuer(issuer)
    .setIssuedAt()
    .setExpirationTime(extra.exp ?? '5m')
    .sign(privateKey)
}
test('profile changes allowlist community fields and normalize personal links', () => {
  const profile = validateCommunityProfile({
    ...input,
    accountId: 'someone-else',
    email: 'private@example.test',
    role: 'admin',
    ownershipVerified: true,
  })
  assert.equal(profile.linkedinUrl, 'https://www.linkedin.com/in/a-builder/')
  assert.deepEqual(Object.keys(profile).sort(), Object.keys(input).sort())
  assert.ok(!JSON.stringify(profile).includes('private@example'))
})
test('profile validation rejects unsafe images, fake social hosts, repository URLs, oversized fields and invalid revisions', () => {
  for (const change of [
    { displayName: '' },
    { displayName: 'x'.repeat(121) },
    { bio: 'x'.repeat(601) },
    { avatarUrl: 'javascript:alert(1)' },
    { avatarUrl: 'https://secret@host.test/pic' },
    { linkedinUrl: 'https://linkedin.com.evil.test/in/person' },
    { linkedinUrl: 'https://www.linkedin.com/in/a%2Fb' },
    { githubUrl: 'https://github.com/owner/repository' },
    { githubUrl: 'http://github.com/user' },
    { revision: -1 },
    { revision: 1.2 },
  ])
    assert.throws(
      () => validateCommunityProfile({ ...input, ...change }),
      ProfileValidationError,
    )
})
test('project credits match canonical public links only, never a display name', () => {
  const profile = validateCommunityProfile(input)
  assert.ok(
    profileMatchesLinks(profile, {
      linkedin: 'https://www.linkedin.com/in/A-Builder/?source=other',
    }),
  )
  assert.ok(
    !profileMatchesLinks(
      { ...profile, linkedinUrl: '', githubUrl: '' },
      { name: 'A Builder' },
    ),
  )
  assert.ok(
    !profileMatchesLinks(profile, {
      linkedin: 'https://www.linkedin.com/in/someone-else/',
    }),
  )
  assert.ok(!('ownershipVerified' in profile))
})
test('shared profile API accepts direct Digest accounts and explicitly trusted OAuth clients', async () => {
  const direct = await verifyProfileBearer(await token(), [], keys)
  assert.equal(direct.id, subject)
  assert.ok(!('email' in direct))
  const trusted = await verifyProfileBearer(
    await token({ client_id: 'our-site' }),
    ['our-site'],
    keys,
  )
  assert.equal(trusted.id, subject)
})
test('an approved third-party OAuth token cannot use the shared profile API', async () => {
  await assert.rejects(async () =>
    verifyProfileBearer(
      await token({ client_id: 'untrusted-mcp' }),
      ['our-site'],
      keys,
    ),
  )
})
test('shared profile API rejects anonymous, expired, wrong-audience and wrong-issuer identities', async () => {
  for (const extra of [
    { is_anonymous: true },
    { aud: 'other-api' },
    { exp: 0 },
    { sub: 'not-a-user-id' },
    { client_id: 7 },
  ])
    await assert.rejects(async () =>
      verifyProfileBearer(await token(extra), [], keys),
    )
  await assert.rejects(async () =>
    verifyProfileBearer(
      await token({}, 'https://rogue.example.test'),
      [],
      keys,
    ),
  )
})
