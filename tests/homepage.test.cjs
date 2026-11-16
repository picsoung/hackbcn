const assert = require('node:assert/strict')
const { registerHooks } = require('node:module')
const path = require('node:path')
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
const { getHomepageEvents, toHomeEvent } = require('../lib/homepage.ts')
aliases.deregister()

test('the homepage shows six distinct poster events and selects the latest available aftermovie', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-16T12:00:00Z'),
  })
  const wall = getHomepageEvents('en')
  assert.deepEqual(
    wall.events.slice(0, 3).map((event) => event.slug),
    ['hacknight-5-jevathon-2026', 'netlify-barcelona-2026', 'aisummit26'],
  )
  assert.equal(wall.events.length, 6)
  assert.equal(new Set(wall.events.map((event) => event.slug)).size, 6)
  assert.ok(wall.total > 6)
  assert.ok(wall.events.every((event) => event.imageUrl && event.dateLabel))
  assert.equal(wall.recap.slug, 'aisummit26')
  assert.equal(wall.recap.recapVideoUrl, 'https://youtu.be/Z3qFd-oT8Xo')
  assert.equal(wall.recap.recapDuration, 89)
  for (const locale of ['es', 'ca', 'fr']) {
    assert.ok(
      getHomepageEvents(locale).events.every(
        (event) => event.dateLabel && !event.dateLabel.includes('Invalid'),
      ),
    )
  }
  assert.equal(getHomepageEvents('en', 1).events.length, 1)
})

test('ongoing editions remain outside the past-event wall and an empty archive stays empty', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-10T12:00:00Z'),
  })
  assert.ok(
    !getHomepageEvents('en', 20).events.some(
      (event) => event.slug === 'hacknight-5-jevathon-2026',
    ),
  )
  t.mock.timers.setTime(Date.parse('2024-06-01T12:00:00Z'))
  assert.deepEqual(getHomepageEvents('en'), {
    total: 0,
    events: [],
    recap: undefined,
  })
})

test('upcoming cards keep registration and server-formatted dates', () => {
  const event = toHomeEvent(
    {
      slug: 'future-night',
      name: 'Future Hack Night',
      eventType: 'hacknight',
      startDate: '2026-12-10T17:30:00+01:00',
      endDate: '2026-12-10T21:30:00+01:00',
      location: 'Barcelona, Spain',
      registrationUrl: 'https://luma.com/example',
    },
    'en',
  )
  assert.equal(event.registrationUrl, 'https://luma.com/example')
  assert.equal(event.dateLabel, 'Dec 10, 2026')
  assert.equal(event.location, 'Barcelona')
  assert.equal(event.recapDuration, undefined)
})
