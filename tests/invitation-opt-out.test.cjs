const assert = require('node:assert/strict')
const { test } = require('node:test')
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})
const {
  invitationEmailHash,
  invitationOptOutToken,
  verifyInvitationOptOutToken,
} = require('../lib/email/invitation-opt-out.ts')
const key = 'a'.repeat(64)

test('unsubscribe capability contains no address and identifies only the exact canonical recipient', () => {
  const token = invitationOptOutToken(' Ada@Example.test ', key)
  assert.equal(token, invitationOptOutToken('ada@example.test', key))
  assert.equal(
    verifyInvitationOptOutToken(token, key),
    invitationEmailHash('ada@example.test', key),
  )
  assert.doesNotMatch(token, /ada|example|@/i)
  assert.notEqual(
    invitationEmailHash('a.da@example.test', key),
    invitationEmailHash('ada@example.test', key),
  )
  assert.notEqual(
    invitationEmailHash('ada+other@example.test', key),
    invitationEmailHash('ada@example.test', key),
  )
})

test('forged recipients, signatures, foreign keys and oversized input cannot opt anyone out', () => {
  const token = invitationOptOutToken('ada@example.test', key)
  const parts = token.split('.')
  assert.equal(
    verifyInvitationOptOutToken(`v1.${'0'.repeat(64)}.${parts[2]}`, key),
    null,
  )
  assert.equal(
    verifyInvitationOptOutToken(
      `${parts[0]}.${parts[1]}.${'A'.repeat(43)}`,
      key,
    ),
    null,
  )
  assert.equal(verifyInvitationOptOutToken(token, 'b'.repeat(64)), null)
  for (const value of [
    null,
    '',
    {},
    'v2.' + token,
    token + 'A',
    'a'.repeat(10000),
  ])
    assert.equal(verifyInvitationOptOutToken(value, key), null)
  assert.throws(() => invitationOptOutToken('bad-address', key))
  assert.throws(() => invitationOptOutToken('ada@example.test', 'missing'))
})
