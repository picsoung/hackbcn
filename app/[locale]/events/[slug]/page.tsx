import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventDetail from '@/app/components/events/EventDetail'
import {
  getEventDataBySlug,
  getAllUnifiedEventSlugs,
  getFeaturedUpcomingEvent,
} from '@/lib/events-server'
import { getProjectsByEvent } from '@/app/helpers/projects'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllUnifiedEventSlugs().map((slug) => ({ slug }))
}

export default function EventDetailPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const data = getEventDataBySlug(params.slug)
  if (!data) {
    notFound()
  }
  const featured = getFeaturedUpcomingEvent()
  const projectCount = getProjectsByEvent(params.slug).length

  return (
    <div
      data-register={data.event.register ?? 'night'}
      className="min-h-screen bg-ground"
    >
      <OrgNavbar featuredEvent={featured} />
      <main>
        <EventDetail
          event={data.event}
          sponsors={data.sponsors}
          communitySponsors={data.communitySponsors}
          judges={data.judges}
          mentors={data.mentors}
          locale={params.locale}
          projectCount={projectCount}
        />
      </main>
      <OrgFooter />
    </div>
  )
}
