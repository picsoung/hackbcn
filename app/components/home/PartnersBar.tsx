'use client'

import { useIntl } from '../Intl'
import { getSponsorsByEvent } from '@/data/sponsors'
import { getCommunitySponsorsByEvent } from '@/data/communitySponsors'

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

export default function PartnersBar() {
  const intl = useIntl()
  const aisummitSponsors = getSponsorsByEvent('aisummit25').sponsors
  const v1Sponsors = getSponsorsByEvent('v1-2024').sponsors
  const communitySponsors = getCommunitySponsorsByEvent('aisummit25').communitySponsors

  const allLogos = [...aisummitSponsors, ...v1Sponsors, ...communitySponsors]
  const uniqueLogos = allLogos.filter((s, i, arr) =>
    arr.findIndex(x => x.name === s.name) === i
  )

  uniqueLogos.sort((a, b) => {
    const ai = PRIORITY_ORDER.indexOf(a.name)
    const bi = PRIORITY_ORDER.indexOf(b.name)
    const aRank = ai === -1 ? PRIORITY_ORDER.length : ai
    const bRank = bi === -1 ? PRIORITY_ORDER.length : bi
    return aRank - bRank
  })

  if (uniqueLogos.length === 0) return null

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
        <div className="flex animate-marquee">
          {[...uniqueLogos, ...uniqueLogos].map((sponsor, i) => (
            <a
              key={`${sponsor.name}-${i}`}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all"
            >
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
