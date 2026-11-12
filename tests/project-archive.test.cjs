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
const { getProjects } = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  submittedProjectCard,
  groupProjectCards,
  relatedProjectCards,
} = require('../lib/project-cards.ts')
const { projectListPath } = require('../lib/project-seo.ts')

test('existing Markdown publication dates remain valid for sitemap generation', () => {
  const projects = getProjects()
  assert.ok(projects.length > 0)
  for (const project of projects) {
    assert.ok(
      Number.isFinite(project.data.publishedDate.getTime()),
      project.slug,
    )
    if (project.data.modifiedDate)
      assert.ok(
        Number.isFinite(project.data.modifiedDate.getTime()),
        project.slug,
      )
  }
})

test('related projects match every builder by profile, excluding self, duplicates and already-shown projects', () => {
  const makeCard = (slug, eventSlug, hackers) =>
    submittedProjectCard(
      { ...submitted, slug, eventSlug, hackers },
      'en',
      event,
    )
  const alex = {
    name: 'Alex',
    linkedinUrl: 'https://www.linkedin.com/in/alex-builder/',
  }
  const sam = {
    name: 'Sam',
    linkedinUrl: 'https://linkedin.com/in/sam-builder',
  }
  const current = makeCard('current', 'event-a', [alex, sam])
  const sameEventBuilder = makeCard('same-builder', 'event-a', [
    {
      ...sam,
      linkedinUrl:
        'https://es.linkedin.com/in/SAM-BUILDER/?utm_source=share#about',
    },
  ])
  const earlierBuilder = makeCard('earlier', 'event-b', [alex])
  const other = makeCard('other', 'event-a', [
    { name: 'Other', linkedinUrl: null },
  ])
  const sameName = makeCard('same-name', 'event-b', [
    { name: 'Alex', linkedinUrl: 'https://linkedin.com/in/someone-else' },
  ])
  const related = relatedProjectCards(current, [
    current,
    sameEventBuilder,
    { ...sameEventBuilder, key: 'duplicate' },
    earlierBuilder,
    other,
    sameName,
  ])
  assert.deepEqual(
    related.byBuilder.map((p) => p.href),
    [sameEventBuilder.href, earlierBuilder.href],
  )
  assert.deepEqual(
    related.byEvent.map((p) => p.href),
    [other.href],
  )
  assert.equal(
    relatedProjectCards(current, [sameEventBuilder, earlierBuilder], 1)
      .byBuilder.length,
    1,
  )
})

test('related projects do not infer shared builders from names or missing profiles', () => {
  const current = submittedProjectCard(
    { ...submitted, hackers: [{ name: 'Alex', linkedinUrl: null }] },
    'en',
    event,
  )
  const other = {
    ...current,
    key: 'another',
    href: '/en/projects/another',
    eventSlug: undefined,
  }
  assert.deepEqual(relatedProjectCards(current, [current, other]), {
    byBuilder: [],
    byEvent: [],
  })
  assert.deepEqual(relatedProjectCards(current, [current]), {
    byBuilder: [],
    byEvent: [],
  })
})

test('event lists resolve to embedded grids while detail links remain stable', () => {
  assert.equal(
    projectListPath('es', 'hacknight-5-jevathon-2026'),
    '/es/events/hacknight-5-jevathon-2026#projects',
  )
  assert.equal(projectListPath('en', 'aisummit25'), '/en/aisummit25#projects')
  assert.equal(projectListPath('en', 'v1-2024'), '/en/v1-2024#projects')
  assert.equal(
    projectListPath('ca', 'hacknight-5-jevathon-2026', 'cafe-router'),
    '/ca/events/hacknight-5-jevathon-2026/projects/cafe-router',
  )
})

const submitted = {
  id: 1,
  eventSlug: 'hacknight-5-jevathon-2026',
  slug: 'cafe-router',
  name: 'Café Router',
  tagline: 'Route community questions to the right volunteer.',
  creatorName: 'Preview Builder',
  creatorEmail: 'private@example.test',
  voterIds: ['private-voter'],
  createdAt: new Date('2026-11-10T18:00:00Z'),
  voteCount: 12,
  judgeScore: 82,
  screenshotKey: 'event/preview.png',
  videoUrl: 'https://youtu.be/abc123',
}
const event = { name: 'Jev-a-thon', startDate: '2026-11-10T18:00:00Z' }

test('public cards preserve media and discovery without voting metrics or private fields', () => {
  const card = submittedProjectCard(
    {
      ...submitted,
      award: 'Community prize',
      hackers: [
        { name: 'Alex', linkedinUrl: null },
        { name: 'Sam', linkedinUrl: null },
      ],
    },
    'en',
    event,
    {
      category: 'Community',
    },
  )
  assert.equal(card.creator, 'Alex, Sam')
  assert.equal(card.award, 'Community prize')
  assert.equal(card.voteCount, undefined)
  assert.equal(card.judgeScore, 82)
  assert.match(
    card.image,
    /^\/api\/live\/hacknight-5-jevathon-2026\/projects\/cafe-router\/screenshot\?v=event%2Fpreview.png$/,
  )
  assert.equal(card.voting, undefined, 'closed events cannot vote inline')
  assert.doesNotMatch(
    JSON.stringify(card),
    /private@example|private-voter|creatorEmail|voterIds/,
  )
  assert.match(
    submittedProjectCard({ ...submitted, screenshotKey: null }, 'en', event)
      .image,
    /i.ytimg.com\/vi\/abc123\//,
  )
})

test('the archive groups every project by event, newest first, without conflating repeated slugs', () => {
  const archived = getProjects().map((project) =>
    archivedProjectCard(project, 'en'),
  )
  const recent = submittedProjectCard(submitted, 'en', event)
  const older = submittedProjectCard(
    { ...submitted, eventSlug: 'earlier-night' },
    'en',
    { name: 'Earlier night', startDate: '2025-01-01' },
  )
  const cards = [...archived, older, recent]
  const groups = groupProjectCards(cards)
  assert.equal(groups[0].key, submitted.eventSlug)
  assert.equal(groups.flatMap((group) => group.projects).length, cards.length)
  assert.equal(new Set(cards.map((card) => card.key)).size, cards.length)
  assert.notEqual(recent.href, older.href)
  for (const card of archived) {
    assert.ok(
      card.href.startsWith('/en/projects/'),
      'Markdown URLs stay stable',
    )
  }
})
