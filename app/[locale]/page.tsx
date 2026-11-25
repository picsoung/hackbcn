import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgHero from '@/app/components/home/OrgHero'
import PartnersBar from '@/app/components/home/PartnersBar'
import UpcomingEvents from '@/app/components/home/UpcomingEvents'
import StatsBar from '@/app/components/home/StatsBar'
import PastEvents from '@/app/components/home/PastEvents'
import HomeJoin from '@/app/components/home/HomeJoin'
import OrgFooter from '@/app/components/home/OrgFooter'
import { getHomepageEvents, toHomeEvent } from '@/lib/homepage'
import { localizedAlternates } from '@/lib/page-seo'
import {
  getFeaturedUpcomingEvent,
  getAllSponsorsAcrossEvents,
  getAllCommunitySponsorsAcrossEvents,
  getAllUpcoming,
} from '@/lib/events-server'

export function generateMetadata({ params }: { params: { locale: string } }) {
  return { alternates: localizedAlternates(params.locale) }
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const featured = getFeaturedUpcomingEvent()
  const partnerLogos = [
    ...getAllSponsorsAcrossEvents(),
    ...getAllCommunitySponsorsAcrossEvents(),
  ]
  const upcoming = getAllUpcoming()
    .slice(0, 3)
    .map((event) => toHomeEvent(event, params.locale))
  const wall = getHomepageEvents(params.locale)

  return (
    <div data-register="night" className="min-h-screen bg-ground">
      <OrgNavbar featuredEvent={featured} />
      <main>
        <OrgHero
          upcoming={featured ? toHomeEvent(featured, params.locale) : null}
          recap={wall.recap}
        />
        <StatsBar eventCount={wall.total} />
        <PartnersBar logos={partnerLogos} />
        {upcoming.length > 0 && <UpcomingEvents events={upcoming} />}
        <PastEvents events={wall.events} />
        <HomeJoin />
      </main>
      <OrgFooter />
    </div>
  )
}
