'use client'

import { useEvent } from '@/app/contexts/EventContext'

import React, { useState } from 'react'
import Navbar from '@/app/components/Navbar'
import Hero from '@/app/components/Hero'
import Sponsors from '@/app/components/Sponsors'
import Judges from '@/app/components/Judges'
import WhyJoin from '@/app/components/WhyJoin'
import FAQ from '@/app/components/FAQ'
import Schedule from '@/app/components/Schedule'
import Dates from '@/app/components/Dates'
import SignupCTA from '@/app/components/SignupCTA'
import Team from '@/app/components/Team'
import Footer from '@/app/components/Footer'
import { useIntl } from '@/app/components/Intl'
import CommunitySponsors from '@/app/components/CommunitySponsors'
import Mentors from '@/app/components/Mentors'

export default function EventPage() {
  const event = useEvent()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Sponsors />
        <CommunitySponsors />
        <Judges />
        <Mentors />
        <WhyJoin />
        <Dates />
        <Schedule />
        <SignupCTA />
        <FAQ />
        <Team />
        <Footer />
      </main>
    </div>
  )
}
