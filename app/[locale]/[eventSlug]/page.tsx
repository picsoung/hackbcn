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
import { getMentorsByEvent } from '@/data/mentors'
import { getSponsorsByEvent } from '@/data/sponsors'
import { getCommunitySponsorsByEvent } from '@/data/communitySponsors'
import { getEventDataBySlug } from '@/lib/events-server'
import { getEventBySlug } from '@/lib/events'
import { getEventProjectCards } from '@/lib/project-catalog'
import EventProjectsSection from '@/app/components/projects/EventProjectsSection'
import RecapVideo from '@/app/components/events/RecapVideo'
import { permanentRedirect, notFound } from 'next/navigation'

// Past events keep this legacy URL as their canonical address (indexed, externally linked).
// Anything else here (new MDX events, hack nights) gets a 308 to /events/<slug>.
const PAST_LEGACY_SLUGS = new Set(['v1-2024', 'aisummit25'])

// Allow dynamic rendering for unknown slugs so the redirect logic can fire.
export const dynamicParams = true

export async function generateStaticParams() {
  return Array.from(PAST_LEGACY_SLUGS).map((slug) => ({ eventSlug: slug }))
}

export default async function EventPage({
  params,
}: {
  params: { locale: string; eventSlug: string }
}) {
  const { locale, eventSlug } = params

  if (!PAST_LEGACY_SLUGS.has(eventSlug)) {
    // If the slug exists in any newer source, send the visitor to its canonical URL.
    const data = getEventDataBySlug(eventSlug)
    if (data) {
      permanentRedirect(`/${locale}/events/${eventSlug}`)
    }
    notFound()
  }

  const { judges } = getJudgesByEvent(eventSlug)
  const { mentors } = getMentorsByEvent(eventSlug)
  const { sponsors } = getSponsorsByEvent(eventSlug)
  const { communitySponsors } = getCommunitySponsorsByEvent(eventSlug)
  const projects = await getEventProjectCards(locale, eventSlug)
  const legacyEvent = getEventBySlug(eventSlug)

  return (
    <div>
      <ClientNavbar />
      <main className="flex min-h-screen flex-col">
        <Hero />
        {legacyEvent &&
          (legacyEvent.recapVideoUrl || legacyEvent.shorts?.length) && (
            <div className="bg-white">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <RecapVideo
                  recapVideoUrl={legacyEvent.recapVideoUrl}
                  shorts={legacyEvent.shorts}
                  eventName={legacyEvent.name}
                />
              </div>
            </div>
          )}
        <Sponsors sponsors={sponsors} />
        <CommunitySponsors communitySponsors={communitySponsors} />
        <Judges judges={judges} />
        <Mentors mentors={mentors} />
        <WhyJoin />
        <Dates />
        <Schedule />
        <SignupCTA />
        <FAQ />
        {projects.length > 0 && (
          <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <EventProjectsSection
                locale={locale}
                eventSlug={eventSlug}
                eventName={legacyEvent?.name ?? eventSlug}
                projects={projects}
                tone="light"
              />
            </div>
          </div>
        )}
        <Team />
        <Footer />
      </main>
    </div>
  )
}
