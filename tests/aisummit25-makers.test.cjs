const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  parseAttendees,
  memberCredits,
  profileIndex,
  enrichProject,
} = require('../scripts/enrich-aisummit25-makers.cjs')
const attendee = (email, linkedin, github) => ({
  email,
  'What is your LinkedIn profile?': linkedin,
  'What is your GitHub username?': github,
})
const project = (names) => ({
  hackers: names.map((name) => ({ name, links: {} })),
})

test('2025 participant exports skip metadata and normalize their public profile columns without copying team or demo fields', () => {
  const rows = parseAttendees(
    '\uFEFF# Hackathon Participants Export - 2025-10-06,,,,\r\n# Source: https://example.test/export,,,,\r\n#,,,,\r\nName,Email,LinkedIn,Team Members,Demo Project\r\n"Ada Lovelace",ada@example.test,https://www.linkedin.com/in/ada/,"Bob, Carl",https://example.test/demo\r\n',
  )
  assert.deepEqual(rows, [
    {
      email: 'ada@example.test',
      'What is your LinkedIn profile?': 'https://www.linkedin.com/in/ada/',
    },
  ])
  const result = enrichProject(
    project(['Ada']),
    'Ada ada@example.test',
    profileIndex(rows),
  )
  assert.equal(
    result.hackers[0].links.linkedin,
    'https://www.linkedin.com/in/ada/',
  )
  assert.doesNotMatch(JSON.stringify(result), /@|example\.test|Bob|Carl/)
  assert.equal(
    parseAttendees(
      'email,What is your LinkedIn profile?\nada@example.test,https://www.linkedin.com/in/ada/\n',
    ).length,
    1,
  )
  const github = parseAttendees(
    'Name,Email,LinkedIn\nAda,ada@example.test,https://github.com/ada\n',
  )
  const githubOnly = enrichProject(
    project(['Ada']),
    'Ada ada@example.test',
    profileIndex(github),
  )
  assert.deepEqual(githubOnly.hackers[0].links, {
    github: 'https://github.com/ada',
  })
  assert.throws(
    () => parseAttendees('# Only export metadata\n'),
    /no CSV header/,
  )
})

test('verified 2025 credits share the existing maker profile, portrait and other event projects', () => {
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
  const { projectBuilder } = require('../lib/project-detail.ts')
  const {
    buildBuilderDirectory,
    builderForCredit,
  } = require('../lib/builders.ts')
  const projects = getProjects()
  const directory = buildBuilderDirectory(
    projects.map((p) => ({
      projectKey: `archive:${p.slug}`,
      builders: (p.data.hackers || []).map(projectBuilder),
    })),
  )
  const travel = projects.find((p) => p.slug === 'aisummit25/travel-tetris')
  const profile = builderForCredit(
    directory,
    `archive:${travel.slug}`,
    travel.data.hackers.findIndex((hacker) => hacker.name === 'Miguel Sureda'),
  )
  assert.ok(profile.projectKeys.includes('archive:aisummit26/promote'))
  assert.equal(
    profile.links.linkedin,
    'https://www.linkedin.com/in/miguelsureda/',
  )
  assert.equal(profile.image, '/testimonials/avatars/miguel-sureda.jpg')
})

test('individual emails stay paired with the correct submitted credit across the reviewed formats', () => {
  assert.deepEqual(
    memberCredits(
      'Pieter, p@example.test\nLilibeth, l@example.test\nGuillermo, g@example.test',
    ),
    [
      { name: 'Pieter', email: 'p@example.test' },
      { name: 'Lilibeth', email: 'l@example.test' },
      { name: 'Guillermo', email: 'g@example.test' },
    ],
  )
  assert.deepEqual(
    memberCredits('Adrian: a@example.test\nAlbert Vilà\nMatias m@example.test'),
    [
      { name: 'Adrian', email: 'a@example.test' },
      { name: 'Albert Vilà', email: '' },
      { name: 'Matias', email: 'm@example.test' },
    ],
  )
  assert.deepEqual(
    memberCredits('Ada (ada@example.test), Bob <bob@example.test>'),
    [
      { name: 'Ada', email: 'ada@example.test' },
      { name: 'Bob', email: 'bob@example.test' },
    ],
  )
})

test('matching uses individual emails, never names or the project repository owner, and exports public links only', () => {
  const index = profileIndex([
    attendee('ada@example.test', 'linkedin.com/in/ada/?trk=source', '@ada'),
    attendee(
      'ADA@example.test',
      'https://www.linkedin.com/in/ada/',
      'https://github.com/ada',
    ),
    attendee('another@example.test', 'https://www.linkedin.com/in/bob/', 'bob'),
  ])
  const result = enrichProject(
    project(['Ada', 'Bob']),
    'Ada ada@example.test\nBob missing@example.test',
    index,
  )
  assert.equal(result.matches.length, 1)
  assert.deepEqual(result.hackers[0].links, {
    linkedin: 'https://www.linkedin.com/in/ada/',
    github: 'https://github.com/ada',
  })
  assert.deepEqual(result.hackers[1].links, {})
  assert.doesNotMatch(JSON.stringify(result), /@|example\.test/)
})

test('shared team emails, conflicting registrations and repeated teammate profiles remain unlinked', () => {
  const shared = 'Ada shared@example.test\nBob shared@example.test'
  const index = profileIndex([
    attendee('shared@example.test', 'linkedin.com/in/ada/', 'ada'),
  ])
  assert.equal(
    enrichProject(project(['Ada', 'Bob']), shared, index).matches.length,
    0,
  )
  const conflicting = profileIndex([
    attendee('ada@example.test', 'linkedin.com/in/ada/', 'ada'),
    attendee(
      'ada@example.test',
      'linkedin.com/in/someone-else/',
      'someone-else',
    ),
  ])
  assert.equal(
    enrichProject(project(['Ada']), 'Ada ada@example.test', conflicting).matches
      .length,
    0,
  )
  const repeated = profileIndex([
    attendee('ada@example.test', 'linkedin.com/in/ada/', 'ada'),
    attendee('bob@example.test', 'linkedin.com/in/ada/', 'ada'),
  ])
  assert.equal(
    enrichProject(
      project(['Ada', 'Bob']),
      'Ada ada@example.test\nBob bob@example.test',
      repeated,
    ).matches.length,
    0,
  )
})

test('roster changes and conflicting curated profiles stop the import rather than replacing a maker', () => {
  const index = profileIndex([
    attendee('ada@example.test', 'linkedin.com/in/ada/', 'ada'),
  ])
  assert.throws(
    () => enrichProject(project(['Bob']), 'Ada ada@example.test', index),
    /reviewed source/,
  )
  const curated = {
    hackers: [
      {
        name: 'Ada',
        links: { linkedin: 'https://www.linkedin.com/in/curated/' },
      },
    ],
  }
  assert.throws(
    () => enrichProject(curated, 'Ada ada@example.test', index),
    /conflicts/,
  )
})
