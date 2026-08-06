'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import SubscribeForm from './SubscribeForm'
import Polaroid from '../Polaroid'
import RecapLightbox from '../RecapLightbox'

type HeroPolaroid = {
  src: string
  label: string
  slug: string
  rotate: number
  translateY: number
}

type Short = { url: string; eventName: string; eventSlug: string }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatRange(start: string, end?: string) {
  const s = new Date(start)
  const head = `${MONTHS[s.getUTCMonth()]} ${s.getUTCDate()}`
  if (!end) return `${head}, ${s.getUTCFullYear()}`
  const e = new Date(end)
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return s.getUTCDate() === e.getUTCDate()
      ? `${head}, ${e.getUTCFullYear()}`
      : `${head}–${e.getUTCDate()}, ${e.getUTCFullYear()}`
  }
  return `${head} – ${MONTHS[e.getUTCMonth()]} ${e.getUTCDate()}, ${e.getUTCFullYear()}`
}

const photos: HeroPolaroid[] = [
  {
    src: 'https://images.lumacdn.com/event-covers/41/f4b95409-4ae0-4c6d-8cc8-7ca32c4368fc',
    label: 'Hack Night #1',
    slug: 'hacknight-edreams-2024',
    rotate: -6,
    translateY: 0,
  },
  {
    src: 'https://images.lumacdn.com/event-covers/ro/c43bde0a-23b8-4231-a81b-5f66a3f5efaa.png',
    label: 'Skill-a-thon',
    slug: 'skillathon-hacknight-2026',
    rotate: 2,
    translateY: -12,
  },
  {
    src: 'https://images.lumacdn.com/event-covers/2s/47338d9f-91de-417d-b96b-6c78be64dc73.png',
    label: 'HackNight #3',
    slug: 'hacknight-3-linkup-2026',
    rotate: -3,
    translateY: 8,
  },
]

export default function OrgHero({
  shorts = [],
  upcoming = null,
}: {
  shorts?: Short[]
  upcoming?: Event | null
}) {
  const intl = useIntl()
  const [activeRecap, setActiveRecap] = useState<string | null>(null)

  // Map event slug → its recap Short url, so a polaroid with a recap opens the lightbox.
  const shortBySlug = new Map(shorts.map((s) => [s.eventSlug, s.url]))
  const eventHref = upcoming ? `/${intl.locale}/events/${upcoming.slug}` : ''

  return (
    /* Top of the ladder. No gradient stands in for the old cream wash: the
       dithered polaroid stack is the imagery, and a plain ramp step behind it
       is what the Sunset Ladder Rule asks for. */
    <section className="relative overflow-hidden bg-ground">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="hb-reveal text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-[1.15]">
              {intl.t('home.hero.headline.1')}{' '}
              <span className="text-accent">{intl.t('home.hero.headline.2')}</span>{' '}
              {intl.t('home.hero.headline.3')}{' '}
              <span className="text-accent">{intl.t('home.hero.headline.4')}</span>
            </h1>
            <p className="mt-6 text-lg text-ink-dim leading-relaxed max-w-lg">
              {intl.t('home.hero.description')}
            </p>
            <div className="mt-8 max-w-sm">
              <SubscribeForm />
            </div>
          </div>

          {/* PRODUCT.md principle 6: future surfaces before retrospective
              ones. The visual slot goes to the next event; the past-polaroid
              stack below is the fallback for when nothing is scheduled, so the
              hero is never empty. */}
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
                overlayText="view event →"
              />

              <div className="mt-8 w-full max-w-sm">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
                  / next up
                </p>
                <p className="mt-3 font-mono text-sm uppercase tracking-[0.14em] text-ink">
                  {formatRange(upcoming.startDate, upcoming.endDate)}
                </p>
                <p className="mt-1 text-sm text-ink-dim">{upcoming.location}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href={upcoming.registrationUrl || eventHref}
                    {...(upcoming.registrationUrl
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
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
          <div className="relative hidden lg:block">
            <div className="flex gap-4 justify-center items-start">
              {photos.map((photo) => {
                const recapUrl = shortBySlug.get(photo.slug)
                if (recapUrl) {
                  // Polaroid with a recap → opens the fullscreen lightbox.
                  return (
                    <Polaroid
                      key={photo.slug}
                      src={photo.src}
                      alt={photo.label}
                      label={photo.label}
                      onActivate={() => setActiveRecap(recapUrl)}
                      rotate={photo.rotate}
                      translateY={photo.translateY}
                      overlayText="view recap →"
                    />
                  )
                }
                // No recap → links to the event detail page.
                return (
                  <Polaroid
                    key={photo.slug}
                    src={photo.src}
                    alt={photo.label}
                    label={photo.label}
                    href={`/${intl.locale}/events/${photo.slug}`}
                    rotate={photo.rotate}
                    translateY={photo.translateY}
                    overlayText="view event →"
                  />
                )
              })}
            </div>
          </div>
          )}
        </div>
      </div>

      <RecapLightbox url={activeRecap} title="Event recap" onClose={() => setActiveRecap(null)} />
    </section>
  )
}
