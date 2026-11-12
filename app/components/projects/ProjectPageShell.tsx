import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import { getFeaturedUpcomingEvent } from '@/lib/events-server'

/** The same site navigation, event ribbon and footer as the homepage. */
export default function ProjectPageShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-register="night" className="min-h-screen bg-ground text-ink">
      <OrgNavbar featuredEvent={getFeaturedUpcomingEvent()} />
      <main>{children}</main>
      <OrgFooter />
    </div>
  )
}
