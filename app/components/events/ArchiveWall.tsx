'use client'

import { useIntl } from '../Intl'
import { getPastEvents } from '@/lib/events'
import { getPastHackNights } from '@/data/hacknights'
import Polaroid, { type TapeColor } from '../Polaroid'

type ArchiveItem = {
  slug: string
  name: string
  date: string
  tapeColor: TapeColor
  imageUrl?: string
}

// SSR-safe deterministic placement: cycle through these arrays by index.
const ROTATIONS = [-5, 3, -2, 4, -3, 5, -4, 2, -6, 4]
const TRANSLATES = [0, -8, 4, -4, 8, -2, 6, -8, 2, -6]

const FALLBACK_IMAGE = '/hackbcnlogo.png'

function groupByYear(items: ArchiveItem[]): [string, ArchiveItem[]][] {
  const buckets: Record<string, ArchiveItem[]> = {}
  items.forEach((item) => {
    const year = String(new Date(item.date).getUTCFullYear())
    if (!buckets[year]) buckets[year] = []
    buckets[year].push(item)
  })
  // Sort items within each year, most recent first
  Object.keys(buckets).forEach((year) => {
    buckets[year].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })
  // Return years sorted descending
  return Object.keys(buckets)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => [year, buckets[year]] as [string, ArchiveItem[]])
}

export default function ArchiveWall() {
  const intl = useIntl()

  const items: ArchiveItem[] = [
    ...getPastEvents().map((e) => ({
      slug: e.slug,
      name: e.name,
      date: e.startDate,
      tapeColor: 'coral' as TapeColor,
      imageUrl: e.imageUrl,
    })),
    ...getPastHackNights().map((hn) => ({
      slug: hn.slug,
      name: hn.name,
      date: hn.date,
      tapeColor: 'kraft' as TapeColor,
      imageUrl: hn.imageUrl,
    })),
  ]

  const years = groupByYear(items)

  if (years.length === 0) {
    return null
  }

  return (
    <section className="bg-orange-50 border-y border-orange-100">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-org-accent mb-3">
          / archive
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 max-w-2xl">
          Looking back.
        </h2>
        <p className="mt-3 text-base text-slate-600 max-w-xl">
          Every edition and every hack night, pinned by year. Tap a polaroid to
          see what was built.
        </p>

        <div className="mt-14 space-y-16">
          {years.map(([year, yearItems]) => {
            let cursor = 0
            return (
              <div key={year}>
                <div className="flex items-baseline gap-4 mb-8">
                  <h3 className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {year}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                    {yearItems.length}{' '}
                    {yearItems.length === 1 ? 'event' : 'events'}
                  </span>
                  <span aria-hidden="true" className="flex-1 h-px bg-orange-200" />
                </div>

                <ul className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
                  {yearItems.map((item) => {
                    const rotate = ROTATIONS[cursor % ROTATIONS.length]
                    const translateY = TRANSLATES[cursor % TRANSLATES.length]
                    cursor++
                    return (
                      <li key={item.slug}>
                        <Polaroid
                          src={item.imageUrl || FALLBACK_IMAGE}
                          alt={item.name}
                          label={item.name}
                          href={`/${intl.locale}/events/${item.slug}`}
                          rotate={rotate}
                          translateY={translateY}
                          tapeColor={item.tapeColor}
                          width="w-44 sm:w-48"
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
