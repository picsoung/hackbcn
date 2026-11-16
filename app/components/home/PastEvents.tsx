'use client'

import Link from 'next/link'
import type { HomeEvent } from '@/lib/homepage'
import { homeCopy } from '@/data/homepage'
import { useIntl } from '../Intl'
import HomeEventCard from './HomeEventCard'

export default function PastEvents({ events }: { events: HomeEvent[] }) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  if (!events.length) return null
  const archiveHref = `/${intl.locale}/events#past`
  const archiveClass =
    'inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

  return (
    <section
      id="past-events"
      aria-labelledby="home-events-title"
      className="scroll-mt-6 bg-band-3 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="home-events-title"
            className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            {intl.t('home.past.title')}
          </h2>
          <Link href={archiveHref} className={archiveClass}>
            {copy.allEvents}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {events.map((event) => (
            <li key={event.slug} className="min-w-0">
              <HomeEventCard event={event} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <Link
            href={archiveHref}
            className="hb-px inline-flex min-h-11 items-center justify-center bg-band-2 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-ground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
          >
            {copy.allEvents}
          </Link>
        </div>
      </div>
    </section>
  )
}
