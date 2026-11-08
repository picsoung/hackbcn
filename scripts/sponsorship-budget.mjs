#!/usr/bin/env node
// Internal only. Do not import this cost model into browser components or routes.
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import baseline from './sponsorship-costs.json' with { type: 'json' }
import offers from './sponsorship-pricing.json' with { type: 'json' }

export const historicalCostCents = baseline.costs.reduce(
  (sum, item) => sum + item.cents,
  0,
)

export function euroCents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
    throw new Error(
      'Amounts must be non-negative euros with at most two decimal places.',
    )
  const [euros, fraction = ''] = String(value).split('.')
  const cents = Number(euros) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents))
    throw new Error('Amount exceeds the supported range.')
  return cents
}

export function calculateBudget({
  contractedCents,
  collectedCents = 0,
  nights = 1,
  costPerNightCents = historicalCostCents,
  avoidedCostPerNightCents = 0,
  extraCostPerNightCents = 0,
  basisConfirmed = false,
}) {
  for (const amount of [
    contractedCents,
    collectedCents,
    costPerNightCents,
    avoidedCostPerNightCents,
    extraCostPerNightCents,
  ]) {
    if (!Number.isSafeInteger(amount) || amount < 0)
      throw new Error('All amounts must be non-negative integer cents.')
  }
  if (!Number.isSafeInteger(nights) || nights < 1 || nights > 100)
    throw new Error('Nights must be an integer from 1 to 100.')
  if (collectedCents > contractedCents)
    throw new Error('Collected cash cannot exceed contracted cash.')
  if (avoidedCostPerNightCents > costPerNightCents)
    throw new Error('Avoided cash cost cannot exceed the stated cost.')
  const cost =
    costPerNightCents - avoidedCostPerNightCents + extraCostPerNightCents
  const required = Math.max(
    baseline.minimumContractedPerNightCents,
    cost + baseline.contributionFloorPerNightCents,
  )
  // Allocate whole cents, preserving the exact total. Never hide a weak night in a season total.
  const allocate = (total, i) =>
    Math.floor(total / nights) + (i < total % nights ? 1 : 0)
  const events = Array.from({ length: nights }, (_, i) => {
    const contracted = allocate(contractedCents, i)
    const collected = allocate(collectedCents, i)
    return {
      night: i + 1,
      costCents: cost,
      requiredContractedCents: required,
      contractedCents: contracted,
      collectedCents: collected,
      contractedContributionCents: contracted - cost,
      collectedContributionCents: collected - cost,
      targetBufferCents:
        contracted - cost - baseline.contributionFloorPerNightCents,
      floorMet: contracted >= required,
    }
  })
  const totalCost = cost * nights
  if (
    ![cost, required, totalCost, required * nights].every(Number.isSafeInteger)
  )
    throw new Error('Budget exceeds the supported range.')
  return {
    basisConfirmed,
    readyToConfirm: basisConfirmed && events.every((event) => event.floorMet),
    events,
    totals: {
      contractedCents,
      collectedCents,
      costCents: totalCost,
      contractedContributionCents: contractedCents - totalCost,
      collectedContributionCents: collectedCents - totalCost,
    },
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string' },
      pass: { type: 'string' },
      revenue: { type: 'string' },
      collected: { type: 'string' },
      cost: { type: 'string' },
      'avoided-cost': { type: 'string' },
      'extra-cost': { type: 'string' },
      'basis-confirmed': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(`Internal Hack Night contribution calculator (all money in euros).

npm run sponsorship:budget -- --package presenting
npm run sponsorship:budget -- --pass four --basis-confirmed
npm run sponsorship:budget -- --revenue 4000 --collected 4000 --cost 2995.03 --extra-cost 200 --basis-confirmed

--package community|build|presenting  One night; defaults to presenting
--pass two|four                      Presenting pass; totals allocated equally by night
--revenue EUR                        Override total contracted cash
--collected EUR                      Total collected cash; defaults to zero
--cost EUR                           Full cost per night; defaults to historical baseline
--avoided-cost EUR                   Documented actual avoided cash cost per night, never retail in-kind value
--extra-cost EUR                     Additional fees, staff, transport or contingency per night
--basis-confirmed                    Confirm all input amounts use the same reconciled VAT basis
--json                              Print integer-cent model for further analysis

No inventory reuse is assumed. Passes require a separate budget if nights differ.
The minimum contracted cash is the greater of EUR 3,500 and cost + EUR 500 per night.
Contracted contribution is a forecast; collected contribution uses received cash.
This model does not approve pricing or calculate accounting net profit.`)
    return
  }
  if (values.package && values.pass)
    throw new Error('Choose either --package or --pass.')
  const offer = values.pass
    ? offers.passes.find((offer) => offer.id === values.pass)
    : offers.nightPackages.find(
        (offer) => offer.id === (values.package ?? 'presenting'),
      )
  if (!offer)
    throw new Error('Unknown package or pass. Use --help for supported names.')
  const money = (key, fallback) =>
    values[key] === undefined ? fallback : euroCents(values[key])
  const result = calculateBudget({
    contractedCents: money('revenue', offer.priceCents),
    collectedCents: money('collected', 0),
    nights: offer.nights ?? 1,
    costPerNightCents: money('cost', historicalCostCents),
    avoidedCostPerNightCents: money('avoided-cost', 0),
    extraCostPerNightCents: money('extra-cost', 0),
    basisConfirmed: values['basis-confirmed'],
  })
  if (values.json) return console.log(JSON.stringify(result, null, 2))
  const eur = (amount) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  console.log(
    result.readyToConfirm
      ? 'Contracted cash clears the contribution floor on the confirmed input basis.'
      : 'Do not confirm: VAT basis is unconfirmed or a night is below its cash floor.',
  )
  console.table(
    result.events.map((event) => ({
      night: event.night,
      cost: eur(event.costCents),
      contracted: eur(event.contractedCents),
      collected: eur(event.collectedCents),
      required: eur(event.requiredContractedCents),
      'contracted contribution': eur(event.contractedContributionCents),
      'collected contribution': eur(event.collectedContributionCents),
      'buffer above €500': eur(event.targetBufferCents),
      'cash floor': event.floorMet ? 'met' : 'below',
    })),
  )
  console.log(
    'Total forecast contribution:',
    eur(result.totals.contractedContributionCents),
  )
  console.log(
    'Total collected-cash contribution:',
    eur(result.totals.collectedContributionCents),
  )
  console.log(
    'Draft prices; historical costs. Confirm invoices, inventory, fees, contingency and VAT before quoting.',
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
