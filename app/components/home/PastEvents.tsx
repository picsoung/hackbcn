'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { HomePastEvent } from '@/lib/home-events'
import { homeCopy } from '@/data/homepage'
import { useIntl } from '../Intl'

const resourceClass =
  'inline-flex min-h-11 items-center gap-2 text-sm text-ink-dim underline decoration-ink-dim/40 underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

export default function PastEvents({ events }: { events: HomePastEvent[] }) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  if (!events.length) return null

  return (
    <section
      id="past-events"
      aria-labelledby="home-past-title"
      className="scroll-mt-6 bg-ground-raised py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              id="home-past-title"
              className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              {copy.pastTitle}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-dim">
              {copy.pastIntro}
            </p>
          </div>
          <Link
            href={`/${intl.locale}/events#past`}
            className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.allEvents} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ul className="divide-y divide-band-2 border-y border-band-2">
          {events.map((event) => {
            const href = `/${intl.locale}/events/${event.slug}`
            return (
              <li key={event.slug}>
                <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-4 py-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-7 lg:grid-cols-[7rem_minmax(0,1fr)_15rem] lg:items-center">
                  <Link
                    href={href}
                    className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    aria-label={event.name}
                  >
                    <span className="hb-px relative block aspect-square overflow-hidden bg-band-2">
                      {event.imageUrl && (
                        <Image
                          src={event.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 112px, 72px"
                          className="object-cover transition-opacity group-hover:opacity-90"
                        />
                      )}
                    </span>
                  </Link>
                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed text-ink-dim sm:text-sm">
                      <time dateTime={event.startDate}>{event.dateLabel}</time>
                      <span aria-hidden="true"> · </span>
                      {intl.t(
                        event.eventType === 'hacknight'
                          ? 'events.hacknight'
                          : 'events.hackathon',
                      )}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-ink sm:text-2xl">
                      <Link
                        href={href}
                        className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        {event.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                      {event.location}
                    </p>
                  </div>
                  <div className="col-span-2 mt-3 flex flex-wrap gap-x-5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:mt-0 lg:gap-x-4">
                    {event.hasProjects && (
                      <Link href={`${href}#projects`} className={resourceClass}>
                        {event.projectCount ? (
                          <span className="font-semibold text-ink">
                            {event.projectCount}
                          </span>
                        ) : null}
                        {event.projectCount === 1
                          ? copy.projectSingular
                          : copy.projects}
                      </Link>
                    )}
                    {event.postCount > 0 && (
                      <Link
                        href={`${href}#testimonials`}
                        className={resourceClass}
                      >
                        <span className="font-semibold text-ink">
                          {event.postCount}
                        </span>
                        {event.postCount === 1 ? copy.postSingular : copy.posts}
                      </Link>
                    )}
                    {event.photoCount > 0 && (
                      <Link href={`${href}#gallery`} className={resourceClass}>
                        {copy.photos}
                      </Link>
                    )}
                    {event.hasVideo && (
                      <Link href={`${href}#recap`} className={resourceClass}>
                        {copy.video}
                      </Link>
                    )}
                    {!event.hasProjects &&
                      !event.postCount &&
                      !event.photoCount &&
                      !event.hasVideo && (
                        <Link href={href} className={resourceClass}>
                          {intl.t('events.viewDetails')}{' '}
                          <span aria-hidden="true">↗</span>
                        </Link>
                      )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
