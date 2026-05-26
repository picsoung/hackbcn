import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventsIndex from '@/app/components/events/EventsIndex'
import UpcomingFeature from '@/app/components/events/UpcomingFeature'
import ArchiveWall from '@/app/components/events/ArchiveWall'
import EventsBottomCTA from '@/app/components/events/EventsBottomCTA'

export default function EventsPage() {
  return (
    <div className="bg-white">
      <OrgNavbar />
      <main>
        <EventsIndex />
        <UpcomingFeature />
        <ArchiveWall />
        <EventsBottomCTA />
      </main>
      <OrgFooter />
    </div>
  )
}
