'use client'

import Image from 'next/image'
import React from 'react' // Import React if you haven't already
import { useIntl } from './Intl'
import { Sponsor } from '@/data/sponsors'
import { useTheme } from '@/app/contexts/ThemeContext'

export default function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const intl = useIntl()
  const { theme } = useTheme()

  // Define logo sizes by tier
  const tierLogoSizes: Record<
    string,
    { height: number; maxWidth: number; className: string; containerClass: string }
  > = {
    supergold: { height: 120, maxWidth: 400, className: 'w-full h-full object-contain', containerClass: 'h-30 w-96 flex items-center justify-center ' },
    gold: { height: 96, maxWidth: 320, className: 'w-full h-full object-contain', containerClass: 'h-24 w-72 flex items-center justify-center ' },
    silver: { height: 72, maxWidth: 240, className: 'w-full h-full object-contain', containerClass: 'h-18 w-56 flex items-center justify-center ' },
    bronze: { height: 56, maxWidth: 180, className: 'w-full h-full object-contain', containerClass: 'h-14 w-40 flex items-center justify-center ' },
    default: { height: 64, maxWidth: 200, className: 'w-full h-full object-contain', containerClass: 'h-16 w-44 flex items-center justify-center ' },
  }

  // Group sponsors by tier
  const sponsorsByTier = sponsors.reduce((acc, sponsor) => {
    const tier = sponsor.tier || 'default'
    if (!acc[tier]) {
      acc[tier] = []
    }
    acc[tier].push(sponsor)
    return acc
  }, {} as Record<string, Sponsor[]>)

  // Define tier order and labels
  const tierOrder = ['supergold', 'gold', 'silver', 'bronze', 'default']
  const tierLabels = {
    supergold: 'Supergold',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    default: ''
  }

  const renderSponsorSection = (tier: string, tierSponsors: Sponsor[]) => {
    const { height, maxWidth, className, containerClass } = tierLogoSizes[tier]

    // Define grid columns based on tier
    const gridCols = tier === 'supergold' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                     tier === 'gold' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                     tier === 'silver' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                     'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'

    // Special styling for supergold tier
    const sectionClass = tier === 'supergold'
      ? "mb-16"
      : "mb-12"

    return (
      <div key={tier} className={sectionClass}>
        {/* <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          {tierLabels[tier as keyof typeof tierLabels]}
        </h3> */}
        <div className={`grid ${gridCols} gap-8 items-center justify-items-center max-w-6xl mx-auto`}>
          {tierSponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={`${sponsor.url}?ref=hackbarna`}
              target="_blank"
              rel="hackbarna"
              className="hover:scale-105 transition-transform duration-200"
            >
              <div className={containerClass}>
                <Image
                  className={className}
                  src={sponsor.logo}
                  width={maxWidth}
                  height={height}
                  alt={sponsor.name}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div id="sponsors" className="bg-white bg-opacity-95 py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2
          className={`mt-2 text-3xl sm:text-5xl font-cal font-semibold ${theme.colors.accentOnWhite} mb-16`}
        >
          {intl.t('sponsors.title')}
        </h2>
        
        <div className="space-y-16">
          {/* Render sponsors by tier */}
          {tierOrder.map(tier => {
            const tierSponsors = sponsorsByTier[tier]
            return tierSponsors && tierSponsors.length > 0 ? 
              renderSponsorSection(tier, tierSponsors) : null
          })}
          
          {/* Become a sponsor section */}
          <div className="flex justify-center">
            <a
              target="_blank"
              href="https://hackbarna.com/sponsorship.pdf"
              className="flex items-center justify-center p-6 hover:scale-105 transition-transform duration-200 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-400 min-h-[100px] max-w-[280px] w-full"
            >
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Your Company
                </div>
                <div className="text-base text-gray-500">Become a sponsor</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
