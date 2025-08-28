'use client'

import Image from 'next/image'
import React from 'react' // Import React if you haven't already
import { useIntl } from './Intl'
import { Sponsor } from '@/data/sponsors'
import { useTheme } from '@/app/contexts/ThemeContext'

export default function Sponsors({sponsors}: {sponsors: Sponsor[]}) {
  const intl = useIntl()
  const { theme } = useTheme()
  
  return (
    <div id="sponsors" className="bg-white bg-opacity-95 py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className={`mt-2 text-3xl sm:text-5xl font-cal font-semibold text-ai-orange`}>
          {intl.t('sponsors.title')}
        </h2>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto gap-4 mt-12">
          <div className="relative flex flex-wrap gap-4 items-center">
          {sponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={`${sponsor.url}?ref=hackbarna`}
                target="_blank"
                rel="hackbarna"
              >
                <Image
                  className="h-auto max-h-32 object-contain"
                  src={sponsor.logo}
                  width={sponsor.width || 300}
                  height={sponsor.height || 32}
                  alt={sponsor.name}
                />
              </a>
            ))}
            <a target="_blank" href="https://hackbarna.com/sponsorship.pdf">
              <Image
                className="h-auto max-h-40 object-contain bg-black hover:cursor-pointer"
                src="/cards/yourcompany.png"
                width={100}
                height={32}
                alt="Your Company"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
