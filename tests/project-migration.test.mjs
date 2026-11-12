import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  SOURCE_SITE,
  EVENT,
  validateSnapshot,
  importedScreenshotKey,
} from '../scripts/migrate-hacknight-projects.mjs'
import {
  projectListPath,
  projectMetadata,
  projectListSchema,
  serializeJsonLd,
  validProjectDate,
} from '../lib/project-seo.ts'
import { imageType } from '../lib/live/media.ts'

function fixture() {
  return {
    version: 1,
    sourceSite: SOURCE_SITE,
    event: EVENT,
    projects: [
      {
        id: 3,
        slug: 'router',
        name: 'Router',
        tagline: 'Route tickets',
        url: 'https://example.com',
        creator_name: 'Builder',
        creator_email: 'builder@example.invalid',
        linkedin_url: 'https://linkedin.com/in/builder',
        share_consent: false,
        vote_count: 1,
        share_count: 2,
        created_at: '2026-11-10T19:00:00Z',
        screenshot_key: 'router-abcdef12',
        used_lovable: true,
        jev_usage: 'Routes requests',
        judge_impact: 0.8,
        judge_creativity: 0.7,
        judge_jev_use: 0.9,
        judge_score: 78,
      },
    ],
    votes: [
      {
        project_id: 3,
        voter_id: '12345678-1234-1234-1234-123456789abc',
        created_at: '2026-11-10T19:01:00Z',
      },
    ],
  }
}

test('migration validates complete projects and actual vote records without changing consent', () => {
  const data = fixture()
  assert.deepEqual(validateSnapshot(data), { projects: 1, votes: 1 })
  assert.equal(data.projects[0].share_consent, false)
})

test('migration rejects missing votes, wrong sources, orphans and duplicate identities', () => {
  for (const change of [
    (data) => {
      data.votes = []
    },
    (data) => {
      data.sourceSite = 'another-site'
    },
    (data) => {
      data.event = 'another-event'
    },
    (data) => {
      data.votes[0].project_id = 99
    },
    (data) => {
      data.votes.push({ ...data.votes[0] })
    },
    (data) => {
      data.projects.push({ ...data.projects[0] })
    },
    (data) => {
      delete data.projects[0].share_consent
    },
    (data) => {
      data.projects[0].created_at = 'invalid'
    },
    (data) => {
      data.projects[0].unhandled_source_column = true
    },
  ]) {
    const data = fixture()
    change(data)
    assert.throws(() => validateSnapshot(data))
  }
})

test('project metadata and list discovery use the exact project URL', () => {
  const path = projectListPath('es', EVENT, 'router')
  const meta = projectMetadata(path, 'Router', 'Route tickets')
  assert.ok(String(meta.alternates.canonical).endsWith(path))
  assert.equal(meta.openGraph.url, meta.alternates.canonical)
  assert.deepEqual(meta.alternates.languages, {})
  const schema = projectListSchema(
    'Event projects',
    projectListPath('es', EVENT),
    [{ name: 'Router', path }],
  )
  assert.equal(schema.numberOfItems, 1)
  assert.ok(schema.itemListElement[0].url.endsWith(path))
})

test('JSON-LD cannot be escaped by a submitted script tag', () => {
  const payload = { name: '</script><script>alert(1)</script>' }
  const serialized = serializeJsonLd(payload)
  assert.ok(!serialized.includes('<'))
  assert.deepEqual(JSON.parse(serialized), payload)
})

test('screenshot migration namespaces safe keys and rejects traversal', () => {
  assert.equal(
    importedScreenshotKey('router-abcd1234'),
    `${EVENT}/router-abcd1234`,
  )
  for (const key of [
    '../private',
    '/absolute',
    'folder/file',
    '',
    '__proto__',
  ]) {
    assert.throws(() => importedScreenshotKey(key))
  }
})

test('screenshot responses recognize raster images and reject executable formats', () => {
  assert.equal(
    imageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0])),
    'image/png',
  )
  assert.equal(imageType(new Uint8Array([0xff, 0xd8, 0xff, 0])), 'image/jpeg')
  assert.equal(
    imageType(new TextEncoder().encode('<svg onload="alert(1)"></svg>')),
    null,
  )
})

test('missing or invalid archive dates are omitted from sitemap metadata', () => {
  assert.equal(validProjectDate(new Date('invalid')), undefined)
  assert.equal(validProjectDate(undefined), undefined)
  assert.equal(validProjectDate(null), undefined)
  assert.equal(
    validProjectDate('2024-06-30').toISOString(),
    '2024-06-30T00:00:00.000Z',
  )
})
