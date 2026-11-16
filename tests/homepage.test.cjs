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
const { getHomepageEvents } = require('../lib/homepage.ts')
aliases.deregister()

test('the event wall features the latest hack night and hackathon, with four distinct additional editions', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-16T12:00:00Z'),
  })
  const wall = getHomepageEvents('en')
  assert.deepEqual(
    wall.featured.map((event) => event.slug),
    ['hacknight-5-jevathon-2026', 'aisummit26'],
  )
  assert.equal(wall.compact.length, 4)
  assert.equal(
    new Set([...wall.featured, ...wall.compact].map((event) => event.slug))
      .size,
    6,
  )
  assert.ok(wall.total > 6)
  const [night, summit] = wall.featured
  assert.equal(night.hasProjects, true)
  assert.equal(
    night.projectCount,
    undefined,
    'live database projects must not receive a partial static count',
  )
  assert.equal(night.galleryCredit.name, 'Pol Ducamp')
  assert.equal(summit.projectCount, 65)
  assert.equal(summit.recapVideoUrl, 'https://youtu.be/Z3qFd-oT8Xo')
  for (const locale of ['es', 'ca', 'fr']) {
    const localized = getHomepageEvents(locale)
    assert.ok(
      localized.featured.every(
        (event) => event.dateLabel && !event.dateLabel.includes('Invalid'),
      ),
    )
  }
  assert.equal(getHomepageEvents('en', 1).featured.length, 1)
  assert.equal(getHomepageEvents('en', 1).compact.length, 0)
})

test('ongoing editions remain outside the past-event wall and an empty archive stays empty', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-10T12:00:00Z'),
  })
  const wall = getHomepageEvents('en', 20)
  assert.ok(
    ![...wall.featured, ...wall.compact].some(
      (event) => event.slug === 'hacknight-5-jevathon-2026',
    ),
  )
  t.mock.timers.setTime(Date.parse('2024-06-01T12:00:00Z'))
  assert.deepEqual(getHomepageEvents('en'), {
    total: 0,
    featured: [],
    compact: [],
  })
})
