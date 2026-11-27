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
  projectReference,
  isProjectOrganiser,
} = require('../lib/projects/ownership.ts')
const proof = require('../lib/projects/email-proof.ts')
const { archivedProjectCard } = require('../lib/project-cards.ts')
const {
  prepareEvidence,
} = require('../scripts/prepare-project-claim-evidence.cjs')
const key = 'a'.repeat(64)

test('project references accept canonical routes and reject traversal, credentials and foreign sites', () => {
  assert.deepEqual(
    projectReference('https://www.hackbarna.com/fr/projects/aisummit26/nito'),
    {
      kind: 'archive',
      key: 'archive:aisummit26/nito',
      slug: ['aisummit26', 'nito'],
    },
  )
  assert.equal(
    projectReference(
      'https://www.hackbarna.com/en/events/hacknight-5-jevathon-2026/projects/homecrush',
    ).key,
    'submitted:hacknight-5-jevathon-2026:homecrush',
  )
  assert.equal(projectReference('archive:AQ-App').key, 'archive:AQ-App')
  for (const value of [
    'archive:../secret',
    'archive:*',
    'archive:foo/../../secret',
    'submitted:foo:*',
    'https://evil.example/en/projects/AQ-App',
    'https://user:password@www.hackbarna.com/en/projects/AQ-App',
    'javascript:alert(1)',
    {},
    'archive:',
  ])
    assert.equal(projectReference(value), null)
})

test('organiser authority comes only from a verified immutable account ID', () => {
  const user = {
    id: 'owner',
    emailVerified: true,
    email: 'owner@example.test',
    name: 'Organiser',
    role: 'admin',
  }
  assert.equal(isProjectOrganiser(user, 'other'), false)
  assert.equal(isProjectOrganiser(user, 'owner'), true)
  assert.equal(
    isProjectOrganiser({ ...user, emailVerified: false }, 'owner'),
    false,
  )
  assert.equal(isProjectOrganiser({ ...user, id: 'other' }, 'owner'), false)
  assert.equal(isProjectOrganiser(user, '', 'owner'), true)
  assert.equal(
    isProjectOrganiser({ ...user, emailVerified: false }, '', 'owner'),
    false,
  )
  assert.equal(isProjectOrganiser({ ...user, id: 'other' }, '', 'owner'), false)
})

test('email lookup is keyed and exact without rewriting dots or aliases', () => {
  assert.equal(
    proof.claimEmailHash(' Alex+one@Example.test ', key),
    proof.claimEmailHash('alex+one@example.test', key),
  )
  assert.notEqual(
    proof.claimEmailHash('a.lex@example.test', key),
    proof.claimEmailHash('alex@example.test', key),
  )
  assert.notEqual(
    proof.claimEmailHash('alex+one@example.test', key),
    proof.claimEmailHash('alex@example.test', key),
  )
  assert.notEqual(
    proof.claimEmailHash('alex@example.test', key),
    proof.claimEmailHash('alex@example.test', 'b'.repeat(64)),
  )
  assert.equal(proof.claimLookupKey('short'), null)
  assert.throws(() => proof.claimEmailHash('not an email', key))
})

function fixture() {
  const makers = [
    { name: 'Alex Example', email: 'alex@example.test' },
    { name: 'Sam Example', email: 'sam@example.test' },
  ]
  const project = {
    slug: 'aisummit26/demo',
    content: '',
    data: {
      event: 'aisummit26',
      title: 'Demo',
      description: 'Demo',
      publishedDate: new Date(),
      status: 'published',
      hackers: makers.map((maker) => ({ name: maker.name, links: {} })),
      links: { github: 'https://github.com/team/demo' },
    },
  }
  const attendees = makers.map((maker) => ({
    email: maker.email,
    name: maker.name,
  }))
  return {
    event: 'aisummit26',
    projects: [project],
    attendees,
    submissions: [{ repository: project.data.links.github, makers }],
    key,
    sourceDigest: 'c'.repeat(64),
  }
}
function prepare(input) {
  return prepareEvidence(input, { ...proof, archivedProjectCard })
}

test('automatic proofs require original individual source emails and matching registrations, and contain no raw emails', () => {
  const input = fixture(),
    result = prepare(input)
  assert.equal(result.summary.automatic, 2)
  assert.doesNotMatch(
    JSON.stringify(result.payload),
    /alex@example|sam@example|Alex Example|Sam Example/,
  )
  assert.equal(
    result.payload.evidence[0].emailHash,
    proof.claimEmailHash('alex@example.test', key),
  )
  const changed = fixture()
  changed.attendees[0].email = 'different@example.test'
  assert.equal(prepare(changed).summary.automatic, 1)
  const mismatched = fixture()
  mismatched.attendees[0].name = 'Someone Else'
  assert.equal(prepare(mismatched).summary.automatic, 1)
})

test('shared team emails, conflicting registrations and source roster changes stay in review', () => {
  const shared = fixture()
  shared.submissions[0].makers[1].email = shared.submissions[0].makers[0].email
  assert.equal(prepare(shared).summary.automatic, 0)
  const conflicting = fixture()
  conflicting.attendees.push({
    ...conflicting.attendees[0],
    name: 'Different Person',
  })
  assert.equal(prepare(conflicting).summary.automatic, 1)
  const changed = fixture()
  changed.submissions[0].makers.reverse()
  assert.equal(prepare(changed).summary.automatic, 0)
  const profiles = fixture()
  profiles.attendees.push({
    ...profiles.attendees[0],
    'What is your LinkedIn profile?': 'https://linkedin.com/in/one',
  })
  profiles.attendees[0]['What is your LinkedIn profile?'] =
    'https://linkedin.com/in/two'
  assert.equal(prepare(profiles).summary.automatic, 1)
})
