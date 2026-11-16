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
  searchProjectCards,
  relatedProjectCards,
} = require('../lib/project-cards.ts')
const { projectListPath } = require('../lib/project-seo.ts')
const {
  archivedProjectDemo,
  archivedProjectUrl,
} = require('../lib/archived-project.ts')
const {
  archivedProjectContent,
  projectBuilder,
  projectLinks,
  projectVideo,
} = require('../lib/project-detail.ts')

test('archived demo links preserve every first-edition video and its recorded start time', () => {
  const projects = getProjects().filter(
    (project) => project.data.event === 'v1-2024',
  )
  assert.equal(projects.length, 18)
  for (const project of projects) {
    const embedded = project.content.match(
      /<YouTube id="([^"]+)" timestamp="(\d+)"/,
    )
    assert.ok(embedded, project.slug)
    assert.deepEqual(
      archivedProjectDemo(project.data.youtubeLink),
      {
        id: embedded[1],
        timestamp: embedded[2],
      },
      project.slug,
    )
    const prepared = archivedProjectContent(project)
    assert.equal(prepared.media.type, 'youtube', project.slug)
    assert.equal(prepared.media.id, embedded[1], project.slug)
    assert.equal(prepared.media.timestamp, embedded[2], project.slug)
    assert.ok(!prepared.content.includes('<YouTube'), project.slug)
  }
  assert.deepEqual(
    archivedProjectDemo('https://youtu.be/JZzgPRxKiFM?t=1h2m3s'),
    {
      id: 'JZzgPRxKiFM',
      timestamp: '3723',
    },
  )
  assert.equal(
    archivedProjectDemo('https://example.com/watch?v=JZzgPRxKiFM'),
    undefined,
  )
})

test('shared builder credits retain photos, roles and social links without private fields', () => {
  const builder = projectBuilder({
    name: ' Example Builder ',
    job: 'Developer',
    image: { src: '/hackers/example.jpg' },
    links: {
      linkedin: 'linkedin.com/in/example',
      github: 'github.com/example',
      twitter: 'twitter.com/example',
      email: 'https://private.example.test',
    },
    creatorEmail: 'private@example.test',
  })
  assert.deepEqual(builder, {
    name: 'Example Builder',
    role: 'Developer',
    image: '/hackers/example.jpg',
    links: {
      linkedin: 'https://linkedin.com/in/example',
      github: 'https://github.com/example',
      twitter: 'https://twitter.com/example',
    },
  })
  assert.doesNotMatch(JSON.stringify(builder), /private|creatorEmail/)
  assert.deepEqual(
    projectBuilder({
      name: 'Submitted Builder',
      linkedinUrl: 'https://linkedin.com/in/submitted',
    }).links,
    { linkedin: 'https://linkedin.com/in/submitted' },
  )
})

test('the primary media moves out of MDX while additional demos and text remain', () => {
  const project = getProjects().find((project) => project.slug === 'AQ-App')
  const original = project.content
  const extra = '<YouTube id="Z3qFd-oT8Xo" timestamp="0" />'
  const prepared = archivedProjectContent({
    ...project,
    content: `${original}\nExtra context.\n${extra}`,
  })
  assert.equal(prepared.media.timestamp, '4800')
  assert.ok(
    prepared.content.includes(
      'We aim to raise awareness about the dangers of air pollution',
    ),
  )
  assert.ok(prepared.content.includes('Extra context.'))
  assert.ok(prepared.content.includes(extra))
  const markdown = getProjects().find(
    (project) => project.slug === 'aisummit26/ai-meeting-moderator',
  )
  assert.equal(archivedProjectContent(markdown).content, markdown.content)
  assert.equal(archivedProjectContent(markdown).media.id, 'LT4t5-4Rzak')
})

test('shared actions deduplicate URLs while preserving distinct demos and image links', () => {
  assert.deepEqual(
    projectLinks([
      ['video', 'https://example.com/first'],
      ['video', 'https://example.com/second'],
      ['github', 'https://example.com/first'],
      ['screenshot', '/api/project/screenshot'],
      ['website', 'javascript:alert(1)'],
    ]),
    [
      { type: 'github', href: 'https://example.com/first' },
      { type: 'video', href: 'https://example.com/second' },
      { type: 'screenshot', href: '/api/project/screenshot' },
    ],
  )
  assert.deepEqual(projectVideo('https://www.loom.com/share/abc123'), {
    type: 'embed',
    src: 'https://www.loom.com/embed/abc123',
  })
  assert.deepEqual(projectVideo('https://vimeo.com/123456'), {
    type: 'embed',
    src: 'https://player.vimeo.com/video/123456',
  })
  assert.equal(
    projectVideo('https://example.com/watch?v=JZzgPRxKiFM'),
    undefined,
  )
})

test('older builder links without a protocol remain external profile links', () => {
  const anne = getProjects()
    .find((project) => project.slug === 'candit')
    .data.hackers.find((hacker) => hacker.name === 'Anne Pehse')
  assert.equal(
    archivedProjectUrl(anne.links.linkedin),
    'https://www.linkedin.com/in/anne-pehse',
  )
  assert.equal(
    archivedProjectUrl(anne.links.github),
    'https://github.com/anninape',
  )
  assert.equal(archivedProjectUrl('javascript:alert(1)'), undefined)
  assert.equal(archivedProjectUrl(''), undefined)
})

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
  assert.equal(card.judgeScore, undefined)
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

test('archive search finds names, descriptions, events and every maker, ignoring case and accents', () => {
  const card = submittedProjectCard(
    {
      ...submitted,
      hackers: [
        { name: 'Alex Garcia', linkedinUrl: null },
        { name: 'Núria Solé', linkedinUrl: null },
      ],
    },
    'en',
    event,
  )
  for (const query of [
    'CAFE',
    'volunteer',
    'Jev-a-thon',
    'alex garcia',
    'nuria sole',
    '  café   NÚRIA  volunteer  ',
    'jev nuria',
  ]) {
    assert.deepEqual(searchProjectCards([card], query), [card], query)
  }
  assert.deepEqual(searchProjectCards([card], 'cafe missing'), [])
  assert.deepEqual(searchProjectCards([card], 'private@example.test'), [])
  assert.deepEqual(searchProjectCards([card], 'private-voter'), [])
})

test('search keeps event order and matching counts, and clearing restores the full archive', () => {
  const recent = submittedProjectCard(submitted, 'en', event)
  const older = {
    ...recent,
    key: 'older',
    name: 'Volunteer board',
    eventSlug: 'earlier-night',
    eventName: 'Earlier night',
    eventDate: Date.parse('2025-01-01'),
  }
  const unrelated = {
    ...older,
    key: 'unrelated',
    description: 'Unrelated',
    name: 'Other',
  }
  const cards = [older, recent, unrelated]
  assert.equal(searchProjectCards(cards, '  '), cards)
  assert.equal(searchProjectCards(cards, ''), cards)
  const groups = groupProjectCards(searchProjectCards(cards, 'volunteer'))
  assert.deepEqual(
    groups.map((group) => group.key),
    [recent.eventSlug, older.eventSlug],
  )
  assert.deepEqual(
    groups.map((group) => group.projects.length),
    [1, 1],
  )
  assert.deepEqual(searchProjectCards(cards, 'earlier night'), [
    older,
    unrelated,
  ])
  assert.deepEqual(searchProjectCards([], 'anything'), [])
})
