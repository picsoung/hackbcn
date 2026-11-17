const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
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
const { getProjectsByEvent } = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  searchProjectCards,
} = require('../lib/project-cards.ts')
const { archivedProjectContent } = require('../lib/project-detail.ts')
const { imageType } = require('../lib/live/media.ts')
const manifest = require('../data/netlify-hacknight-import.json')
const projects = getProjectsByEvent('hacknight-june-2026')

test('June Netlify projects join the shared archive with one canonical entry per submission', () => {
  assert.equal(manifest.sourceRows, 27)
  assert.equal(manifest.publishedProjects, 25)
  assert.equal(projects.length, 25)
  assert.deepEqual(
    manifest.omitted.map((row) => row.sourceId),
    [1, 22],
  )
  assert.equal(new Set(projects.map((project) => project.slug)).size, 25)
  assert.ok(!projects.some((project) => project.data.title === 'coolapp'))
  assert.equal(
    projects.filter(
      (project) => project.data.title === 'Salon Acquisition Fit Analyzer',
    ).length,
    1,
  )
  assert.equal(
    manifest.projects.find((row) => row.sourceId === 23).slug,
    'salon-acquisition-fit-analyzer',
  )
  for (const project of projects) {
    const card = archivedProjectCard(project, 'fr')
    assert.equal(card.href, `/fr/projects/${project.slug}`)
    assert.equal(card.award, undefined)
    assert.equal(
      project.data.publishedDate.toISOString().slice(0, 10),
      '2026-06-30',
    )
    assert.equal(project.data.contentFormat, 'markdown')
    assert.deepEqual(project.data.techStack, [])
    assert.ok(project.data.links.website)
    assert.ok(
      !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(JSON.stringify(project)),
    )
  }
  assert.equal(
    projects.filter((project) => project.data.links.github).length,
    4,
  )
})

test('submitted member lists, team credits and searchable maker names are preserved', () => {
  const coffee = projects.find((project) => project.data.title === 'CoffeeLate')
  assert.deepEqual(
    coffee.data.hackers.map((maker) => maker.name),
    ['Javier Verdecia', 'Alejandro Chávez'],
  )
  assert.ok(
    coffee.data.hackers.every((maker) => maker.description === 'coffeeteam'),
  )
  assert.deepEqual(
    projects
      .find((project) => project.data.title === 'Valuator')
      .data.hackers.map((maker) => maker.name),
    ['Colin', 'Diego'],
  )
  assert.equal(
    projects.find((project) => project.data.title === "Kilnin' it with Chloe")
      .data.hackers[0].name,
    'Chloe and the bots',
  )
  assert.equal(
    searchProjectCards(
      projects.map((project) => archivedProjectCard(project, 'en')),
      'alejandro chavez',
    )[0].name,
    'CoffeeLate',
  )
  // Source project repositories do not establish personal GitHub identities.
  for (const project of projects)
    for (const maker of project.data.hackers)
      assert.equal(maker.links.github, undefined)
})

test('23 source images are durable local copies, including the animated RenovAI demo', () => {
  const images = manifest.projects.filter((project) => project.image)
  assert.equal(images.length, 23)
  assert.deepEqual(
    manifest.missingImages.map((row) => row.sourceId),
    [2, 26],
  )
  for (const { slug, image } of images) {
    const bytes = fs.readFileSync(path.join(__dirname, '../public', image.file))
    assert.ok(imageType(bytes), slug)
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      image.sha256,
      slug,
    )
    const project = projects.find((project) =>
      project.slug.endsWith(`/${slug}`),
    )
    assert.equal(project.data.thumbnailUrl, image.file)
    assert.equal(archivedProjectContent(project).media.src, image.file)
  }
  assert.equal(
    images
      .find((project) => project.slug === 'renovai')
      .image.file.endsWith('.gif'),
    true,
  )
  for (const name of ['CommunityOS', 'DentAI']) {
    const project = projects.find((project) => project.data.title === name)
    assert.equal(project.data.thumbnailUrl, '')
    assert.equal(archivedProjectContent(project).media, undefined)
  }
  assert.equal(
    projects
      .find((project) => project.data.title === 'CommunityOS')
      .content.trim(),
    '',
  )
})

test('attendee enrichment adds 21 LinkedIn links while leaving six unresolved credits unlinked', () => {
  const linked = projects
    .flatMap((project) => project.data.hackers)
    .filter((maker) => maker.links.linkedin)
  assert.equal(linked.length, 21)
  assert.equal(
    projects.filter((project) =>
      project.data.hackers.some((maker) => maker.links.linkedin),
    ).length,
    20,
  )
  assert.deepEqual(
    projects
      .flatMap((project) => project.data.hackers)
      .filter((maker) => !maker.links.linkedin)
      .map((maker) => maker.name)
      .sort(),
    [
      'Alejandro Chávez',
      'Daniel',
      'Daniela',
      'Hack Night 4',
      'Joseph',
      'mayantooth',
    ].sort(),
  )
  assert.equal(
    projects.find((project) => project.data.title === 'My Custom Chart').data
      .hackers[0].links.linkedin,
    'https://www.linkedin.com/in/guidovezzoni/',
  )
  assert.equal(
    projects.find((project) => project.data.title === 'RenovAI').data.hackers[0]
      .links.linkedin,
    'https://www.linkedin.com/in/al-unsoldgroup/',
  )
  for (const maker of linked)
    assert.match(
      maker.links.linkedin,
      /^https:\/\/www\.linkedin\.com\/in\/[^/]+\/$/,
    )
})

test('importer keeps the latest duplicate regardless of input order and exports only public fields', async () => {
  const { prepareProjects, EVENT, SOURCE } = await import(
    '../scripts/import-netlify-hacknight.mjs'
  )
  const row = {
    id: 3,
    name: 'Example',
    team_name: 'Builders',
    members: 'Ada, Grace',
    tagline: 'Public project pitch',
    description: 'A public description.',
    image_url: '/api/screenshots/example',
    demo_url: 'https://example.com/',
    repo_url: 'https://github.com/example/demo',
    tags: 'coffee, learning',
    created_at: '2026-06-30T19:00:00.000Z',
    email: 'private@example.test',
    access_token: 'private token',
  }
  const newer = { ...row, id: 4, created_at: '2026-06-30T19:01:00.000Z' }
  const snapshot = {
    sourceSite: '978e2f15-7514-446f-9b3e-c14b41bfa450',
    sourceUrl: SOURCE,
    event: EVENT,
    projects: [newer, row],
  }
  const result = prepareProjects(snapshot)
  assert.equal(result.projects.length, 1)
  assert.equal(result.projects[0].sourceId, 4)
  assert.equal(result.omitted[0].sourceId, 3)
  assert.deepEqual(
    prepareProjects({ ...snapshot, projects: [row, newer] }),
    result,
  )
  assert.ok(!JSON.stringify(result).includes('private'))
  assert.deepEqual(result.projects[0].data.techStack, [])
  assert.deepEqual(result.projects[0].data.tags, ['coffee', 'learning'])
  assert.throws(() =>
    prepareProjects({ ...snapshot, sourceSite: 'another site' }),
  )
  assert.throws(() => prepareProjects({ ...snapshot, projects: [row, row] }))
  assert.throws(
    () =>
      prepareProjects({
        ...snapshot,
        projects: [{ ...row, description: 'Contact private@example.test' }],
      }),
    /Email found/,
  )
  assert.throws(
    () =>
      prepareProjects({
        ...snapshot,
        projects: [{ ...row, demo_url: 'javascript:alert(1)' }],
      }),
    /public HTTP/,
  )
})
