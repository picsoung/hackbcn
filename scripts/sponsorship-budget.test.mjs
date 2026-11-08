import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateBudget,
  euroCents,
  historicalCostCents,
} from './sponsorship-budget.mjs'
import offers from './sponsorship-pricing.json' with { type: 'json' }

test('historical baseline and single-night contribution reconcile to the plan', () => {
  assert.equal(historicalCostCents, 299503)
  const result = calculateBudget({
    contractedCents: 400000,
    basisConfirmed: true,
  })
  assert.equal(result.totals.contractedContributionCents, 100497)
  assert.equal(result.totals.collectedContributionCents, -299503)
  assert.equal(result.readyToConfirm, true)
})
test('requires the contracted cash floor and confirmed cost basis', () => {
  assert.equal(
    calculateBudget({ contractedCents: 349999, basisConfirmed: true })
      .readyToConfirm,
    false,
  )
  assert.equal(
    calculateBudget({ contractedCents: 350000, basisConfirmed: true })
      .readyToConfirm,
    true,
  )
  assert.equal(
    calculateBudget({ contractedCents: 400000 }).readyToConfirm,
    false,
  )
  assert.equal(
    calculateBudget({
      contractedCents: 400000,
      costPerNightCents: 350001,
      basisConfirmed: true,
    }).readyToConfirm,
    false,
  )
})
test('discounted passes clear the floor per night, with the documented margins', () => {
  const contributions = [160994, 281988]
  for (const [i, pass] of offers.passes.entries()) {
    const result = calculateBudget({
      contractedCents: pass.priceCents,
      nights: pass.nights,
      basisConfirmed: true,
    })
    assert.equal(result.totals.contractedContributionCents, contributions[i])
    assert.equal(result.readyToConfirm, true)
  }
  const four = calculateBudget({
    contractedCents: 1480000,
    nights: 4,
    extraCostPerNightCents: 20498,
    basisConfirmed: true,
  })
  assert.equal(four.readyToConfirm, false)
})
test('counts in-kind only as avoided cost and retains exact cents', () => {
  const result = calculateBudget({
    contractedCents: 760001,
    nights: 2,
    avoidedCostPerNightCents: 89600,
  })
  assert.equal(result.events[0].costCents, 209903)
  assert.equal(
    result.events.reduce((sum, event) => sum + event.contractedCents, 0),
    760001,
  )
  assert.equal(euroCents('2995.03'), 299503)
  assert.equal(euroCents('0.1'), 10)
})
test('rejects invalid money, impossible collections and unsupported night counts', () => {
  for (const amount of ['-1', '1.001', 'NaN', '1e3', 'Infinity'])
    assert.throws(() => euroCents(amount))
  assert.throws(() =>
    calculateBudget({ contractedCents: 400000, collectedCents: 400001 }),
  )
  assert.throws(() =>
    calculateBudget({
      contractedCents: 400000,
      avoidedCostPerNightCents: 300000,
    }),
  )
  assert.throws(() => calculateBudget({ contractedCents: 400000, nights: 0 }))
  assert.throws(() => calculateBudget({ contractedCents: 400000, nights: 1.5 }))
})
