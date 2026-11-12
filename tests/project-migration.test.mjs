import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  SOURCE_SITE,
  EVENT,
  validateSnapshot,
} from '../scripts/migrate-hacknight-projects.mjs'
import {
  projectListPath,
  projectMetadata,
  projectListSchema,
  serializeJsonLd,
} from '../lib/project-seo.ts'

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
