'use client'

import GradientHero from './GradientHero'
import Link from 'next/link'
import ApplyButton from './ApplyButton'
import Image from 'next/image' // Add this import
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'

export default function Hero() {
  const intl = useIntl()
  const { theme, currentEventSlug } = useTheme()
  
  // Use current event slug, fallback to default event
  const eventSlug = currentEventSlug || 'aisummit25'
  
  // AI Summit specific layout
  if (eventSlug === 'aisummit25') {
    return (
      <div className={`${theme.colors.hero} min-h-screen`}>
        <main>
          <div className="relative isolate">
            <div
              className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
              aria-hidden="true"
            >
              <div
                className={`aspect-[801/1036] w-[50.0625rem] ${theme.colors.gradient} opacity-30`}
              />
            </div>
            <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="text-left mb-16">
                <h1 className={`text-4xl md:text-6xl font-cal ${theme.colors.text} mb-8`}>
                  {intl.t('hero.title.left-part')}
                  <span className={theme.colors.accent}>
                    {intl.t('hero.title.right-part')}
                  </span>
                  {' - '}
                  <span className={theme.colors.accent}>
                    {intl.t(`hero.${eventSlug}.title-edition`)}
                  </span>
                </h1>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Description Column - Left */}
                <div className="space-y-8">
                  <p className={`text-xl leading-8 ${theme.colors.textSecondary}`}>
                    {intl.t(`hero.${eventSlug}.description.0`)}
                  </p>
                  <p className={`text-xl leading-8 ${theme.colors.textSecondary}`}>
                    {intl.t(`hero.${eventSlug}.description.1`)}
                  </p>
                  
                  {/* Apply Button */}
                  <div className="pt-6">
                    <Link
                      href="https://aisummitbarcelona.com/hackathon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-8 py-4 text-xl font-semibold rounded-lg transition-all duration-200 ${theme.colors.button} ${theme.colors.buttonHover}`}
                    >
                      {intl.t('action.apply')}
                      <svg 
                        className="ml-2 h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" 
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Image Column - Right */}
                <div className="relative">
                  <div className="relative mx-auto max-w-lg">
                    <img
                      src="/aihack.png"
                      alt="AI Summit Barcelona"
                      className="w-full h-auto rounded-2xl shadow-2xl"
                      onError={(e) => {
                        // Fallback to a gradient placeholder if image doesn't exist
                        e.currentTarget.style.display = 'none'
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                        if (nextElement) nextElement.style.display = 'block'
                      }}
                    />
                    {/* Fallback gradient placeholder */}
                    <div 
                      className={`w-full h-96 rounded-2xl shadow-2xl ${theme.colors.gradient} flex items-center justify-center`}
                      style={{ display: 'none' }}
                    >
                      <span className={`text-2xl font-semibold ${theme.colors.text}`}>
                        AI Summit 25
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Original layout for other events
  return (
    <div className={`${theme.colors.hero}`}>
      <main>
        {/* <GradientHero /> */}
        <div className="relative isolate">
          <div
            className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
            aria-hidden="true"
          >
            <div
              className={`aspect-[801/1036] w-[50.0625rem] ${theme.colors.gradient} opacity-30`}
              // style={{
              //   clipPath:
              //     "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
              // }}
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="">
                <h1 className={`text-4xl font-cal ${theme.colors.text} sm:text-6xl`}>
                  {intl.t('hero.title.left-part')}
                  <span className={theme.colors.accent}>
                    {intl.t('hero.title.right-part')}
                  </span>{' '}
                  - {intl.t(`hero.${eventSlug}.title-edition`)}
                </h1>
                <p className={`relative mt-6 text-lg leading-8 ${theme.colors.textSecondary} sm:max-w-md lg:max-w-none`}>
                  {intl.t(`hero.${eventSlug}.description.0`)}
                  <br />
                  <br />
                  {intl.t(`hero.${eventSlug}.description.1`)}
                  <br />
                </p>
                <iframe
                  src="https://lu.ma/embed/event/evt-S7vtCcLEvcd4O8F/simple"
                  width="100%"
                  height="450"
                  style={{ border: '1px solid #bfcbda88', borderRadius: '4px' }}
                  aria-hidden="false"
                ></iframe>
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:gap-x-6">
                  <ApplyButton />
                  <Link
                    href="https://hackbarna.com/sponsorship.pdf"
                    target="_blank"
                    className={`text-lg font-semibold leading-6 ${theme.colors.textSecondary} hover:text-white z-30 mt-4 sm:mt-0`}
                  >
                    {intl.t('hero.cta.sponsor-us')}
                  </Link>
                </div>
              </div>
              {/*<div className="mt-14 flex flex-col justify-end gap-8 sm:-mt-44 sm:flex-row sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <Image
                  src="/aihack.png"
                  alt={'AI Hack illustration'}
                  className="w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
                <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36">
                  <Card name="Warp" imageSrc="/cards/warp.png" />
                  <Card name="NYU" imageSrc="/cards/nyu.png" />
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <Card name="Modal" imageSrc="./cards/modal.png" />
                  <Card name="Cornell" imageSrc="/cards/cornelltech.png" />
                </div>
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <Card name="Columbia" imageSrc="/cards/columbia.png" />
                  <Card name="Jacobs" imageSrc="/cards/yourcompany.png" />
                </div>
              </div>
                */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}