const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')
const {
  matchAuthor,
  enrichProject,
} = require('../scripts/enrich-skillathon-makers.cjs')
const column = 'What is your LinkedIn profile?'
const attendee = (name, first, last, email, profile = 'example') => ({
  name,
  first_name: first,
  last_name: last,
  email,
  [column]: profile
    ? `https://linkedin.com/in/${profile}?tracking=private`
    : '',
  guest_id: 'private-registration',
  phone_number: 'private-phone',
})
const maker = (name) => ({
  name,
  description: 'Original role',
  image: { src: '' },
  links: {},
})

test('author email disambiguates a shared name and is never exported', () => {
  const rows = [
    attendee('Colin', 'Colin', 'Stark', 'secret@example.test', 'starklink'),
    attendee(
      'Colin Stark',
      'Colin',
      'Stark',
      'other@example.test',
      'different',
    ),
  ]
  const result = matchAuthor('Colin Stark', ' SECRET@example.test ', rows)
  assert.deepEqual(result, {
    linkedin: 'https://www.linkedin.com/in/starklink/',
    method: 'exact-author-email',
  })
  assert.doesNotMatch(
    JSON.stringify(result),
    /secret|email.*@|tracking|guest_id|private-phone/,
  )
})

test('an author account with a different registered name cannot fall back to a namesake', () => {
  const rows = [
    attendee('.', 'Someone', 'Else', 'account@example.test', ''),
    attendee(
      'Oscar Fuentes',
      'Oscar',
      'Fuentes',
      'oscar@example.test',
      'oscar',
    ),
  ]
  const result = matchAuthor('Oscar', 'account@example.test', rows)
  assert.equal(result.linkedin, undefined)
  assert.match(result.reason, /different name/)
})

test('author name variants require exact email; conflicting duplicate registrations remain unresolved', () => {
  const row = attendee('Joe Tann', 'Joe', 'Tann', 'joe@example.test', 'joetann')
  assert.equal(
    matchAuthor('Joe Tannoury', row.email, [row]).method,
    'exact-author-email',
  )
  assert.equal(
    matchAuthor('Joe Tannoury', 'unmatched@example.test', [row]).linkedin,
    undefined,
  )
  assert.equal(
    matchAuthor('Joe Tannoury', row.email, [row], {}).linkedin,
    undefined,
  )
  assert.equal(
    matchAuthor('Joe Tannoury', row.email, [
      row,
      { ...row, [column]: 'https://linkedin.com/in/different/' },
    ]).linkedin,
    undefined,
  )
})

test('teammates do not inherit the submitting account and repeated profile matches stay unlinked', () => {
  const row = attendee('Joe Tann', 'Joe', 'Tann', 'joe@example.test', 'joetann')
  const data = {
    hackers: [maker('Joe Tannoury'), maker('Joe'), maker('Unknown')],
  }
  const source = {
    authorName: 'Joe Tannoury',
    authorEmail: row.email,
    authorId: 'private-account',
  }
  const result = enrichProject(data, source, [row])
  assert.equal(result.matches.length, 1)
  assert.equal(result.unresolved.length, 2)
  assert.deepEqual(result.hackers[1], data.hackers[1])
  assert.deepEqual(result.hackers[2], data.hackers[2])
  assert.doesNotMatch(
    JSON.stringify(result),
    /@|private-account|private-registration|private-phone/,
  )
  assert.deepEqual(
    enrichProject({ hackers: result.hackers }, source, [row]).hackers,
    result.hackers,
  )
})

test('name-only teammates include attendees with blank profiles when detecting ambiguity', () => {
  const rows = [
    attendee('Ada Lovelace', 'Ada', 'Lovelace', 'ada@example.test', 'ada'),
    attendee('Sam One', 'Sam', 'One', 'one@example.test', 'sam-one'),
    attendee('Sam Two', 'Sam', 'Two', 'two@example.test', ''),
  ]
  const result = enrichProject(
    { hackers: [maker('Ada Lovelace'), maker('Sam')] },
    { authorName: 'Ada Lovelace', authorEmail: rows[0].email },
    rows,
  )
  assert.equal(result.hackers[1].links.linkedin, undefined)
  assert.match(result.unresolved[0].reason, /Ambiguous/)
})

test('enrichment rejects stale author rosters and conflicting existing profiles', () => {
  const row = attendee(
    'Ada Lovelace',
    'Ada',
    'Lovelace',
    'ada@example.test',
    'ada',
  )
  const source = { authorName: 'Ada Lovelace', authorEmail: row.email }
  assert.throws(
    () => enrichProject({ hackers: [maker('Different')] }, source, [row]),
    /first submitted credit/,
  )
  assert.throws(
    () =>
      enrichProject(
        {
          hackers: [
            {
              ...maker('Ada Lovelace'),
              links: { linkedin: 'https://linkedin.com/in/another/' },
            },
          ],
        },
        source,
        [row],
      ),
    /conflicts/,
  )
})

test('all three Skill-a-thon submissions use Colin’s existing cross-event profile identity', () => {
  const root = path.join(__dirname, '../projects')
  const files = [
    'skillathon-hacknight-2026/a11y-ally.md',
    'skillathon-hacknight-2026/design-one-pager.md',
    'skillathon-hacknight-2026/steve-as-a-service.md',
    'aisummit26/ling0.md',
    'hacknight-june-2026/valuator.md',
  ]
  for (const file of files) {
    const data = matter(fs.readFileSync(path.join(root, file), 'utf8')).data
    assert.ok(
      data.hackers.some(
        (hacker) =>
          hacker.links?.linkedin === 'https://www.linkedin.com/in/starklink/',
      ),
      file,
    )
  }
})
