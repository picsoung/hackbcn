'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import Polaroid from '../Polaroid'
import { homeCopy } from '@/data/homepage'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'

export default function OrgHero({
  upcoming = null,
  upcomingDateLabel,
}: {
  upcoming?: Event | null
  upcomingDateLabel?: string
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const eventHref = upcoming ? `/${intl.locale}/events/${upcoming.slug}` : ''

  return (
    <section className="relative overflow-hidden bg-ground">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-16 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h1 className="text-[clamp(2rem,9vw,3rem)] sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.15]">
              {intl.t('home.hero.headline.1')}{' '}
              <span className="text-accent">
                {intl.t('home.hero.headline.2')}
              </span>{' '}
              {intl.t('home.hero.headline.3')}{' '}
              <span className="text-accent">
                {intl.t('home.hero.headline.4')}
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink-dim leading-relaxed max-w-lg">
              {copy.intro}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={upcoming ? eventHref : '#past-events'}
                className="hb-px inline-flex min-h-11 items-center gap-3 bg-accent px-5 py-3 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground"
              >
                {upcoming ? intl.t('events.viewDetails') : copy.explore}
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href="#join"
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {copy.invitation}
              </a>
            </div>
          </div>

          {/* The next event takes priority whenever one is scheduled. */}
          {upcoming ? (
            <div className="relative flex flex-col items-center lg:items-start">
              <Polaroid
                src={upcoming.imageUrl || '/brand/signet-black.svg'}
                alt={upcoming.name}
                label={upcoming.name}
                href={eventHref}
                rotate={-3}
                translateY={0}
                width="w-72 sm:w-80"
                tapeColor="accent"
                overlayText={`${intl.t('events.viewDetails')} →`}
              />

              <div className="mt-8 w-full max-w-sm">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
                  / {copy.nextUp}
                </p>
                <p className="mt-3 font-mono text-sm uppercase tracking-[0.14em] text-ink">
                  {upcomingDateLabel ?? upcoming.startDate.slice(0, 10)}
                </p>
                <p className="mt-1 text-sm text-ink-dim">{upcoming.location}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {/* The site's most prominent RSVP link, so it carries the
                      same attribution as the two on the event page. withUtm
                      passes internal hrefs through untouched, so the fallback
                      to the event page stays clean. */}
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
                    className="hb-px inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
                  >
                    {intl.t('events.register')}
                    <span aria-hidden="true">→</span>
                  </a>
                  <Link
                    href={eventHref}
                    className="text-sm font-semibold text-ink-dim underline underline-offset-4 transition-colors hover:text-ink"
                  >
                    {intl.t('events.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <figure className="relative mx-auto w-full max-w-xl px-2">
              <Link
                href={`/${intl.locale}/events/hacknight-5-jevathon-2026#gallery`}
                className="group block -rotate-2 transition-transform duration-300 hover:rotate-0 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                <span className="hb-px hb-px-lg block bg-paper p-2 pb-5 sm:pb-7">
                  <span className="hb-dither block relative aspect-[4/3]">
                    <Image
                      src="/events/hacknight-5-jevathon-2026/team-discussion.jpg"
                      alt={copy.heroAlt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 520px, (min-width: 640px) 540px, 90vw"
                      className="hb-dither-img object-center"
                    />
                    <span aria-hidden="true" className="hb-dither-tex" />
                  </span>
                  <span className="mt-3 block px-1 text-center text-sm font-medium text-ground">
                    {copy.heroCaption}
                  </span>
                </span>
              </Link>
              <figcaption className="mt-5 text-xs text-ink-dim">
                Jev-a-thon · Itnig · {copy.photosBy}{' '}
                <a
                  href="https://polducamp.com/"
                  className="underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Pol Ducamp
                </a>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}
