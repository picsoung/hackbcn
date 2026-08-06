import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventsIndex from '@/app/components/events/EventsIndex'
import UpcomingFeature from '@/app/components/events/UpcomingFeature'
import ArchiveWall, { type ArchiveItem } from '@/app/components/events/ArchiveWall'
import EventsBottomCTA from '@/app/components/events/EventsBottomCTA'
import {
  getFeaturedUpcomingEvent,
  getAllUpcoming,
  getUnifiedPastEvents,
  getPastHackNights,
} from '@/lib/events-server'

export default function EventsPage() {
  const featured = getFeaturedUpcomingEvent()
  const upcoming = getAllUpcoming()

  const archiveItems: ArchiveItem[] = [
    ...getUnifiedPastEvents().map((e) => ({
      slug: e.slug,
      name: e.name,
      date: e.startDate,
      tapeColor: 'accent' as const,
      imageUrl: e.imageUrl,
    })),
    ...getPastHackNights().map((hn) => ({
      slug: hn.slug,
      name: hn.name,
      date: hn.date,
      tapeColor: 'alt' as const,
      imageUrl: hn.imageUrl,
    })),
  ]

  return (
    <div data-register="night" className="min-h-screen bg-ground">
      <OrgNavbar featuredEvent={featured} />
      <main>
        <EventsIndex />
        <UpcomingFeature events={upcoming} />
        <ArchiveWall items={archiveItems} />
        <EventsBottomCTA />
      </main>
      <OrgFooter />
    </div>
  )
}
