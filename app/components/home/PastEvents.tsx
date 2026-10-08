'use client'

import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import type { HackNight } from '@/data/hacknights'
import EventCard from './EventCard'
import Link from 'next/link'

export default function PastEvents({
  pastHackathons,
  pastHackNights,
  limit,
}: {
  pastHackathons: Event[]
  pastHackNights: HackNight[]
  limit: number
}) {
  const intl = useIntl()

  const allPast = [
    ...pastHackathons.map(e => ({
      key: e.slug,
      name: e.name,
      href: `/${intl.locale}/events/${e.slug}`,
      startDate: e.startDate,
      endDate: e.endDate,
      location: e.location,
      description: e.description?.[intl.locale] || e.description?.en,
      eventType: 'hackathon' as const,
      imageUrl: e.imageUrl,
      ctaLabel: intl.t('events.viewProjects'),
    })),
    ...pastHackNights.map(hn => ({
      key: hn.slug,
      name: hn.name,
      href: `/${intl.locale}/events/${hn.slug}`,
      startDate: hn.date,
      endDate: hn.endDate,
      location: hn.location,
      description: hn.description[intl.locale] || hn.description.en,
      eventType: 'hacknight' as const,
      imageUrl: hn.imageUrl,
      sponsor: hn.sponsor,
      ctaLabel: intl.t('events.viewDetails'),
    })),
  ].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, limit)

  if (allPast.length === 0) return null

  return (
    <section className="bg-band-3 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-bold text-ink">
            {intl.t('home.past.title')}
          </h2>
          <Link
            href={`/${intl.locale}/events#past`}
            className="text-sm font-medium text-accent hover:text-ink transition-colors"
          >
            {intl.t('home.hacknights.seeAll')} &rarr;
          </Link>
        </div>
        <div aria-hidden="true" className="hb-rule w-16 text-ink/70 mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPast.map((event) => (
            <EventCard
              key={event.key}
              name={event.name}
              href={event.href}
              startDate={event.startDate}
              endDate={event.endDate}
              location={event.location}
              description={event.description}
              eventType={event.eventType}
              imageUrl={event.imageUrl}
              sponsor={'sponsor' in event ? event.sponsor : undefined}
              ctaLabel={event.ctaLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
