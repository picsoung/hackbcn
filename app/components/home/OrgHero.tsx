'use client'

import { useIntl } from '../Intl'
import SubscribeForm from './SubscribeForm'

const photos = [
  { src: 'https://images.lumacdn.com/event-covers/41/f4b95409-4ae0-4c6d-8cc8-7ca32c4368fc', label: 'Hack Night #1' },
  { src: 'https://images.lumacdn.com/event-covers/ro/c43bde0a-23b8-4231-a81b-5f66a3f5efaa.png', label: 'Skill-a-thon' },
  { src: 'https://images.lumacdn.com/event-covers/2s/47338d9f-91de-417d-b96b-6c78be64dc73.png', label: 'HackNight #3' },
]

export default function OrgHero() {
  const intl = useIntl()

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
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="bg-white p-2 pb-8 shadow-lg w-44"
                  style={{
                    transform: `rotate(${i === 0 ? -6 : i === 1 ? 2 : -3}deg) translateY(${i === 1 ? -12 : i === 2 ? 8 : 0}px)`,
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="w-full aspect-square object-cover"
                  />
                  <p className="text-center text-xs text-slate-500 mt-2 font-medium">
                    {photo.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
