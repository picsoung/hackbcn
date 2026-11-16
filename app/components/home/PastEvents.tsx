'use client'

import Image from 'next/image'
import Link from 'next/link'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import type { HomeEvent } from '@/lib/homepage'
import { homeCopy } from '@/data/homepage'
import { youtubeId } from '@/app/helpers/youtube'
import { useIntl } from '../Intl'
import Dither from '../Dither'

const textLink =
  'inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline decoration-accent/50 underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

export default function PastEvents({
  featured,
  compact,
}: {
  featured: HomeEvent[]
  compact: HomeEvent[]
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  if (!featured.length && !compact.length) return null
  const href = (event: HomeEvent) => `/${intl.locale}/events/${event.slug}`
  const projectLabel = (event: HomeEvent) =>
    event.projectCount
      ? `${event.projectCount} ${event.projectCount === 1 ? copy.projectSingular : copy.projects}`
      : copy.projects

  return (
    <section
      id="past-events"
      aria-labelledby="home-events-title"
      className="scroll-mt-6 bg-band-3 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="home-events-title"
              className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              {intl.t('home.past.title')}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-dim">
              {copy.wallIntro}
            </p>
          </div>
          <Link
            href={`/${intl.locale}/events#past`}
            className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.allEvents}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((event) => {
            const film = youtubeId(event.recapVideoUrl ?? '')
            return (
              <article key={event.slug} className="hb-px bg-band-2 p-px">
                <div className="hb-px flex h-full flex-col bg-ground-raised">
                  {film ? (
                    <div className="overflow-hidden">
                      <LiteYouTubeEmbed
                        id={film}
                        title={event.name}
                        announce={copy.watchFilm}
                        poster="maxresdefault"
                        params="playsinline=1&rel=0"
                      />
                    </div>
                  ) : event.photo ? (
                    <Dither
                      src={event.photo.src}
                      alt={event.photo.alt}
                      className="relative aspect-video"
                      sizes="(min-width: 768px) 600px, 90vw"
                    />
                  ) : (
                    <div className="relative aspect-video bg-band-2">
                      {event.imageUrl && (
                        <Image
                          src={event.imageUrl}
                          alt={event.name}
                          fill
                          sizes="(min-width: 768px) 600px, 90vw"
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="mb-4 flex min-h-6 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-ink-dim">
                      <span className="font-medium text-inversion">
                        {event.eventType === 'hacknight'
                          ? copy.latestNight
                          : copy.weekend}
                      </span>
                      {film && (
                        <a
                          href={event.recapVideoUrl}
                          className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          {copy.watchFilm} · {copy.filmDuration}
                        </a>
                      )}
                    </div>
                    <div className="flex items-start gap-4">
                      {event.imageUrl && (
                        <span className="hb-px relative block h-14 w-14 shrink-0 overflow-hidden bg-band-2 sm:h-16 sm:w-16">
                          <Image
                            src={event.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                          <Link
                            href={href(event)}
                            className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                          >
                            {event.name}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                          <time dateTime={event.startDate}>
                            {event.dateLabel}
                          </time>{' '}
                          · {event.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 pt-4">
                      <Link href={href(event)} className={textLink}>
                        {copy.exploreEvent}
                      </Link>
                      {event.hasProjects && (
                        <Link
                          href={`${href(event)}#projects`}
                          className={textLink}
                        >
                          {projectLabel(event)}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {compact.map((event) => (
            <li key={event.slug} className="min-w-0">
              <Link
                href={`${href(event)}${event.hasVideo ? '#recap' : event.photo ? '#gallery' : ''}`}
                aria-label={`${copy.exploreEvent}: ${event.name}`}
                className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <article className="hb-px h-full bg-band-2 p-px">
                  <div className="hb-px flex h-full flex-col bg-ground-raised">
                    <div className="relative aspect-square bg-band-2">
                      {event.imageUrl && (
                        <Image
                          src={event.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 290px, 45vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <p className="text-xs text-ink-dim">
                        <time dateTime={event.startDate}>
                          {event.dateLabel}
                        </time>
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-ink transition-colors group-hover:text-accent sm:text-lg">
                        {event.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink-dim sm:text-sm">
                        {event.location}
                      </p>
                      <p className="mt-auto pt-4 text-xs font-medium text-inversion sm:text-sm">
                        <span>
                          {event.hasVideo
                            ? copy.video
                            : event.photo
                              ? copy.photos
                              : copy.exploreEvent}
                        </span>
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
