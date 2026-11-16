'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomeEvent } from '@/lib/homepage'
import { homeCopy } from '@/data/homepage'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'
import { useIntl } from '../Intl'

export default function HomeEventCard({
  event,
  upcoming = false,
}: {
  event: HomeEvent
  upcoming?: boolean
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const eventHref = `/${intl.locale}/events/${event.slug}`
  const title = event.name
    .replace(/^HackBarna\s+/, '')
    .replace(/\s*[—–]\s*Powered by\s*/i, ' · ')
    .replace(/\s+powered by.*$/i, '')
  const buttonClass = `hb-px mt-4 inline-flex min-h-11 w-full items-center justify-center px-2 py-2 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:text-sm ${upcoming ? 'bg-accent text-ground hover:bg-inversion focus-visible:ring-ground' : 'bg-band-2 text-ink hover:bg-accent hover:text-ground focus-visible:ring-ink'}`

  return (
    <article className="hb-px h-full bg-band-2 p-px">
      <div className="hb-px flex h-full flex-col bg-ground-raised">
        <div className="relative flex aspect-square items-center justify-center bg-band-2">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 390px, 45vw"
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-ink">HackBarna</span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <p className="text-xs leading-relaxed text-ink-dim">
            <time dateTime={event.startDate}>{event.dateLabel}</time>
          </p>
          <h3 className="mt-2 text-base font-semibold leading-snug text-ink sm:text-xl">
            {title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-dim sm:text-sm">
            {event.location}
          </p>
          <div className="mt-auto">
            {upcoming && event.registrationUrl ? (
              <a
                href={withUtm(event.registrationUrl, {
                  medium: 'cta',
                  campaign: `hackbarna-${event.slug}`,
                  content: 'register-home-upcoming',
                })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackOutbound('registration_click', {
                    event_slug: event.slug,
                    source: 'register-home-upcoming',
                  })
                }
                className={buttonClass}
                aria-label={`${intl.t('events.register')}: ${event.name}`}
              >
                {intl.t('events.register')}
              </a>
            ) : (
              <Link
                href={eventHref}
                className={buttonClass}
                aria-label={`${upcoming ? intl.t('events.viewDetails') : copy.exploreEvent}: ${event.name}`}
              >
                {upcoming ? intl.t('events.viewDetails') : copy.exploreEvent}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
