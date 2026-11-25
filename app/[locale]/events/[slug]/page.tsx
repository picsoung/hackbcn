import type { Metadata } from 'next'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventDetail from '@/app/components/events/EventDetail'
import {
  getEventDataBySlug,
  getFeaturedUpcomingEvent,
} from '@/lib/events-server'
import { buildOgImagePath, formatOgDate } from '@/lib/og'
import { getEventProjects } from '@/lib/project-catalog'
import { getLiveEvent } from '@/lib/live/config'
import EventProjectsSection from '@/app/components/projects/EventProjectsSection'
import { notFound, permanentRedirect } from 'next/navigation'
import { localizedAlternates } from '@/lib/page-seo'

export const dynamic = 'force-dynamic'
const legacyCanonicalSlugs = new Set(['v1-2024', 'aisummit25'])

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string }
}): Metadata {
  const data = getEventDataBySlug(params.slug)
  if (!data) return {}

  const { event } = data
  const eventTitle =
    event.eventType === 'hacknight' && event.topic
      ? `${event.name} — ${event.topic}`
      : event.name
  const description =
    event.description?.[params.locale] ??
    event.description?.en ??
    `${eventTitle} by HackBarna in Barcelona.`
  const ogImage = buildOgImagePath({
    title: eventTitle,
    eyebrow: event.eventType === 'hacknight' ? 'Hack Night' : 'Hackathon',
    date: formatOgDate(event.startDate, event.endDate),
    location: event.location,
    image: event.imageUrl,
    footer: `hackbarna.com/events/${event.slug}`,
  })
  const alternates = localizedAlternates(
    params.locale,
    legacyCanonicalSlugs.has(event.slug)
      ? `/${event.slug}`
      : `/events/${event.slug}`,
  )
  const canonical = alternates.canonical

  return {
    title: `${eventTitle} — HackBarna`,
    description,
    alternates,
    openGraph: {
      type: 'website',
      url: canonical,
      title: eventTitle,
      description,
      siteName: 'HackBarna',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${eventTitle} — ${formatOgDate(event.startDate, event.endDate)} — ${event.location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: eventTitle,
      description,
      images: [ogImage],
    },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  if (legacyCanonicalSlugs.has(params.slug)) {
    permanentRedirect(`/${params.locale}/${params.slug}`)
  }
  const data = getEventDataBySlug(params.slug)
  if (!data) {
    notFound()
  }
  const featured = getFeaturedUpcomingEvent()
  const { projects, total } = await getEventProjects(params.locale, params.slug)

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
          projectCount={total}
          projectsSection={
            total > 0 || getLiveEvent(params.slug) ? (
              <EventProjectsSection
                locale={params.locale}
                eventSlug={params.slug}
                eventName={data.event.name}
                projects={projects}
                total={total}
              />
            ) : undefined
          }
        />
      </main>
      <OrgFooter />
    </div>
  )
}
