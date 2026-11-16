'use client'

import { useIntl } from '../Intl'
import type { HomeEvent } from '@/lib/homepage'
import HomeEventCard from './HomeEventCard'

export default function UpcomingEvents({ events }: { events: HomeEvent[] }) {
  const intl = useIntl()
  if (!events.length) return null
  return (
    <section
      id="upcoming-events"
      aria-labelledby="home-upcoming-title"
      className="bg-band-2 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          id="home-upcoming-title"
          className="mb-8 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          {intl.t('home.upcoming.title')}
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {events.map((event) => (
            <li key={event.slug} className="min-w-0">
              <HomeEventCard event={event} upcoming />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
