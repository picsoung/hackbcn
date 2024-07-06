'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero'
import Sponsors from '../../components/Sponsors'
import Judges from '../../components/Judges'
import WhyJoin from '../../components/WhyJoin'
import FAQ from '../../components/FAQ'
import Schedule from '../../components/Schedule'
import Dates from '../../components/Dates'
import SignupCTA from '../../components/SignupCTA'
import Team from '../../components/Team'
import Footer from '../../components/Footer'
import { useIntl } from '../../components/Intl'
import CommunitySponsors from '../../components/CommunitySponsors'
import GradientHero from '@/app/components/GradientHero'
import dynamic from 'next/dynamic'

export default function Page(props: { params: { locale: string } }) {
  const intl = useIntl()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigationOptions = [
    { name: intl.t('navbar.sponsors'), href: '#sponsors' },
    { name: intl.t('navbar.why-should-i-join'), href: '#why' },
    { name: intl.t('navbar.schedule'), href: '#schedule' },
    { name: intl.t('navbar.faq'), href: '#faq' },
    { name: intl.t('navbar.team'), href: '#about' },
    { name: intl.t('navbar.judges'), href: '#judges' },
  ]

  const ConductContent = dynamic(
    () => import('@/legal/code-of-conduct/' + props.params.locale + '.mdx'),
  )

  return (
    <div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigationOptions={navigationOptions}
      />
      <main className="flex min-h-screen flex-col">
        <GradientHero />
        <div id="conduct" className="bg-white py-10 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
              {intl.t('conduct.title')}
            </h2>
            <article className="prose">
              <ConductContent />
            </article>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
