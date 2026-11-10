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

const projectRoot = path.resolve(__dirname, '..')
const aliases = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier.startsWith('@/')
        ? path.join(projectRoot, specifier.slice(2))
        : specifier,
      context,
    )
  },
})
const events = require('../lib/events-server.ts')
const { hackNights } = require('../data/hacknights.ts')
aliases.deregister()

const jevathon = events.getEventDataBySlug('hacknight-5-jevathon-2026').event
const legacyNight = hackNights.find((event) => event.slug === 'netlify-barcelona-2026')

for (const event of [jevathon, legacyNight]) {
  const start = Date.parse(event.startDate || event.date)
  const end = Date.parse(event.endDate)
  const isMdx = event === jevathon
  const checkpoints = [
    ['before it starts', start - 1, true],
    ['at its start', start, true],
    ['while it is running', start + (end - start) / 2, true],
    ['just before it ends', end - 1, true],
    ['at its end', end, false],
    ['after it ends', end + 1, false],
  ]

  for (const [label, now, shouldBeCurrent] of checkpoints) {
    test(`${event.slug} stays listed ${label}`, (t) => {
      t.mock.timers.enable({ apis: ['Date'], now })
      const includesEvent = (list) => list.some((item) => item.slug === event.slug)
      const current = events.getAllUpcoming()
      const past = [
        ...events.getUnifiedPastEvents(),
        ...events.getPastHackNights(),
      ]

      assert.equal(includesEvent(current), shouldBeCurrent)
      assert.equal(includesEvent(past), !shouldBeCurrent)
      assert.equal(
        [...current, ...past].filter((item) => item.slug === event.slug).length,
        1,
        'an event must appear exactly once across the current list and archive',
      )
      const sourceCurrent = isMdx
        ? events.getUnifiedUpcomingEvents()
        : events.getUpcomingHackNights()
      assert.equal(includesEvent(sourceCurrent), shouldBeCurrent)
      if (shouldBeCurrent) {
        assert.equal(events.getFeaturedUpcomingEvent().slug, event.slug)
      }
    })
  }
}
