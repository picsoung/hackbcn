import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventList from '@/app/components/events/EventList'

export default function EventsPage() {
  return (
    <div>
      <OrgNavbar />
      <main>
        <EventList />
      </main>
      <OrgFooter />
    </div>
  )
}
