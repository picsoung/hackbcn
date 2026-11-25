const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { registerHooks } = require('node:module')

require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    jsx: 'react-jsx',
  },
})
const root = path.resolve(__dirname, '..')
const aliases = registerHooks({
  resolve(specifier, context, next) {
    return next(
      specifier.startsWith('@/')
        ? path.join(root, specifier.slice(2))
        : specifier,
      context,
    )
  },
})
const {
  getProject,
  getProjects,
  getProjectsByEvent,
  getArchivedProjectCounts,
} = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  groupProjectCards,
  searchProjectCards,
} = require('../lib/project-cards.ts')
const { buildBuilderDirectory } = require('../lib/builders.ts')
const { projectBuilder } = require('../lib/project-detail.ts')
const { projectListSchema } = require('../lib/project-seo.ts')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const ProjectArchiveBrowser =
  require('../app/components/projects/ProjectArchiveBrowser.tsx').default
const EventProjectsSection =
  require('../app/components/projects/EventProjectsSection.tsx').default
aliases.deregister()

function fixture(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'hackbarna-private-projects-'),
  )
  fs.mkdirSync(path.join(directory, 'projects'))
  for (const [slug, status, event] of [
    ['shared-demo', 'published', 'aisummit26'],
    ['private-demo', 'private', 'aisummit26'],
    ['draft-demo', 'draft', 'aisummit26'],
    ['all-private-demo', 'private', 'hacknight-june-2026'],
  ]) {
    fs.writeFileSync(
      path.join(directory, 'projects', `${slug}.md`),
      `---
title: ${slug}
description: ${slug} description
status: ${status}
event: ${event}
publishedDate: 2026-11-01
hackers:
  - name: ${slug} builder
    links:
      github: https://github.com/${slug}
---
${slug} private body
`,
    )
  }
  const previous = process.cwd()
  process.chdir(directory)
  t.after(() => {
    process.chdir(previous)
    fs.rmSync(directory, { recursive: true, force: true })
  })
}

test('private archived projects count, while drafts do not; private details cannot be looked up', (t) => {
  fixture(t)
  assert.deepEqual(
    getProjects().map((project) => project.slug),
    ['shared-demo'],
  )
  assert.equal(getProjectsByEvent('aisummit26').length, 1)
  assert.equal(getProject(['shared-demo']).data.title, 'shared-demo')
  assert.throws(() => getProject(['private-demo']), /Project not found/)
  assert.throws(() => getProject(['draft-demo']), /Project not found/)
  assert.deepEqual(getArchivedProjectCounts(), {
    aisummit26: 2,
    'hacknight-june-2026': 1,
  })
  assert.doesNotMatch(
    JSON.stringify(getArchivedProjectCounts()),
    /private-demo|builder|description/,
  )
})

test('private archived details never enter cards, maker profiles, search or JSON-LD', (t) => {
  fixture(t)
  const projects = getProjects()
  const cards = projects.map((project) => archivedProjectCard(project, 'en'))
  assert.equal(searchProjectCards(cards, 'private-demo').length, 0)
  const profiles = buildBuilderDirectory(
    projects.map((project) => ({
      projectKey: `archive:${project.slug}`,
      builders: project.data.hackers.map(projectBuilder),
    })),
  )
  const jsonLd = projectListSchema(
    'Projects',
    '/en/projects',
    cards.map((project) => ({ name: project.name, path: project.href })),
  )
  assert.equal(profiles.length, 1)
  assert.equal(jsonLd.numberOfItems, 1)
  assert.doesNotMatch(
    JSON.stringify({ cards, profiles, jsonLd }),
    /private-demo|draft-demo/,
  )
})

const summaries = [
  { key: 'aisummit26', name: 'AI Summit', date: 2, total: 2 },
  { key: 'hacknight-june-2026', name: 'June HackNight', date: 1, total: 1 },
]

test('archive groups retain private-only events while search matches public projects only', (t) => {
  fixture(t)
  const cards = getProjects().map((project) =>
    archivedProjectCard(project, 'en'),
  )
  const groups = groupProjectCards(cards, summaries)
  assert.deepEqual(
    groups.map((group) => [group.key, group.total, group.projects.length]),
    [
      ['aisummit26', 2, 1],
      ['hacknight-june-2026', 1, 0],
    ],
  )
  assert.deepEqual(groupProjectCards(searchProjectCards(cards, 'private')), [])
  assert.equal(
    groupProjectCards(searchProjectCards(cards, 'shared'))[0].total,
    1,
  )
})

test('rendered archive and event disclosures show total participation and public cards only', (t) => {
  fixture(t)
  const projects = getProjects().map((project) =>
    archivedProjectCard(project, 'en'),
  )
  const archive = renderToStaticMarkup(
    React.createElement(ProjectArchiveBrowser, {
      projects,
      eventSummaries: summaries,
      locale: 'en',
    }),
  )
  assert.match(archive, /3 projects built across 2 events/)
  assert.match(archive, /June HackNight/)
  assert.match(archive, /Some projects are kept private/)
  assert.doesNotMatch(archive, /private-demo|draft-demo|No projects published/)
  assert.equal((archive.match(/data-project-card=/g) ?? []).length, 1)
  const event = renderToStaticMarkup(
    React.createElement(EventProjectsSection, {
      projects: [],
      total: 1,
      eventSlug: 'hacknight-june-2026',
      eventName: 'June HackNight',
      locale: 'en',
    }),
  )
  assert.match(event, /Some projects are kept private/)
  assert.doesNotMatch(event, /will appear here|data-project-card=/)
  assert.match(event, /"numberOfItems":0/)
})
