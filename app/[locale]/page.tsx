import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgHero from '@/app/components/home/OrgHero'
import PartnersBar from '@/app/components/home/PartnersBar'
import UpcomingEvents from '@/app/components/home/UpcomingEvents'
import PastEvents from '@/app/components/home/PastEvents'
import HomeAftermovie from '@/app/components/home/HomeAftermovie'
import HomeJoin from '@/app/components/home/HomeJoin'
import OrgFooter from '@/app/components/home/OrgFooter'
import { formatHomeEventDate, getHomePastEvents } from '@/lib/home-events'
import {
  getFeaturedUpcomingEvent,
  getAllSponsorsAcrossEvents,
  getAllCommunitySponsorsAcrossEvents,
  getAllUpcoming,
  getEventDataBySlug,
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
  const pastEvents = getHomePastEvents(6, params.locale)
  const upcomingDateLabel = featured
    ? formatHomeEventDate(featured.startDate, featured.endDate, params.locale)
    : undefined
  const summit = getEventDataBySlug('aisummit26')?.event
  const aftermovie = summit
    ? {
        slug: summit.slug,
        name: summit.name,
        recapVideoUrl: summit.recapVideoUrl,
      }
    : undefined

  return (
    <div data-register="night" className="min-h-screen bg-ground">
      <OrgNavbar featuredEvent={featured} />
      <main>
        <OrgHero upcoming={featured} upcomingDateLabel={upcomingDateLabel} />
        <UpcomingEvents events={upcoming} />
        <PastEvents events={pastEvents} />
        <HomeAftermovie event={aftermovie} />
        <PartnersBar logos={partnerLogos} />
        <HomeJoin />
      </main>
      <OrgFooter />
    </div>
  )
}
