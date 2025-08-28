import React from 'react'
import ClientNavbar from '@/app/components/ClientNavbar'
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
import { getMentorsByEvent } from '@/data/mentors'
import { getSponsorsByEvent } from '@/data/sponsors'
import { getCommunitySponsorsByEvent } from '@/data/communitySponsors'

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
  const { eventSlug } = params

  const { judges } = getJudgesByEvent(eventSlug)
  const { mentors } = getMentorsByEvent(eventSlug)
  const { sponsors } = getSponsorsByEvent(eventSlug)
  const { communitySponsors } = getCommunitySponsorsByEvent(eventSlug)

  return (
    <div>
      <ClientNavbar />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <Sponsors sponsors={sponsors} />
        <CommunitySponsors communitySponsors={communitySponsors}/>
        <Judges judges={judges} />
        <Mentors mentors={mentors} />
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
