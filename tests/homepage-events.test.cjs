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
const { getHomePastEvents } = require('../lib/home-events.ts')
aliases.deregister()

test('the homepage lists completed editions newest first and links only to available content', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-16T12:00:00Z'),
  })
  const events = getHomePastEvents()
  assert.equal(events.length, 6)
  assert.equal(new Set(events.map((event) => event.slug)).size, 6)
  assert.ok(
    events.every(
      (event, i) =>
        !i ||
        Date.parse(events[i - 1].startDate) >= Date.parse(event.startDate),
    ),
  )
  const summit = events.find((event) => event.slug === 'aisummit26')
  assert.equal(summit.projectCount, 65)
  assert.equal(summit.postCount, 13)
  assert.equal(summit.photoCount, 4)
  assert.equal(summit.hasVideo, true)
  const jev = events.find((event) => event.slug === 'hacknight-5-jevathon-2026')
  assert.equal(jev.eventType, 'hacknight')
  assert.equal(jev.hasProjects, true)
  assert.equal(
    jev.projectCount,
    undefined,
    'live projects must not receive a partial static count',
  )
  const june = events.find((event) => event.slug === 'hacknight-june-2026')
  assert.equal(june.hasVideo, true)
  assert.equal(june.hasProjects, false)
  assert.equal(june.photoCount, 0)
  const skill = events.find(
    (event) => event.slug === 'skillathon-hacknight-2026',
  )
  assert.equal(skill.hasProjects, false)
  assert.equal(skill.postCount, 0)
  assert.equal(skill.photoCount, 0)
  assert.equal(skill.hasVideo, false)
})

test('the homepage does not list an upcoming event in the completed editions', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: Date.parse('2026-11-10T12:00:00Z'),
  })
  assert.ok(
    !getHomePastEvents(20).some(
      (event) => event.slug === 'hacknight-5-jevathon-2026',
    ),
  )
})
