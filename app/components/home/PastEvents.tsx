'use client'

import { useIntl } from '../Intl'
import { getPastEvents } from '@/lib/events'
import { getPastHackNights } from '@/data/hacknights'
import EventCard from './EventCard'

export default function PastEvents() {
  const intl = useIntl()
  const pastHackathons = getPastEvents()
  const pastHackNights = getPastHackNights()

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

  if (allPast.length === 0) return null

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {intl.t('home.past.title')}
        </h2>
        <div className="w-12 h-1 bg-slate-300 rounded-full mb-10" />

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
