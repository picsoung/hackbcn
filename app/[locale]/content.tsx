'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Sponsors from '../components/Sponsors'
import Judges from '../components/Judges'
import WhyJoin from '../components/WhyJoin'
import FAQ from '../components/FAQ'
import Schedule from '../components/Schedule'
import Dates from '../components/Dates'
import SignupCTA from '../components/SignupCTA'
import Team from '../components/Team'
import Footer from '../components/Footer'
import { useIntl } from '../components/Intl'
import CommunitySponsors from '../components/CommunitySponsors'
import Mentors from '../components/Mentors'

export default function HomeContent() {
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
