import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgHero from '@/app/components/home/OrgHero'
import PartnersBar from '@/app/components/home/PartnersBar'
import UpcomingEvents from '@/app/components/home/UpcomingEvents'
import StatsBar from '@/app/components/home/StatsBar'
import PastEvents from '@/app/components/home/PastEvents'
import HomeJoin from '@/app/components/home/HomeJoin'
import OrgFooter from '@/app/components/home/OrgFooter'
import { formatHomeDate, getHomepageEvents } from '@/lib/homepage'
import {
  getFeaturedUpcomingEvent,
  getAllSponsorsAcrossEvents,
  getAllCommunitySponsorsAcrossEvents,
  getAllUpcoming,
} from '@/lib/events-server'

export default function HomePage({ params }: { params: { locale: string } }) {
  const featured = getFeaturedUpcomingEvent()
  const partnerLogos = [
    ...getAllSponsorsAcrossEvents(),
    ...getAllCommunitySponsorsAcrossEvents(),
  ]
  const upcoming = getAllUpcoming()
    .filter((event) => event.slug !== featured?.slug)
    .slice(0, 3)
  const wall = getHomepageEvents(params.locale)
  const upcomingDateLabel = featured
    ? formatHomeDate(featured.startDate, featured.endDate, params.locale)
    : undefined

  return (
    <div data-register="night" className="min-h-screen bg-ground">
      <OrgNavbar featuredEvent={featured} />
      <main>
        <OrgHero
          upcoming={featured}
          upcomingDateLabel={upcomingDateLabel}
          highlights={wall.featured}
        />
        <StatsBar eventCount={wall.total} />
        <PartnersBar logos={partnerLogos} />
        {upcoming.length > 0 && <UpcomingEvents events={upcoming} />}
        <PastEvents featured={wall.featured} compact={wall.compact} />
        <HomeJoin />
      </main>
      <OrgFooter />
    </div>
  )
}
