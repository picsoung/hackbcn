'use client'

import Link from 'next/link'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { useIntl } from '../Intl'
import type { HomeEvent } from '@/lib/homepage'
import { homeCopy } from '@/data/homepage'
import { youtubeId } from '../../helpers/youtube'
import Polaroid from '../Polaroid'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'

export default function OrgHero({
  upcoming,
  recap,
}: {
  upcoming: HomeEvent | null
  recap?: HomeEvent
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const eventHref = upcoming ? `/${intl.locale}/events/${upcoming.slug}` : ''
  const videoId = youtubeId(recap?.recapVideoUrl ?? '')
  const fallback = upcoming ?? recap
  const primaryClass =
    'hb-px inline-flex min-h-11 items-center gap-3 bg-accent px-5 py-3 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground'

  return (
    <section className="overflow-hidden bg-ground">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
        <div>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight text-ink">
            {copy.title} <br />
            <span className="text-accent">{copy.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg">
            {copy.intro}
          </p>
          {upcoming && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-inversion">
                {copy.nextUp}
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-snug text-ink">
                <Link
                  href={eventHref}
                  className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {upcoming.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                <time dateTime={upcoming.startDate}>{upcoming.dateLabel}</time>
                {' · '}
                {upcoming.location}
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {upcoming?.registrationUrl ? (
              <a
                href={withUtm(upcoming.registrationUrl, {
                  medium: 'cta',
                  campaign: `hackbarna-${upcoming.slug}`,
                  content: 'register-home-hero',
                })}
                target="_blank"
                rel="noopener noreferrer"
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
            ) : upcoming ? (
              <Link href={eventHref} className={primaryClass}>
                {intl.t('events.viewDetails')}
              </Link>
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
        {videoId && recap ? (
          <figure className="mx-auto w-full max-w-xl">
            <div className="hb-px hb-px-lg hb-px-shadow-lg bg-paper p-2 sm:p-3">
              <div className="hb-px overflow-hidden [&_.lty-playbtn]:!rounded-none [&_.lty-playbtn]:!bg-accent [&_.lty-playbtn]:before:!border-l-ground [&_.yt-lite:hover_.lty-playbtn]:!bg-inversion [&_.lty-playbtn]:focus-visible:outline [&_.lty-playbtn]:focus-visible:outline-2 [&_.lty-playbtn]:focus-visible:outline-offset-4 [&_.lty-playbtn]:focus-visible:outline-paper">
                <LiteYouTubeEmbed
                  id={videoId}
                  title={recap.name}
                  poster="maxresdefault"
                  adNetwork={false}
                  params="playsinline=1&rel=0"
                  announce={copy.watchFilm}
                />
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 pb-1 pt-3 text-xs text-ground sm:text-sm">
                <Link
                  href={`/${intl.locale}/events/${recap.slug}`}
                  className="font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ground"
                >
                  {recap.name.replace(/^HackBarna\s+/, '')}
                </Link>
                <span>
                  {copy.watchFilm}
                  {recap.recapDuration === 89 ? ` · ${copy.filmDuration}` : ''}
                </span>
              </figcaption>
            </div>
          </figure>
        ) : fallback ? (
          <div className="mx-auto py-4">
            <Polaroid
              src={fallback.imageUrl || '/brand/signet-black.svg'}
              alt={fallback.name}
              label={fallback.name}
              href={`/${intl.locale}/events/${fallback.slug}`}
              width="w-56 sm:w-72"
              rotate={-3}
              overlayText={copy.exploreEvent}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
