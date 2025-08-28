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
        <h2 className={`mt-2 text-3xl sm:text-5xl font-cal font-semibold ${theme.colors.accentOnWhite}`}>
          {intl.t('sponsors.title')}
        </h2>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto mt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center max-w-6xl">
          {sponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={`${sponsor.url}?ref=hackbarna`}
                target="_blank"
                rel="hackbarna"
                className="flex items-center justify-center p-4 hover:scale-105 transition-transform duration-200"
              >
                <Image
                  className="h-16 w-auto object-contain max-w-[200px]"
                  src={sponsor.logo}
                  width={200}
                  height={64}
                  alt={sponsor.name}
                />
              </a>
            ))}
            <a 
              target="_blank" 
              href="https://hackbarna.com/sponsorship.pdf"
              className="flex items-center justify-center p-4 hover:scale-105 transition-transform duration-200 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-400 min-h-[80px] max-w-[200px] w-full"
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  Your Company
                </div>
                <div className="text-sm text-gray-500">
                  Become a sponsor
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
