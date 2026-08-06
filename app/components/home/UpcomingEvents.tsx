'use client'

import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import EventCard from './EventCard'
import Link from 'next/link'

export default function UpcomingEvents({ events }: { events: Event[] }) {
  const intl = useIntl()

  const hasEvents = events.length > 0

  return (
    <section className="bg-band-2 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-ink">
              {intl.t('home.upcoming.title')}
            </h2>
          </div>
          <Link
            href={`/${intl.locale}/events`}
            className="text-sm font-medium text-accent hover:text-ink transition-colors hidden sm:block"
          >
            {intl.t('home.hacknights.seeAll')} &rarr;
          </Link>
        </div>

        {!hasEvents ? (
          <p className="text-ink-dim text-lg">{intl.t('home.upcoming.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isHackNight = event.eventType === 'hacknight'
              return (
                <EventCard
                  key={event.slug}
                  name={isHackNight && event.topic ? `${event.name} — ${event.topic}` : event.name}
                  href={`/${intl.locale}/events/${event.slug}`}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  location={event.location}
                  description={event.description?.[intl.locale] || event.description?.en}
                  eventType={event.eventType}
                  imageUrl={event.imageUrl}
                  sponsor={event.sponsor}
                  featured={!isHackNight}
                />
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={`/${intl.locale}/events`}
            className="text-sm font-medium text-accent hover:text-ink transition-colors"
          >
            {intl.t('home.hacknights.seeAll')} &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
