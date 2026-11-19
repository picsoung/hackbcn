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
  buildBuilderDirectory,
  builderForCredit,
  builderProfilePath,
} = require('../lib/builders.ts')
const { getProjects } = require('../app/helpers/projects.ts')
const { projectBuilder } = require('../lib/project-detail.ts')
const { projectHackers } = require('../lib/live/validate.ts')
const maker = (name, links = {}, extra = {}) => ({ name, links, ...extra })
const entry = (key, ...builders) => ({ projectKey: key, builders })
const linkedin = (id) => `https://www.linkedin.com/in/${id}/`

test('the reviewed Council-convention credit gives Tiam and Stepan separate identities without copying the photo owner’s profile', () => {
  const source = {
    eventSlug: 'hacknight-5-jevathon-2026',
    slug: 'council-convention',
    creatorName: 'Tiam Haghshenas / Stepan Gritsun',
    linkedinUrl: linkedin('tiam-haghshenas-58a9063b7'),
  }
  const team = projectHackers(source)
  assert.deepEqual(team, [
    { name: 'Tiam Haghshenas', linkedinUrl: source.linkedinUrl },
    { name: 'Stepan Gritsun', linkedinUrl: null },
  ])
  const profiles = buildBuilderDirectory([
    entry('council', ...team.map(projectBuilder)),
  ])
  assert.equal(profiles.length, 2)
  assert.ok(profiles.find((p) => p.name === 'Tiam Haghshenas').image)
  assert.equal(
    profiles.find((p) => p.name === 'Stepan Gritsun').image,
    undefined,
  )
})

test('reviewed team corrections do not change other projects, different profile owners or updated source rosters', () => {
  const source = {
    eventSlug: 'hacknight-5-jevathon-2026',
    slug: 'council-convention',
    creatorName: 'Tiam Haghshenas / Stepan Gritsun',
    linkedinUrl: linkedin('tiam-haghshenas-58a9063b7'),
  }
  for (const different of [
    { slug: 'another-project' },
    { eventSlug: 'another-event' },
    { linkedinUrl: linkedin('someone-else') },
  ])
    assert.equal(projectHackers({ ...source, ...different }).length, 1)
  const updated = [
    { name: 'Tiam Haghshenas', linkedinUrl: source.linkedinUrl },
    { name: 'Stepan Gritsun', linkedinUrl: linkedin('confirmed-stepan') },
    { name: 'Another builder', linkedinUrl: null },
  ]
  assert.deepEqual(projectHackers({ ...source, hackers: updated }), updated)
})

test('verified identities join across display-name changes, locales and tracking, with stable URLs', () => {
  const first = entry(
    'a',
    maker('Colin', {
      linkedin: 'https://es.linkedin.com/in/StarkLink/en?tracking=private',
    }),
  )
  const second = entry(
    'b',
    maker('Colin Stark', { linkedin: linkedin('starklink') }),
  )
  const [profile] = buildBuilderDirectory([first, second])
  assert.equal(profile.name, 'Colin Stark')
  assert.equal(profile.links.linkedin, linkedin('starklink'))
  assert.deepEqual(profile.projectKeys, ['a', 'b'])
  assert.equal(buildBuilderDirectory([second, first])[0].slug, profile.slug)
  assert.equal(buildBuilderDirectory([first])[0].slug, profile.slug)
  assert.equal(
    builderProfilePath('fr', profile.slug),
    `/fr/builders/${profile.slug}`,
  )
  assert.doesNotMatch(JSON.stringify(profile), /tracking|private/)
})

test('identical names never merge distinct profiles or credits without verified identities', () => {
  const profiles = buildBuilderDirectory([
    entry('a', maker('Alex'), maker('Alex')),
    entry('b', maker('Alex')),
    entry('c', maker('Alex', { linkedin: linkedin('one') })),
    entry('d', maker('Alex', { linkedin: linkedin('two') })),
  ])
  assert.equal(profiles.length, 5)
  assert.equal(new Set(profiles.map((p) => p.slug)).size, 5)
  assert.notEqual(
    builderForCredit(profiles, 'a', 0).slug,
    builderForCredit(profiles, 'a', 1).slug,
  )
  assert.equal(builderForCredit(profiles, 'absent', 0), undefined)
})

test('GitHub joins require an explicit personal profile and an unambiguous bridge to LinkedIn', () => {
  const profiles = buildBuilderDirectory([
    entry('a', maker('Ada', { github: 'https://github.com/ada' })),
    entry(
      'b',
      maker('Ada Lovelace', {
        linkedin: linkedin('ada'),
        github: 'https://github.com/ada/',
      }),
    ),
    entry('c', maker('Ada', { github: 'https://github.com/ada/project' })),
  ])
  assert.equal(profiles.length, 2)
  const ada = profiles.find((p) => p.links.linkedin)
  assert.deepEqual(ada.projectKeys, ['a', 'b'])
  assert.equal(ada.links.github, 'https://github.com/ada')
  assert.deepEqual(profiles.find((p) => p.projectKeys.includes('c')).links, {})
})

