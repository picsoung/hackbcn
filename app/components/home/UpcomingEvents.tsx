'use client'

import { useIntl } from '../Intl'
import { getUpcomingEvents } from '@/lib/events'
import { getUpcomingHackNights } from '@/data/hacknights'
import EventCard from './EventCard'
import Link from 'next/link'

export default function UpcomingEvents() {
  const intl = useIntl()
  const upcomingHackathons = getUpcomingEvents()
  const upcomingHackNights = getUpcomingHackNights().slice(0, 2)

  const hasEvents = upcomingHackathons.length > 0 || upcomingHackNights.length > 0

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {intl.t('home.upcoming.title')}
            </h2>
          </div>
          <Link
            href={`/${intl.locale}/events`}
            className="text-sm font-medium text-org-accent hover:text-org-accent-dark transition-colors hidden sm:block"
          >
            {intl.t('home.hacknights.seeAll')} &rarr;
          </Link>
        </div>

        {!hasEvents ? (
          <p className="text-slate-500 text-lg">{intl.t('home.upcoming.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingHackathons.map((event) => (
              <EventCard
                key={event.slug}
                name={event.name}
                href={`/${intl.locale}/events/${event.slug}`}
                startDate={event.startDate}
                endDate={event.endDate}
                location={event.location}
                description={event.description?.[intl.locale] || event.description?.en}
                eventType="hackathon"
                imageUrl={event.imageUrl}
                featured
              />
            ))}
            {upcomingHackNights.map((hn) => (
              <EventCard
                key={hn.slug}
                name={`${hn.name} — ${hn.topic}`}
                href={`/${intl.locale}/events/${hn.slug}`}
                startDate={hn.date}
                endDate={hn.endDate}
                location={hn.location}
                description={hn.description[intl.locale] || hn.description.en}
                eventType="hacknight"
                imageUrl={hn.imageUrl}
                sponsor={hn.sponsor}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={`/${intl.locale}/events`}
            className="text-sm font-medium text-org-accent hover:text-org-accent-dark transition-colors"
          >
            {intl.t('home.hacknights.seeAll')} &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
