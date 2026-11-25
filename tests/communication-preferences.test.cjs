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
  validateCommunicationPreference,
} = require('../lib/account/communications.ts')

test('unknown language remains null and browser fields cannot choose another account or email', () => {
  assert.deepEqual(
    validateCommunicationPreference({
      communicationLanguage: null,
      revision: 0,
    }),
    { communicationLanguage: null, revision: 0 },
  )
  for (const input of [
    { communicationLanguage: 'fr', revision: 0 },
    { communicationLanguage: 'en', revision: 0, email: 'other@example.test' },
    { communicationLanguage: 'en', revision: 0, accountId: 'other' },
    { communicationLanguage: 'ca', revision: -1 },
  ])
    assert.throws(() => validateCommunicationPreference(input))
})

test('contact-property updates never send mail, subscribe an existing contact or change newsletter segments', async () => {
  const { syncResendCommunicationLanguage } = await import(
    '../lib/account/resend-contact.mjs'
  )
  const calls = []
  await syncResendCommunicationLanguage(
    { email: 'builder@example.test', language: 'ca', apiKey: 'fixture' },
    async (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) })
      return Response.json({ id: 'contact' })
    },
  )
  assert.equal(calls.length, 1)
  assert.equal(
    calls[0].url,
    'https://api.resend.com/contacts/builder%40example.test',
  )
  assert.equal(calls[0].options.method, 'PATCH')
  assert.equal(calls[0].options.redirect, 'error')
  assert.deepEqual(calls[0].body, {
    properties: { communication_language: 'ca' },
  })
})

test('a new contact remains unsubscribed; rate limits expose only a retry delay and generic status', async () => {
  const { syncResendCommunicationLanguage } = await import(
    '../lib/account/resend-contact.mjs'
  )
  const calls = []
  await syncResendCommunicationLanguage(
    { email: 'builder@example.test', language: null, apiKey: 'fixture' },
    async (url, options) => {
      calls.push(JSON.parse(options.body))
      return calls.length === 1
        ? new Response(null, { status: 404 })
        : Response.json({ id: 'contact' })
    },
  )
  assert.deepEqual(calls[1], {
    email: 'builder@example.test',
    properties: { communication_language: 'all' },
    unsubscribed: true,
  })
  await assert.rejects(
    syncResendCommunicationLanguage(
      { email: 'builder@example.test', language: 'en', apiKey: 'fixture' },
      async () =>
        new Response('private provider detail', {
          status: 429,
          headers: { 'retry-after': '600' },
        }),
    ),
    (error) => error.message === 'contact_http_429' && error.retryAfter === 600,
  )
})
