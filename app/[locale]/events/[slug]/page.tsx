import type { Metadata } from 'next'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import EventDetail from '@/app/components/events/EventDetail'
import {
  getEventDataBySlug,
  getAllUnifiedEventSlugs,
  getFeaturedUpcomingEvent,
} from '@/lib/events-server'
import { buildOgImagePath, formatOgDate } from '@/lib/og'
import { getProjectsByEvent } from '@/app/helpers/projects'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllUnifiedEventSlugs().map((slug) => ({ slug }))
}

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
  const canonical = `/${params.locale}/events/${event.slug}`

  return {
    title: `${eventTitle} — HackBarna`,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: `https://hackbarna.com${canonical}`,
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
