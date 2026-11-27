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
  PRIVACY_FIELDS,
  maskBuilderFields,
  privacySubject,
  visibleLinks,
  visibleTextLinks,
} = require('../lib/projects/privacy-model.ts')
test('the standalone team normalizer preserves every supported privacy field and strips unknown metadata', () => {
  const { projectHackers } = require('../lib/live/validate.ts')
  const team = projectHackers({
    creatorName: '',
    linkedinUrl: '',
    hackers: [
      {
        name: 'Builder',
        linkedinUrl: null,
        hiddenFields: [...PRIVACY_FIELDS, 'email', 'role'],
      },
    ],
  })
  assert.deepEqual(team[0].hiddenFields, Array.from(PRIVACY_FIELDS))
})
test('all 32 combinations of link/photo/bio choices preserve the name and independently mask the selected fields', () => {
  const source = {
    name: 'A Builder',
    image: '/portrait.jpg',
    bio: 'Builder biography',
    role: 'Developer',
    links: {
      linkedin: 'https://www.linkedin.com/in/example/',
      github: 'https://github.com/example',
      twitter: 'https://x.com/example',
      website: 'https://example.test',
    },
  }
  for (let bits = 0; bits < 32; bits++) {
    const fields = PRIVACY_FIELDS.filter((_, i) => bits & (1 << i)),
      masked = maskBuilderFields(source, fields)
    assert.equal(masked.name, source.name)
    assert.equal(
      masked.links.linkedin,
      fields.includes('linkedin') ? undefined : source.links.linkedin,
    )
    assert.equal(
      masked.links.github,
      fields.includes('github') ? undefined : source.links.github,
    )
    assert.equal(
      masked.links.twitter,
      fields.includes('otherLinks') ? undefined : source.links.twitter,
    )
    assert.equal(
      masked.links.website,
      fields.includes('otherLinks') ? undefined : source.links.website,
    )
    assert.equal(
      masked.image,
      fields.includes('photo') ? undefined : source.image,
    )
    assert.equal(masked.bio, fields.includes('bio') ? undefined : source.bio)
    assert.equal(masked.role, fields.includes('bio') ? undefined : source.role)
  }
  assert.equal(Object.keys(source.links).length, 4)
})
test('network privacy follows URL hosts even when a GitHub URL is recorded as a website', () => {
  assert.deepEqual(
    visibleLinks(
      {
        website: 'https://github.com/example/repository',
        linkedin: 'https://fr.linkedin.com/in/example/',
      },
      ['github'],
    ),
    { linkedin: 'https://fr.linkedin.com/in/example/' },
  )
  assert.equal(
    visibleTextLinks(
      'Source: https://github.com/example/repo and https://example.test',
      ['github'],
    ),
    'Source: # and https://example.test',
  )
})
test('privacy scopes parse canonical projects and individual identities, rejecting traversal and arbitrary targets', () => {
  assert.equal(
    privacySubject(
      'credit:archive:aisummit25/travel-tetris:starklink-255870758bcc',
    ).kind,
    'credit',
  )
  assert.equal(
    privacySubject(
      'credit:submitted:hacknight-5-jevathon-2026:homecrush:builder-0123456789ab',
    ).projectKey,
    'submitted:hacknight-5-jevathon-2026:homecrush',
  )
  for (const key of [
    'credit:archive:../secret:builder',
    'project:archive:../secret',
    'builder:../secret',
    'credit:archive:test:',
    'credit:archive:test:<script>',
    null,
  ])
    assert.equal(privacySubject(key), null)
})
