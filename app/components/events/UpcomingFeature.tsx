'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import { getUpcomingEvents } from '@/lib/events'
import { getUpcomingHackNights, type HackNight } from '@/data/hacknights'
import type { Event } from '@/types/events'
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'
import SubscribeForm from '../home/SubscribeForm'

type UpcomingItem =
  | { kind: 'hackathon'; slug: string; name: string; startDate: string; endDate: string; location: string; description?: string; imageUrl?: string }
  | { kind: 'hacknight'; slug: string; name: string; startDate: string; endDate?: string; location: string; description?: string; imageUrl?: string; sponsor?: string }

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

function pickNext(intl: ReturnType<typeof useIntl>): UpcomingItem | null {
  const hackathons: UpcomingItem[] = getUpcomingEvents().map((e: Event) => ({
    kind: 'hackathon',
    slug: e.slug,
    name: e.name,
    startDate: e.startDate,
    endDate: e.endDate,
    location: e.location,
    description: e.description?.[intl.locale] || e.description?.en,
    imageUrl: e.imageUrl,
  }))
  const hackNights: UpcomingItem[] = getUpcomingHackNights().map((hn: HackNight) => ({
    kind: 'hacknight',
    slug: hn.slug,
    name: `${hn.name}: ${hn.topic}`,
    startDate: hn.date,
    endDate: hn.endDate,
    location: hn.location,
    description: hn.description[intl.locale] || hn.description.en,
    imageUrl: hn.imageUrl,
    sponsor: hn.sponsor,
  }))
  const all = [...hackathons, ...hackNights].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
  return all[0] ?? null
}

function PolaroidFallback({ tag }: { tag: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="relative bg-white p-3 pb-10 shadow-xl"
        style={{ transform: 'rotate(-4deg)' }}
      >
        {/* Masking-tape strip */}
        <span
          aria-hidden="true"
          className="absolute -top-3 left-8 rotate-[-6deg] bg-org-accent/80 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-sm"
        >
          save the date
        </span>
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hackbcnlogo.png"
            alt=""
            aria-hidden="true"
            className="w-1/2 h-auto opacity-90"
          />
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
          {tag}
        </p>
      </div>
    </div>
  )
}

export default function UpcomingFeature() {
  const intl = useIntl()
  const next = pickNext(intl)

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-org-accent mb-8">
          / next up
        </p>

        {next ? (
          <article className="relative overflow-hidden rounded-2xl border border-org-accent/30 ring-1 ring-org-accent/10 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              {/* Details column */}
              <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-org-accent">
                  {next.kind === 'hackathon' ? 'hackathon' : 'hack night'}
                  {next.kind === 'hacknight' && next.sponsor && (
                    <span className="ml-3 text-slate-500">· {next.sponsor}</span>
                  )}
                </p>

                <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                  {next.name}
                </h2>

                <dl className="mt-7 space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 mt-0.5 text-org-accent flex-shrink-0" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Date</dt>
                      <dd className="text-lg font-semibold text-slate-900">
                        {formatDateRange(next.startDate, next.endDate)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 mt-0.5 text-org-accent flex-shrink-0" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">Location</dt>
                      <dd className="text-lg text-slate-700">{next.location}</dd>
                    </div>
                  </div>
                </dl>

                {next.description && (
                  <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-prose">
                    {next.description}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/${intl.locale}/events/${next.slug}`}
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

              {/* Image column — real photo if available, branded polaroid fallback otherwise */}
              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-8 sm:p-12 flex items-center justify-center">
                {next.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={next.imageUrl}
                    alt={next.name}
                    className="w-full max-w-md aspect-[4/3] object-cover rounded-xl shadow-lg"
                  />
                ) : (
                  <PolaroidFallback
                    tag={`v${
                      next.kind === 'hackathon'
                        ? (next.name.match(/(\d{2})$/)?.[1] ?? '')
                        : ''
                    } · ${formatDateRange(next.startDate, next.endDate)}`.replace(/^v\s·\s/, '')}
                  />
                )}
              </div>
            </div>
          </article>
        ) : (
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
        )}
      </div>
    </section>
  )
}
