'use client'

import { useState } from 'react'
import { useIntl } from '../Intl'
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

export default function OrgHero({ shorts = [] }: { shorts?: Short[] }) {
  const intl = useIntl()
  const [activeRecap, setActiveRecap] = useState<string | null>(null)

  // Map event slug → its recap Short url, so a polaroid with a recap opens the lightbox.
  const shortBySlug = new Map(shorts.map((s) => [s.eventSlug, s.url]))

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              {intl.t('home.hero.headline.1')}{' '}
              <span className="text-org-accent">{intl.t('home.hero.headline.2')}</span>{' '}
              {intl.t('home.hero.headline.3')}{' '}
              <span className="text-org-accent">{intl.t('home.hero.headline.4')}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
              {intl.t('home.hero.description')}
            </p>
            <div className="mt-8 max-w-sm">
              <SubscribeForm />
            </div>
          </div>

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
        </div>
      </div>

      <RecapLightbox url={activeRecap} title="Event recap" onClose={() => setActiveRecap(null)} />
    </section>
  )
}
