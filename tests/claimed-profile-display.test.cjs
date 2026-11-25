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
const { buildBuilderDirectory } = require('../lib/builders.ts')
const { claimRosterDigest } = require('../lib/projects/email-proof.ts')
const { applyClaimedDisplays } = require('../lib/community/claimed-display.ts')
const linked = (name) => `https://www.linkedin.com/in/${name}/`
const entries = [
  {
    projectKey: 'archive:one',
    builders: [
      {
        name: 'Ada',
        image: '/ada.png',
        links: { linkedin: linked('ada'), twitter: 'https://x.com/ada' },
      },
      { name: 'Bob', links: { linkedin: linked('bob') } },
    ],
  },
]
const rosters = new Map([
  [
    'archive:one',
    [
      { name: 'Ada', linkedinUrl: linked('ada') },
      { name: 'Bob', linkedinUrl: linked('bob') },
    ],
  ],
])
const binding = {
  projectKey: 'archive:one',
  creditIndex: 0,
  rosterDigest: claimRosterDigest(rosters.get('archive:one')),
  accountId: 'private-subject',
  displayName: 'Ada Updated',
  avatarUrl: '',
  bio: 'My confirmed bio',
  linkedinUrl: linked('bob'),
  githubUrl: 'https://github.com/ada',
}

test('verified display edits preserve builder URLs and grouping even when social links change', () => {
  const source = buildBuilderDirectory(entries)
  const result = applyClaimedDisplays(source, rosters, [binding])
  assert.equal(result.length, 2)
  const ada = result.find((p) => p.name === 'Ada Updated')
  assert.equal(ada.slug, source.find((p) => p.name === 'Ada').slug)
  assert.deepEqual(ada.credits, source.find((p) => p.name === 'Ada').credits)
  assert.equal(ada.image, undefined)
  assert.equal(ada.bio, binding.bio)
  assert.equal(ada.links.twitter, 'https://x.com/ada')
  assert.equal(ada.links.github, binding.githubUrl)
  assert.equal(result.find((p) => p.name === 'Bob').claimed, undefined)
  assert.doesNotMatch(
    JSON.stringify(result),
    /private-subject|accountId|rosterDigest|email/,
  )
})

test('stale rosters, foreign projects and invalid credit positions cannot overwrite public profiles', () => {
  const source = buildBuilderDirectory(entries)
  for (const changed of [
    { rosterDigest: 'stale' },
    { projectKey: 'archive:private' },
    { creditIndex: -1 },
    { creditIndex: 5 },
  ])
    assert.deepEqual(
      applyClaimedDisplays(source, rosters, [{ ...binding, ...changed }]),
      source,
    )
})

test('conflicting claimed accounts leave the historical identity unchanged', () => {
  const source = buildBuilderDirectory(entries)
  assert.deepEqual(
    applyClaimedDisplays(source, rosters, [
      binding,
      { ...binding, accountId: 'another-private-subject' },
    ]),
    source,
  )
})
