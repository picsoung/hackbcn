'use client'

import { useIntl } from '../Intl'
import { getUpcomingEvents, getPastEvents } from '@/lib/events'
import { getUpcomingHackNights, getPastHackNights } from '@/data/hacknights'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export default function EventList() {
  const intl = useIntl()
  const upcomingHackathons = getUpcomingEvents()
  const upcomingHackNights = getUpcomingHackNights()
  const pastHackathons = getPastEvents()
  const pastHackNights = getPastHackNights()

  const allUpcoming = [
    ...upcomingHackathons.map(e => ({
      type: 'hackathon' as const,
      name: e.name,
      date: e.startDate,
      location: e.location,
      href: `/${intl.locale}/events/${e.slug}`,
      imageUrl: e.imageUrl,
    })),
    ...upcomingHackNights.map(hn => ({
      type: 'hacknight' as const,
      name: `${hn.name} — ${hn.topic}`,
      date: hn.date,
      location: hn.location,
      href: `/${intl.locale}/events/${hn.slug}`,
      imageUrl: hn.imageUrl,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const allPast = [
    ...pastHackathons.map(e => ({
      name: e.name,
      date: e.startDate,
      location: e.location,
      href: `/${intl.locale}/events/${e.slug}`,
    })),
    ...pastHackNights.map(hn => ({
      name: hn.name,
      date: hn.date,
      location: hn.location,
      href: `/${intl.locale}/events/${hn.slug}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-12 text-center">
          {intl.t('home.navbar.events')}
        </h1>

        <div className="grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-16">
          {/* Archive sidebar */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {intl.t('events.archive')}
            </h2>
            <p className="text-sm text-slate-400 mb-6">{intl.t('events.archive.subtitle')}</p>

            {allPast.length > 0 ? (
              <div className="space-y-0 divide-y divide-gray-100">
                {allPast.map((event) => (
                  <Link
                    key={event.href}
                    href={event.href}
                    className="block py-3 group"
                  >
                    <p className="text-sm font-medium text-slate-800 group-hover:text-org-accent transition-colors">
                      {event.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {event.location} &middot; {formatShortDate(event.date)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{intl.t('events.noPastEvents')}</p>
            )}
          </div>

          {/* Upcoming events */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {intl.t('events.upcoming')}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {allUpcoming.length} {intl.t('home.navbar.events').toLowerCase()}
            </p>

            {allUpcoming.length > 0 ? (
              <div className="space-y-4">
                {allUpcoming.map((event) => (
                  <div
                    key={event.href}
                    className="flex items-center gap-5 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    {!event.imageUrl && (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-org-accent/20 to-org-accent/5 flex-shrink-0 flex items-center justify-center">
                        <CalendarIcon className="h-8 w-8 text-org-accent/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{event.name}</h3>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {formatShortDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={event.href}
                      className="text-sm font-medium text-org-accent hover:text-org-accent-dark transition-colors flex-shrink-0"
                    >
                      {intl.t('events.register')} &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">{intl.t('home.upcoming.empty')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
