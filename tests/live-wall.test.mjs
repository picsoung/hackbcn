import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getLiveEvent, wallPath } from '../lib/live/config.ts'
import {
  projectHackers,
  slugify,
  validateProject,
  videoEmbed,
} from '../lib/live/validate.ts'

const project = {
  name: 'Café Router',
  tagline: 'Route community questions to the right volunteer.',
  url: 'example.com/demo',
  creatorName: 'Preview Builder',
  creatorEmail: 'BUILDER@example.test',
  linkedinUrl: 'https://www.linkedin.com/in/preview-builder',
}

test('only configured events have live walls, including prototype-like slugs', () => {
  assert.equal(
    wallPath('en', 'hacknight-5-jevathon-2026'),
    '/en/events/hacknight-5-jevathon-2026#projects',
  )
  assert.equal(
    getLiveEvent('hacknight-5-jevathon-2026')?.slug,
    'hacknight-5-jevathon-2026',
  )
  for (const slug of ['unknown', '__proto__', 'constructor', 'toString']) {
    assert.equal(getLiveEvent(slug), null)
  }
  assert.equal(
    wallPath('es', 'hacknight-5-jevathon-2026', 'cafe-router'),
    '/es/events/hacknight-5-jevathon-2026/projects/cafe-router',
  )
})

test('submission validation normalizes links and email and requires an explicit feature opt-in', () => {
  const result = validateProject(project)
  assert.equal(result.ok, true)
  assert.equal(result.value.url, 'https://example.com/demo')
  assert.equal(result.value.creatorEmail, 'builder@example.test')
  assert.equal(result.value.videoUrl, null)
  assert.equal(result.value.shareConsent, false)
  for (const shareConsent of [true, 'on', 'true']) {
    assert.equal(
      validateProject({ ...project, shareConsent }).value.shareConsent,
      true,
    )
  }
  for (const shareConsent of [false, undefined, 'false', 1]) {
    assert.equal(
      validateProject({ ...project, shareConsent }).value.shareConsent,
      false,
    )
  }
})

test('submissions reject missing fields, oversized text, unsafe URLs and LinkedIn lookalikes', () => {
  for (const [field, value] of [
    ['name', 'x'],
    ['name', 'x'.repeat(81)],
    ['tagline', 'too short'],
    ['tagline', 'x'.repeat(281)],
    ['creatorName', 'x'],
    ['creatorEmail', 'not-an-email'],
    ['url', 'javascript:alert(1)'],
    ['url', 'data:text/html,test'],
    ['videoUrl', 'file:///private/video'],
    ['linkedinUrl', 'https://linkedin.com.evil.test/in/builder'],
    ['linkedinUrl', 'https://evillinkedin.com/in/builder'],
  ]) {
    const result = validateProject({ ...project, [field]: value })
    assert.equal(result.ok, false, field)
    assert.ok(result.errors[field], field)
  }
  assert.equal(validateProject({}).ok, false)
})

test('project slugs are normalized and video embeds accept only the supported hosts', () => {
  assert.equal(slugify('  Café Router!  '), 'cafe-router')
  assert.equal(slugify('🚀'), 'project')
  assert.equal(slugify('x'.repeat(100)).length, 48)
  assert.equal(
    videoEmbed('https://youtu.be/abc123'),
    'https://www.youtube-nocookie.com/embed/abc123',
  )
  assert.equal(
    videoEmbed('https://youtube.com/shorts/abc123'),
    'https://www.youtube-nocookie.com/embed/abc123',
  )
  assert.equal(
    videoEmbed('https://www.loom.com/share/abc123'),
    'https://www.loom.com/embed/abc123',
  )
  assert.equal(
    videoEmbed('https://vimeo.com/123456'),
    'https://player.vimeo.com/video/123456',
  )
  assert.equal(videoEmbed('https://youtube.com.evil.test/watch?v=abc123'), null)
  assert.equal(videoEmbed('https://example.com/video'), null)
  assert.equal(videoEmbed(null), null)
})

test('team submissions credit every hacker with optional profiles and strip private extras', () => {
  const result = validateProject({
    ...project,
    hackers: [
      {
        name: ' Alex Rivera ',
        linkedinUrl: 'linkedin.com/in/alex-preview',
        email: 'private@example.test',
      },
      { name: 'Sam Costa', linkedinUrl: '' },
    ],
  })
  assert.equal(result.ok, true)
  assert.deepEqual(result.value.hackers, [
    {
      name: 'Alex Rivera',
      linkedinUrl: 'https://linkedin.com/in/alex-preview',
    },
    { name: 'Sam Costa', linkedinUrl: null },
  ])
  assert.equal(result.value.creatorName, 'Alex Rivera')
  assert.equal(
    result.value.creatorEmail,
    'builder@example.test',
    'one private organiser contact is retained',
  )
  assert.doesNotMatch(
    JSON.stringify(result.value.hackers),
    /email|private@example/,
  )
  assert.deepEqual(projectHackers({ ...project, hackers: [] }), [
    { name: project.creatorName, linkedinUrl: project.linkedinUrl },
  ])
})

test('team validation rejects empty, oversized and malformed rosters and unsafe profile links', () => {
  for (const hackers of [
    [],
    'Alex',
    Array.from({ length: 21 }, () => ({ name: 'Alex' })),
    [null],
    [{ name: 'x' }],
    [{ name: 'x'.repeat(81) }],
    [{ name: 'Alex', linkedinUrl: 'https://linkedin.com.evil.test/in/alex' }],
    [{ name: 'Alex', linkedinUrl: 'javascript:alert(1)' }],
  ]) {
    assert.equal(validateProject({ ...project, hackers }).ok, false)
  }
  const publicHackers = projectHackers({
    ...project,
    hackers: [
      {
        name: 'Alex',
        linkedinUrl: 'https://evil.test',
        email: 'secret@example.test',
      },
    ],
  })
  assert.deepEqual(publicHackers, [{ name: 'Alex', linkedinUrl: null }])
})
