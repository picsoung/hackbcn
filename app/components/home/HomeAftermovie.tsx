'use client'

import Link from 'next/link'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { youtubeId } from '@/app/helpers/youtube'
import { homeCopy } from '@/data/homepage'
import type { Event } from '@/types/events'
import { useIntl } from '../Intl'

export default function HomeAftermovie({
  event,
}: {
  event?: Pick<Event, 'slug' | 'name' | 'recapVideoUrl'>
}) {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const id = youtubeId(event?.recapVideoUrl ?? '')
  if (!event || !id) return null

  return (
    <section
      aria-labelledby="home-film-title"
      className="bg-accent py-12 text-ground sm:py-16"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div>
          <h2
            id="home-film-title"
            className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {copy.movieTitle}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed">{copy.movieIntro}</p>
          <Link
            href={`/${intl.locale}/events/${event.slug}`}
            className="mt-5 inline-flex min-h-11 items-center gap-3 font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ground"
          >
            {event.name} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <figure className="min-w-0">
          <div className="hb-px hb-px-lg overflow-hidden">
            <LiteYouTubeEmbed
              id={id}
              title={event.name}
              announce={copy.watchFilm}
              poster="maxresdefault"
            />
          </div>
          <figcaption className="mt-3 text-xs">
            <a
              href={event.recapVideoUrl}
              className="inline-flex min-h-6 items-center underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ground"
            >
              {copy.watchYoutube} · {copy.filmDuration}
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
