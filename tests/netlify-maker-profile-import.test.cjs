const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  nameKey,
  matchMaker,
  enrichProject,
} = require('../scripts/enrich-netlify-hacknight-makers.cjs')
const { parseCsv } = require('../scripts/enrich-aisummit26-makers.cjs')
const column = 'What is your LinkedIn profile?'

const attendee = (name, first, last, profile = 'example') => ({
  name,
  first_name: first,
  last_name: last,
  [column]: profile
    ? `https://linkedin.com/in/${profile}?utm_source=registration`
    : '',
  email: 'PRIVATE@example.test',
  phone_number: 'private phone',
  guest_id: 'private registration',
})

test('LinkedIn-only CSV exports use the shared quoted-field parser without requiring GitHub or email', () => {
  const result = parseCsv(
    '\uFEFFname,first_name,last_name,What is your LinkedIn profile?\r\n"Family, Given",Given,Family,https://linkedin.com/in/example\r\n',
    ['name', 'first_name', 'last_name', column],
  )
  assert.equal(result[0].name, 'Family, Given')
  assert.throws(
    () => parseCsv('name\nExample', ['name', column]),
    /Missing attendee column/,
  )
})

test('name matching normalizes punctuation and accents and supports one unambiguous registered first name', () => {
  assert.equal(nameKey('  José B.  García '), 'jose b garcia')
  const rows = [attendee('José B. García', 'José B.', 'García')]
  assert.deepEqual(matchMaker({ name: 'Jose B Garcia' }, rows), {
    linkedin: 'https://www.linkedin.com/in/example/',
    method: 'exact-name',
  })
  assert.equal(
    matchMaker({ name: 'Mika' }, [attendee('Mikael Baron', 'Mika', 'Baron')])
      .method,
    'unique-first-name',
  )
  assert.equal(matchMaker({ name: 'Unknown' }, rows).linkedin, undefined)
})

test('matching includes registrations without profiles when rejecting ambiguous first names', () => {
  const rows = [
    attendee('Daniel', 'Daniel', 'Zapata'),
    attendee('Daniel Ryan', 'Daniel', 'Ryan', ''),
  ]
  assert.match(matchMaker({ name: 'Daniel' }, rows).reason, /Ambiguous/)
  assert.equal(matchMaker({ name: 'Daniel' }, rows).linkedin, undefined)
  assert.match(
    matchMaker({ name: 'Daniel' }, [attendee('Daniel', 'Daniel', '', '')])
      .reason,
    /no usable LinkedIn/,
  )
  const duplicate = attendee('Ada Lovelace', 'Ada', 'Lovelace')
  assert.ok(
    matchMaker({ name: 'Ada Lovelace' }, [duplicate, { ...duplicate }])
      .linkedin,
  )
  assert.equal(
    matchMaker({ name: 'Ada Lovelace' }, [
      duplicate,
      attendee('Ada Lovelace', 'Ada', 'Lovelace', 'different-person'),
    ]).linkedin,
    undefined,
  )
})

test('reviewed aliases require an attendee-supplied profile and evidence for a replacement URL', () => {
  const rows = [attendee('Registered Name', 'Registered', 'Name')]
  const alias = {
    maker: 'Submitted Name',
    attendeeProfile: 'https://linkedin.com/in/example/',
    reason: 'Reviewed public project credit.',
  }
  assert.equal(
    matchMaker({ name: 'Submitted Name' }, rows, alias).method,
    'reviewed-name-variant',
  )
  assert.throws(
    () => matchMaker({ name: 'Different' }, rows, alias),
    /submitted maker/,
  )
  assert.throws(
    () => matchMaker({ name: 'Submitted Name' }, [], alias),
    /absent/,
  )
  assert.throws(
    () =>
      matchMaker({ name: 'Submitted Name' }, rows, {
        ...alias,
        replacementProfile: 'https://linkedin.com/in/current/',
      }),
    /evidence/,
  )
  assert.equal(
    matchMaker({ name: 'Submitted Name' }, rows, {
      ...alias,
      replacementProfile: 'https://linkedin.com/in/current/',
      evidence: 'https://example.com/author',
    }).linkedin,
    'https://www.linkedin.com/in/current/',
  )
})

test('a reviewed supplied profile fills a blank registration only for one exact full name', () => {
  const row = attendee('Daniela Trifu', 'Daniela', 'Trifu', '')
  const alias = {
    maker: 'Daniela',
    attendeeName: 'Daniela Trifu',
    providedProfile: 'https://linkedin.com/in/daniela-trifu/',
    reason: 'Supplied profile name and public event post reviewed.',
    evidence: 'https://example.com/public-event-post',
  }
  assert.deepEqual(matchMaker({ name: 'Daniela' }, [row], alias), {
    linkedin: 'https://www.linkedin.com/in/daniela-trifu/',
    method: 'reviewed-supplied-profile',
  })
  for (const rows of [
    [],
    [row, { ...row }],
    [attendee('Another Daniela', 'Daniela', 'Other', '')],
  ])
    assert.throws(
      () => matchMaker({ name: 'Daniela' }, rows, alias),
      /one matching registered full name/,
    )
  assert.throws(
    () => matchMaker({ name: 'Daniela' }, [row], { ...alias, evidence: '' }),
    /public evidence/,
  )
  assert.throws(
    () =>
      matchMaker({ name: 'Daniela' }, [row], {
        ...alias,
        providedProfile: 'https://linkedin.com.evil.test/in/daniela-trifu/',
      }),
    /public evidence/,
  )
  assert.throws(
    () =>
      matchMaker(
        { name: 'Daniela' },
        [{ ...row, [column]: 'https://linkedin.com/in/different/' }],
        alias,
      ),
    /conflicts/,
  )
})

test('enrichment preserves the submitted roster and public fields while excluding registration data', () => {
  const maker = {
    name: 'Ada Lovelace',
    description: 'Original team',
    image: { src: '/makers/original.jpg' },
    links: { github: 'https://github.com/example' },
  }
  const source = { hackers: [maker, { name: 'Unknown', links: {} }] }
  const rows = [attendee('Ada Lovelace', 'Ada', 'Lovelace')]
  const result = enrichProject(source, rows, 'test', [])
  assert.deepEqual(result.hackers[0], {
    ...maker,
    links: { ...maker.links, linkedin: 'https://www.linkedin.com/in/example/' },
  })
  assert.equal(result.hackers[1], source.hackers[1])
  assert.equal(maker.links.linkedin, undefined)
  assert.equal(result.matches.length, 1)
  assert.equal(result.unresolved.length, 1)
  assert.doesNotMatch(
    JSON.stringify(result),
    /email|@|private phone|guest_id|private registration/i,
  )
  assert.deepEqual(
    enrichProject({ hackers: result.hackers }, rows, 'test', []).hackers,
    result.hackers,
  )
  assert.throws(
    () =>
      enrichProject(
        {
          hackers: [
            {
              ...maker,
              links: { linkedin: 'https://linkedin.com/in/different/' },
            },
          ],
        },
        rows,
        'test',
        [],
      ),
    /Existing LinkedIn differs/,
  )
})