test('a GitHub account shared by two LinkedIn identities cannot merge them or their ambiguous credits', () => {
  const github = 'https://github.com/shared'
  const profiles = buildBuilderDirectory([
    entry('a', maker('One', { linkedin: linkedin('one'), github })),
    entry('b', maker('Two', { linkedin: linkedin('two'), github })),
    entry('c', maker('Unknown', { github })),
    entry('d', maker('Unknown', { github })),
  ])
  assert.equal(profiles.length, 4)
  assert.ok(profiles.every((p) => p.projectKeys.length === 1))
})

test('project counts deduplicate repeated credits while every original credit retains a profile link', () => {
  const person = maker('Ada', { linkedin: linkedin('ada') })
  const profiles = buildBuilderDirectory([
    entry('a', person, person),
    entry('b', person),
  ])
  assert.equal(profiles.length, 1)
  assert.deepEqual(profiles[0].projectKeys, ['a', 'b'])
  assert.equal(profiles[0].credits.length, 3)
  assert.equal(builderForCredit(profiles, 'a', 1).slug, profiles[0].slug)
  const blank = buildBuilderDirectory([entry('blank', maker(''), person)])
  assert.equal(builderForCredit(blank, 'blank', 0), undefined)
  assert.ok(builderForCredit(blank, 'blank', 1))
})

test('public profiles allowlist metadata and reject contact fields, credentials and unsafe links', () => {
  const [profile] = buildBuilderDirectory([
    entry(
      'public-project',
      maker(
        'Ada',
        {
          linkedin: linkedin('ada'),
          email: 'PRIVATE@example.test',
          github: 'javascript:alert(1)',
          website: 'https://user:secret@example.com/',
        },
        {
          email: 'PRIVATE@example.test',
          guest_id: 'PRIVATE-GUEST',
          href: '/private',
          image: 'https://user:secret@example.com/portrait.jpg',
        },
      ),
    ),
  ])
  assert.deepEqual(profile.links, { linkedin: linkedin('ada') })
  assert.equal(profile.image, undefined)
  assert.doesNotMatch(
    JSON.stringify(profile),
    /PRIVATE|secret|guest_id|@|javascript|\/private/,
  )
  const invalid = [
    'https://linkedin.com.evil.test/in/ada',
    'https://linkedin.com/company/ada',
    'https://github.com/ada/repository',
    'https://linkedin.com/in/ada%2Fother',
    'https://linkedin.com/in/ada%40example.test',
  ]
  for (const url of invalid) {
    const people = buildBuilderDirectory([
      entry('a', maker('Same', { linkedin: url })),
      entry('b', maker('Same', { linkedin: url })),
    ])
    assert.equal(people.length, 2, url)
  }
})

test('conflicting social fields stay on their original credits instead of choosing an arbitrary profile link', () => {
  const [profile] = buildBuilderDirectory([
    entry(
      'a',
      maker('Ada', {
        linkedin: linkedin('ada'),
        github: 'https://github.com/ada-one',
      }),
    ),
    entry(
      'b',
      maker('Ada', {
        linkedin: linkedin('ada'),
        github: 'https://github.com/ada-two',
      }),
    ),
  ])
  assert.equal(profile.links.linkedin, linkedin('ada'))
  assert.equal(profile.links.github, undefined)
})

test('normalized URL prefixes cannot collide between different verified identities', () => {
  const people = buildBuilderDirectory([
    entry('a', maker('First', { linkedin: linkedin('foo-bar') })),
    entry('b', maker('Second', { linkedin: linkedin('foo_bar') })),
  ])
  assert.equal(new Set(people.map((p) => p.slug)).size, 2)
})

test('Colin’s profile contains all five archived projects, his verified portrait and both social profiles', () => {
  const profiles = buildBuilderDirectory(
    getProjects().map((p) => ({
      projectKey: `archive:${p.slug}`,
      builders: (p.data.hackers ?? []).map(projectBuilder),
    })),
  )
  const colin = profiles.find((p) => p.links.linkedin === linkedin('starklink'))
  assert.equal(colin.name, 'Colin Stark')
  assert.equal(colin.projectKeys.length, 5)
  assert.ok(colin.projectKeys.includes('archive:hacknight-june-2026/valuator'))
  assert.ok(colin.projectKeys.includes('archive:aisummit26/ling0'))
  assert.match(colin.image, /^\/makers\/linkedin-starklink-/)
  assert.equal(colin.links.github, 'https://github.com/colinstark')
})
