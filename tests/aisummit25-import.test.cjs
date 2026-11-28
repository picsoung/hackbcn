const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const {
  SOURCE,
  parseMembers,
  prepareProjects,
  writeProjects,
} = require('../scripts/import-aisummit25.cjs')
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
  getProjectsByEvent,
  getArchivedProjectCounts,
} = require('../app/helpers/projects.ts')
const {
  archivedProjectCard,
  searchProjectCards,
} = require('../lib/project-cards.ts')
const {
  buildBuilderDirectory,
  builderForCredit,
} = require('../lib/builders.ts')
const { projectBuilder } = require('../lib/project-detail.ts')
const manifest = require('../data/aisummit25-import.json')
const projects = getProjectsByEvent('aisummit25')
const fixture = (rows) => ({
  version: 1,
  sourceUrl: SOURCE,
  sourceSheet: 'Submissions2',
  event: 'aisummit25',
  rows,
})
const row = (extra = {}) => ({
  sourceRow: 2,
  team: 'A project',
  pitch: 'A useful prototype',
  description: 'The submitted project description.',
  members: 'Ada (ada@example.test), Bob - bob@example.test',
  repository: 'https://github.com/team/project',
  challenges: 'Glovo, Lovable',
  tools: 'React, n8n',
  submittedAt: '10/12/2025 9:00:00',
  ...extra,
})

test('team parsing preserves individual names and accents while removing private contacts and separators', () => {
  assert.deepEqual(
    parseMembers(
      'Adrián de Miguel: adrian@example.test\nAlbert Vilà\nMatias Martinez matias@example.test',
    ),
    ['Adrián de Miguel', 'Albert Vilà', 'Matias Martinez'],
  )
  assert.deepEqual(
    parseMembers(
      'Ada (ada@example.test), Bob <bob@example.test>; Carl. carl@example.test',
    ),
    ['Ada', 'Bob', 'Carl'],
  )
  assert.deepEqual(parseMembers('Sergio Rodriguez & Ramon Amela'), [
    'Sergio Rodriguez',
    'Ramon Amela',
  ])
  assert.deepEqual(parseMembers('Reli , pola , hanan'), [
    'Reli',
    'pola',
    'hanan',
  ])
  assert.throws(() => parseMembers('only@example.test'), /review/)
})

test('all 40 real projects and 97 builder credits join the event, archive and builder views without contact data', () => {
  assert.equal(projects.length, 40)
  assert.equal(manifest.sourceRows, 40)
  assert.equal(manifest.publishedProjects, 40)
  assert.equal(getArchivedProjectCounts().aisummit25, 40)
  assert.equal(
    projects.reduce((n, p) => n + p.data.hackers.length, 0),
    97,
  )
  assert.equal(new Set(projects.map((p) => p.slug)).size, 40)
  for (const p of projects) {
    assert.equal(p.data.event, 'aisummit25')
    assert.equal(p.data.contentFormat, 'markdown')
    assert.equal(p.data.publishedDate.toISOString().slice(0, 10), '2025-10-12')
    assert.ok(p.content.trim())
    assert.doesNotMatch(
      JSON.stringify(p),
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|enr_person_|enr_company_|guest_id|sourceRow|"Token"/i,
    )
    assert.equal(archivedProjectCard(p, 'ca').href, `/ca/projects/${p.slug}`)
  }
  const directory = buildBuilderDirectory(
    projects.map((p) => ({
      projectKey: `archive:${p.slug}`,
      builders: p.data.hackers.map(projectBuilder),
    })),
  )
  const travel = projects.find((p) => p.data.title === 'Travel Tetris')
  const colin = builderForCredit(directory, `archive:${travel.slug}`, 0)
  assert.equal(colin.name, 'Colin Stark')
  assert.ok(colin.projectKeys.includes(`archive:${travel.slug}`))
  const cards = projects.map((p) =>
    archivedProjectCard(p, 'en', { name: 'HackBarna AI Summit 25' }),
  )
  assert.ok(
    searchProjectCards(cards, 'Colin Stark').some(
      (p) => p.name === 'Travel Tetris',
    ),
  )
})

test('submitted project links are classified accurately, placeholders omitted and curated sponsor choices preserved', () => {
  const claimwise = projects.find((p) => p.data.title === 'Claimwise')
  assert.match(claimwise.data.links.submission, /^https:\/\/1drv\.ms\//)
  assert.equal(claimwise.data.links.github, undefined)
  assert.equal(
    projects.find((p) => p.data.title === '404 Found Sisters').data.links
      .website,
    'http://plannr-me.lovable.app/',
  )
  assert.deepEqual(
    projects.find((p) => p.data.title === 'Team Savti').data.links,
    {},
  )
  assert.equal(
    projects.find((p) => p.data.title === 'Team Savti').data.hackers.length,
    3,
  )
  assert.equal(
    projects.find((p) => p.data.title === 'serra').data.hackers.length,
    2,
  )
  assert.ok(
    projects.find((p) => p.data.title === 'GlovIA').data.tags.includes('Glovo'),
  )
  assert.equal(
    projects.find((p) => p.slug.endsWith('/10xceo')).data.title,
    '10x CEO',
  )
})

test('bad source data, private public-text fields, unsafe URLs and colliding project URLs fail before writing', () => {
  assert.throws(() =>
    prepareProjects({
      ...fixture([row()]),
      sourceUrl: 'https://other.example.test',
    }),
  )
  assert.throws(() =>
    prepareProjects(
      fixture([row({ description: 'Contact private@example.test' })]),
    ),
  )
  for (const repository of [
    'javascript:alert(1)',
    'https://secret:password@example.test/project',
    'https://example.test/?token=private',
  ])
    assert.throws(() => prepareProjects(fixture([row({ repository })])))
  assert.throws(() =>
    prepareProjects(fixture([row({ submittedAt: '10/12/2026 9:00:00' })])),
  )
  assert.throws(
    () => prepareProjects(fixture([row(), row({ sourceRow: 3 })])),
    /URL/,
  )
})

test('reimport is idempotent and cannot overwrite an existing privacy or editorial change', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'hackbarna-aisummit25-import-'),
  )
  try {
    const source = fixture([
      row(),
      row({
        sourceRow: 3,
        team: 'Second project',
        repository: 'https://github.com/team/second',
      }),
    ])
    const first = await writeProjects(source, { root, write: true })
    assert.deepEqual(await writeProjects(source, { root, write: true }), first)
    const file = path.join(root, 'projects/aisummit25/a-project.md')
    const privateContent = (await fs.readFile(file, 'utf8')).replace(
      'status: published',
      'status: private',
    )
    await fs.writeFile(file, privateContent)
    const second = path.join(root, 'projects/aisummit25/second-project.md'),
      before = await fs.readFile(second, 'utf8')
    await assert.rejects(
      writeProjects(source, { root, write: true }),
      /Existing project needs review/,
    )
    assert.equal(await fs.readFile(file, 'utf8'), privateContent)
    assert.equal(await fs.readFile(second, 'utf8'), before)
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
