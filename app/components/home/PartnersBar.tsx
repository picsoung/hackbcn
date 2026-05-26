'use client'

import { useIntl } from '../Intl'
import type { Sponsor } from '@/data/sponsors'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'

const PRIORITY_ORDER = [
  'AmazonDeveloper',
  'Vonage',
  'Lovable',
  'Hugging Face',
  'Mistral AI',
  'Algolia',
  'n8n',
  'Anthropic',
  'ElevenLabs',
  'Glovo',
  'Linkup',
  'eDreams',
  'Travelperk',
  'Acai',
]

// Logos are sourced server-side and passed in — keeps PartnersBar agnostic of
// where event data lives (MDX, legacy TS, or hack-night sponsors).
export default function PartnersBar({ logos }: { logos: Sponsor[] }) {
  const intl = useIntl()

  if (logos.length === 0) return null

  const sorted = [...logos].sort((a, b) => {
    const ai = PRIORITY_ORDER.indexOf(a.name)
    const bi = PRIORITY_ORDER.indexOf(b.name)
    const aRank = ai === -1 ? PRIORITY_ORDER.length : ai
    const bRank = bi === -1 ? PRIORITY_ORDER.length : bi
    return aRank - bRank
  })

  return (
    <section className="bg-white border-t border-gray-100 py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-400 mb-6">
          {intl.t('home.partners.title')}
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex animate-marquee motion-reduce:animate-none">
          {[...sorted, ...sorted].map((sponsor, i) => (
            <a
              key={`${sponsor.name}-${i}`}
              href={withUtm(sponsor.url, {
                medium: 'partner',
                campaign: 'hackbarna-homepage',
                content: 'marquee',
              })}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackOutbound('partner_marquee_click', {
                  sponsor: sponsor.name,
                  source: 'homepage_marquee',
                })
              }
              className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
