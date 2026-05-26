import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgHero from '@/app/components/home/OrgHero'
import PartnersBar from '@/app/components/home/PartnersBar'
import UpcomingEvents from '@/app/components/home/UpcomingEvents'
import StatsBar from '@/app/components/home/StatsBar'
import PastEvents from '@/app/components/home/PastEvents'
import OrgFooter from '@/app/components/home/OrgFooter'
import {
  getFeaturedUpcomingEvent,
  getAllSponsorsAcrossEvents,
  getAllCommunitySponsorsAcrossEvents,
  getUnifiedUpcomingEvents,
  getUnifiedPastEvents,
  getUpcomingHackNights,
  getPastHackNights,
} from '@/lib/events-server'

export default function HomePage() {
  const featured = getFeaturedUpcomingEvent()
  const partnerLogos = [
    ...getAllSponsorsAcrossEvents(),
    ...getAllCommunitySponsorsAcrossEvents(),
  ]
  const upcomingHackathons = getUnifiedUpcomingEvents()
  const upcomingHackNights = getUpcomingHackNights().slice(0, 2)
  const pastHackathons = getUnifiedPastEvents()
  const pastHackNights = getPastHackNights()

  return (
    <div>
      <OrgNavbar featuredEvent={featured} />
      <main>
        <OrgHero />
        <PartnersBar logos={partnerLogos} />
        <UpcomingEvents
          upcomingHackathons={upcomingHackathons}
          upcomingHackNights={upcomingHackNights}
        />
        <StatsBar />
        <PastEvents
          pastHackathons={pastHackathons}
          pastHackNights={pastHackNights}
        />
      </main>
      <OrgFooter />
    </div>
  )
}
