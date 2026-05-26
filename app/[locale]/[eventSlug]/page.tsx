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
import { getProjectsByEvent } from '@/app/helpers/projects'
import { permanentRedirect, notFound } from 'next/navigation'
import Link from 'next/link'

// Past events keep this legacy URL as their canonical address (indexed, externally linked).
// Anything else here (new MDX events, hack nights) gets a 308 to /events/<slug>.
const PAST_LEGACY_SLUGS = new Set(['v1-2024', 'aisummit25'])

// Allow dynamic rendering for unknown slugs so the redirect logic can fire.
export const dynamicParams = true

export async function generateStaticParams() {
  return Array.from(PAST_LEGACY_SLUGS).map((slug) => ({ eventSlug: slug }))
}

export default function EventPage({
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
  const projectCount = getProjectsByEvent(eventSlug).length

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
        {projectCount > 0 && (
          <section className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-cal font-semibold text-slate-900 mb-3">
                Projects shipped this edition
              </h2>
              <p className="text-slate-600 mb-6">
                {projectCount} {projectCount === 1 ? 'project' : 'projects'} from team formation to final demo.
              </p>
              <Link
                href={`/${locale}/events/${eventSlug}/projects`}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors"
              >
                View all {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        )}
        <Team />
        <Footer />
      </main>
    </div>
  )
}
