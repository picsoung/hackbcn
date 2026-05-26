'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'
import SubscribeForm from '../home/SubscribeForm'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateRange(start: string, end?: string) {
  const s = new Date(start)
  const startStr = `${MONTHS_SHORT[s.getUTCMonth()]} ${s.getUTCDate()}`
  if (!end) return `${startStr}, ${s.getUTCFullYear()}`
  const e = new Date(end)
  if (s.getUTCMonth() === e.getUTCMonth() && s.getUTCDate() === e.getUTCDate()) {
    return `${startStr}, ${s.getUTCFullYear()}`
  }
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${MONTHS_SHORT[s.getUTCMonth()]} ${s.getUTCDate()}–${e.getUTCDate()}, ${e.getUTCFullYear()}`
  }
  return `${startStr} – ${MONTHS_SHORT[e.getUTCMonth()]} ${e.getUTCDate()}, ${e.getUTCFullYear()}`
}

function PolaroidFallback({ tag, className = '' }: { tag: string; className?: string }) {
  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <div className="relative bg-white p-3 pb-10 shadow-xl" style={{ transform: 'rotate(-4deg)' }}>
        <span
          aria-hidden="true"
          className="absolute -top-3 left-8 rotate-[-6deg] bg-org-accent/80 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-sm"
        >
          save the date
        </span>
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hackbcnlogo.png" alt="" aria-hidden="true" className="w-1/2 h-auto opacity-90" />
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
          {tag}
        </p>
      </div>
    </div>
  )
}

function typeLabel(event: Event) {
  return event.eventType === 'hacknight' ? 'hack night' : 'hackathon'
}

// Big hero card — used when there's a single upcoming event.
function FeaturedHero({ event, locale }: { event: Event; locale: string }) {
  const intl = useIntl()
  const description = event.description?.[intl.locale] || event.description?.en || ''
  const isHackNight = event.eventType === 'hacknight'

  return (
    <article className="relative overflow-hidden rounded-2xl border border-org-accent/30 ring-1 ring-org-accent/10 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-org-accent">
            {typeLabel(event)}
            {isHackNight && event.sponsor && (
              <span className="ml-3 text-slate-500">· {event.sponsor}</span>
            )}
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.05]">
            {event.name}
          </h2>
          <dl className="mt-7 space-y-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5 text-org-accent flex-shrink-0" aria-hidden="true" />
              <dd className="text-lg font-semibold text-slate-900">{formatDateRange(event.startDate, event.endDate)}</dd>
            </div>
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 mt-0.5 text-org-accent flex-shrink-0" aria-hidden="true" />
              <dd className="text-lg text-slate-700">{event.location}</dd>
            </div>
          </dl>
          {description && (
            <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-prose">{description}</p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/events/${event.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-org-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-org-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-org-accent focus-visible:ring-offset-2"
            >
              View details
              <span aria-hidden="true">→</span>
            </Link>
            <span className="inline-flex items-center bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-org-accent">
              save the date
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-8 sm:p-12 flex items-center justify-center">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full max-w-md aspect-[4/3] object-cover rounded-xl shadow-lg"
            />
          ) : (
            <PolaroidFallback tag={formatDateRange(event.startDate, event.endDate)} className="max-w-md" />
          )}
        </div>
      </div>
    </article>
  )
}

// Compact card — used in the grid when there are 2+ upcoming events.
function CompactCard({ event, locale }: { event: Event; locale: string }) {
  const isHackNight = event.eventType === 'hacknight'
  return (
    <Link
      href={`/${locale}/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-org-accent/30 ring-1 ring-org-accent/10 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-org-accent"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/hackbcnlogo.png" alt="" aria-hidden="true" className="w-1/4 h-auto opacity-80" />
        )}
      </div>
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-org-accent">
          {typeLabel(event)}
          {isHackNight && event.sponsor && <span className="ml-2 text-slate-500">· {event.sponsor}</span>}
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 leading-tight group-hover:text-org-accent transition-colors">
          {event.name}
        </h3>
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarIcon className="h-4 w-4 text-org-accent flex-shrink-0" aria-hidden="true" />
            {formatDateRange(event.startDate, event.endDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPinIcon className="h-4 w-4 text-org-accent flex-shrink-0" aria-hidden="true" />
            {event.location}
          </div>
        </div>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-org-accent">
          View details
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  )
}

export default function UpcomingFeature({ events }: { events: Event[] }) {
  const intl = useIntl()

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-org-accent mb-8">
          / next up
        </p>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-stone-50 p-10 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Next one is <span className="text-org-accent">brewing</span>.
            </h2>
            <p className="mt-4 text-base text-slate-600 max-w-md mx-auto">
              We&apos;re between editions. Drop your email and we&apos;ll tell you the moment dates are set.
            </p>
            <div className="mt-8 max-w-sm mx-auto">
              <SubscribeForm />
            </div>
          </div>
        ) : events.length === 1 ? (
          <FeaturedHero event={events[0]} locale={intl.locale} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((event) => (
              <CompactCard key={event.slug} event={event} locale={intl.locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
