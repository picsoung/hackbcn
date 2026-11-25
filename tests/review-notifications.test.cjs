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
  reviewNotificationSettings,
  slackReviewPayload,
  reviewText,
} = require('../lib/projects/review-notifications.ts')
const webhook =
  'https://hooks.slack.com/services/T_FIXTURE/B_FIXTURE/TEST_ONLY_NOT_A_TOKEN'
test('review alerts require explicit enablement, a production site and a posting-only Slack endpoint', () => {
  const env = {
    HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED: 'true',
    SITE_ORIGIN: 'https://www.hackbarna.com',
    HACKBARNA_REVIEW_SLACK_WEBHOOK: webhook,
  }
  assert.equal(reviewNotificationSettings(env).enabled, true)
  assert.match(reviewNotificationSettings(env).fingerprint, /^[a-f0-9]{64}$/)
  for (const invalid of [
    'http://hooks.slack.com/services/T/B/key',
    'https://hooks.slack.com.evil.test/services/T/B/key',
    'https://evil.test',
    webhook + '?token=x',
    webhook + '#fragment',
    'https://user:password@hooks.slack.com/services/T/B/key',
    'https://hooks.slack.com:444/services/T/B/key',
  ])
    assert.equal(
      reviewNotificationSettings({
        ...env,
        HACKBARNA_REVIEW_SLACK_WEBHOOK: invalid,
      }).enabled,
      false,
    )
  assert.equal(
    reviewNotificationSettings({
      ...env,
      SITE_ORIGIN: 'https://deploy-preview-77--hackbarna.netlify.app',
    }).enabled,
    false,
  )
  assert.equal(
    reviewNotificationSettings({
      ...env,
      HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED: 'false',
    }).enabled,
    false,
  )
})
test('Slack alerts keep unreviewed text literal, omit personal email and link only to authenticated review', () => {
  const payload = slackReviewPayload(
    {
      kind: 'project_edit',
      project: '<@channel> & <script>',
      event: 'Event',
      actor: 'alice@example.test\nAdmin',
      fields: ['Picture'],
      path: '/en/account/review?project=archive%3Aproject',
    },
    'https://www.hackbarna.com',
  )
  assert.equal(payload.mrkdwn, false)
  assert.equal(payload.unfurl_links, false)
  assert.equal(payload.unfurl_media, false)
  assert.equal(payload.blocks[1].text.type, 'plain_text')
  assert.match(payload.blocks[1].text.text, /<@channel>/)
  assert.doesNotMatch(JSON.stringify(payload), /alice@example\.test/)
  assert.equal(
    payload.blocks[2].elements[0].url,
    'https://www.hackbarna.com/en/account/review?project=archive%3Aproject#project-review',
  )
  assert.throws(() =>
    slackReviewPayload(
      { kind: 'project_edit', fields: [], path: 'https://evil.test/' },
      'https://www.hackbarna.com',
    ),
  )
  assert.equal(reviewText(null, 'Member'), 'Member')
})
test('the Netlify cron bridge stays inert when disabled and never redirects its dispatcher credential', async () => {
  const bridge = await import('../netlify/functions/review-notifications.mjs')
  assert.equal(bridge.config.schedule, '*/5 * * * *')
  const originalFetch = global.fetch
  const saved = { ...process.env }
  let calls = 0
  global.fetch = async (url, options) => {
    calls++
    assert.equal(
      url,
      'https://www.hackbarna.com/api/internal/review-notifications',
    )
    assert.equal(options.redirect, 'error')
    return Response.json({ sent: 0 })
  }
  try {
    delete process.env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED
    await bridge.default()
    assert.equal(calls, 0)
    process.env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED = 'true'
    process.env.HACKBARNA_REVIEW_DISPATCH_TOKEN = 'a'.repeat(64)
    process.env.HACKBARNA_OIDC_REDIRECT_URI =
      'https://codex-preview--hackbarna.netlify.app/auth/callback'
    await bridge.default()
    assert.equal(calls, 0)
    process.env.HACKBARNA_OIDC_REDIRECT_URI =
      'https://www.hackbarna.com/auth/callback'
    await bridge.default()
    assert.equal(calls, 1)
  } finally {
    global.fetch = originalFetch
    for (const key of [
      'HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED',
      'HACKBARNA_REVIEW_DISPATCH_TOKEN',
      'HACKBARNA_OIDC_REDIRECT_URI',
    ]) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
})
