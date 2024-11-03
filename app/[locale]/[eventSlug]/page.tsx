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

import { getJudgesByEvent } from '@/data/judges' // Import your data fetching function
import { getAllEventSlugs } from '@/lib/events'

export async function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({
    event: slug,
  }))
}

export default function EventPage({
  params,
}: {
  params: { locale: string; eventSlug: string }
}) {
  // const event = useEvent()
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { eventSlug } = params

  const { judges, metadata } = getJudgesByEvent(eventSlug)

  console.log('slug', eventSlug)

  return (
    <div>
      <Navbar
        mobileMenuOpen={false}
        setMobileMenuOpen={false}
      />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Sponsors />
        <CommunitySponsors />
        <Judges judges={judges}/>
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
