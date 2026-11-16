const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  parseCsv,
  profileUrl,
  repositoryKey,
  attendeeIndex,
  enrichProject,
} = require('../scripts/enrich-aisummit26-makers.cjs')

test('attendee CSV preserves quoted names, escaped quotes, multiline answers and BOM headers', () => {
  const [row] = parseCsv(
    '\uFEFFemail,What is your LinkedIn profile?,What is your GitHub username?,name,answer\r\n' +
      'private@example.test,https://linkedin.com/in/example,example,"Family, Given","Line one\r\nLine ""two"""\r\n',
  )
  assert.equal(row.name, 'Family, Given')
  assert.equal(row.answer, 'Line one\r\nLine "two"')
  assert.throws(
    () => parseCsv('email\nprivate@example.test'),
    /Missing attendee column/,
  )
})

test('profile URLs allow only personal LinkedIn and GitHub paths and strip tracking', () => {
  assert.equal(profileUrl('github', '@example'), 'https://github.com/example')
  assert.equal(
    profileUrl('github', 'https://github.com/example/?tab=repositories'),
    'https://github.com/example',
  )
  assert.equal(
    profileUrl(
      'linkedin',
      'https://es.linkedin.com/in/example/en?utm_source=share',
    ),
    'https://www.linkedin.com/in/example/',
  )
  for (const [service, value] of [
    ['github', 'https://github.com/example/repository'],
    ['github', 'https://github.com.evil.test/example'],
    ['linkedin', 'https://linkedin.com/company/example'],
    ['linkedin', 'https://linkedin.com.evil.test/in/example'],
    ['linkedin', 'javascript:alert(1)'],
    ['linkedin', 'https://linkedin.com/in/private%40example.test'],
    ['linkedin', 'https://private:secret@linkedin.com/in/example'],
  ])
    assert.equal(profileUrl(service, value), undefined, value)
  assert.equal(
    repositoryKey('https://github.com/Owner/Repo.git/'),
    'owner/repo',
  )
})

const attendees = [
  {
    email: 'PRIVATE@EXAMPLE.TEST ',
    name: 'Registered Name',
    'What is your LinkedIn profile?': 'https://linkedin.com/in/example',
    'What is your GitHub username?': 'example',
    phone_number: 'private telephone',
    approval_status: 'private approval',
  },
]

test('only an exact normalized email match adds profiles, with no private fields in the result', () => {
  const project = {
    hackers: [
      {
        name: 'Submitted Name',
        image: { src: '/hackers/existing.jpg' },
        links: {},
      },
      { name: 'Registered Name', links: {} },
    ],
  }
  const submission = {
    makers: [
      { name: 'Submitted Name', email: ' private@example.test' },
      { name: 'Registered Name', email: 'private+other@example.test' },
    ],
  }
  const result = enrichProject(project, submission, attendeeIndex(attendees))
  assert.equal(result.matched, 1)
  assert.deepEqual(result.unmatched, ['Registered Name'])
  assert.deepEqual(result.hackers[0].links, {
    linkedin: 'https://www.linkedin.com/in/example/',
    github: 'https://github.com/example',
  })
  assert.equal(result.hackers[0].name, 'Submitted Name')
  assert.equal(result.hackers[0].image.src, '/hackers/existing.jpg')
  assert.deepEqual(result.hackers[1].links, {})
  assert.doesNotMatch(
    JSON.stringify(result),
    /email|@|telephone|approval|private/i,
  )
  assert.deepEqual(
    project.hackers[0].links,
    {},
    'does not mutate the original metadata',
  )
})

test('conflicting duplicate attendees and changed submission rosters require review', () => {
  assert.throws(
    () =>
      attendeeIndex([
        ...attendees,
        { ...attendees[0], 'What is your GitHub username?': 'someone-else' },
      ]),
    /Conflicting github/,
  )
  assert.throws(
    () =>
      enrichProject(
        { hackers: [{ name: 'Original', links: {} }] },
        { makers: [{ name: 'Different', email: 'private@example.test' }] },
        attendeeIndex(attendees),
      ),
    /team differs/,
  )
})

test('an email reused for several teammates never assigns one attendee profile to every person', () => {
  const hackers = ['Alex', 'Sam', 'Pat'].map((name) => ({ name, links: {} }))
  const result = enrichProject(
    { hackers },
    {
      makers: hackers.map(({ name }) => ({
        name,
        email: 'private@example.test',
      })),
    },
    attendeeIndex(attendees),
  )
  assert.equal(result.matched, 0)
  assert.deepEqual(result.ambiguous, ['Alex', 'Sam', 'Pat'])
  assert.deepEqual(result.hackers, hackers)
  assert.doesNotMatch(JSON.stringify(result), /@|private/i)
})
