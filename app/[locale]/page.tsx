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
  getAllUpcoming,
  getUnifiedPastEvents,
  getPastHackNights,
  getRecentShorts,
} from '@/lib/events-server'

export default function HomePage() {
  const featured = getFeaturedUpcomingEvent()
  const partnerLogos = [
    ...getAllSponsorsAcrossEvents(),
    ...getAllCommunitySponsorsAcrossEvents(),
  ]
  const upcoming = getAllUpcoming().slice(0, 3)
  const pastHackathons = getUnifiedPastEvents()
  const pastHackNights = getPastHackNights()
  const heroShorts = getRecentShorts(8)

  return (
    <div>
      <OrgNavbar featuredEvent={featured} />
      <main>
        <OrgHero shorts={heroShorts} />
        <PartnersBar logos={partnerLogos} />
        <UpcomingEvents events={upcoming} />
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
