'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import type { HomeEvent } from '@/lib/homepage'
import { homeCopy } from '@/data/homepage'
import Polaroid from '../Polaroid'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'

function eventLabel(event: HomeEvent) {
  return event.name
    .replace(/^HackNight #\d+:\s*/, '')
    .replace(/ powered by.*$/i, '')
    .replace(/^HackBarna /, '')
}

export default function OrgHero({
  upcoming,
  upcomingDateLabel,
  highlights,
}: {
  upcoming: Event | null
  upcomingDateLabel?: string
  highlights: HomeEvent[]
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const eventHref = upcoming ? `/${intl.locale}/events/${upcoming.slug}` : ''
  const primaryClass =
    'hb-px inline-flex min-h-11 items-center gap-3 bg-accent px-5 py-3 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground'

  return (
    <section className="overflow-hidden bg-ground">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
        <div>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight text-ink">
            {copy.title} <br />
            <span className="text-accent">{copy.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg">
            {copy.intro}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {upcoming ? (
              <a
                href={withUtm(upcoming.registrationUrl || eventHref, {
                  medium: 'cta',
                  campaign: `hackbarna-${upcoming.slug}`,
                  content: 'register-home-hero',
                })}
                {...(upcoming.registrationUrl
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                onClick={() =>
                  trackOutbound('registration_click', {
                    event_slug: upcoming.slug,
                    source: 'register-home-hero',
                  })
                }
                className={primaryClass}
              >
                {intl.t('events.register')}
              </a>
            ) : (
              <a href="#past-events" className={primaryClass}>
                {copy.explore}
              </a>
            )}
            <a
              href="#join"
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {copy.invitation}
            </a>
          </div>
        </div>
        {upcoming ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-5 sm:flex-row">
            <Polaroid
              src={upcoming.imageUrl || '/brand/signet-black.svg'}
              alt={upcoming.name}
              label={upcoming.name}
              href={eventHref}
              rotate={-3}
              width="w-44 shrink-0"
              tapeColor="accent"
              overlayText={copy.exploreEvent}
            />
            <div>
              <p className="text-sm font-semibold text-inversion">
                {copy.nextUp}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                <Link
                  href={eventHref}
                  className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {upcoming.name}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-ink-dim">{upcomingDateLabel}</p>
              <p className="mt-1 text-sm text-ink-dim">{upcoming.location}</p>
            </div>
          </div>
        ) : (
          <figure className="mx-auto pt-4 sm:pt-0">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {highlights.map((event, index) => (
                <Polaroid
                  key={event.slug}
                  src={
                    (index === 0 ? event.photo?.src : undefined) ||
                    event.imageUrl ||
                    '/brand/signet-black.svg'
                  }
                  alt={
                    index === 0 && event.photo ? event.photo.alt : event.name
                  }
                  label={eventLabel(event)}
                  href={`/${intl.locale}/events/${event.slug}`}
                  rotate={index === 0 ? -6 : 4}
                  translateY={index === 0 ? 5 : -8}
                  width="w-32 sm:w-44 lg:w-48"
                  overlayText={copy.exploreEvent}
                  ariaLabel={`${copy.exploreEvent}: ${event.name}`}
                />
              ))}
            </div>
          </figure>
        )}
      </div>
    </section>
  )
}
