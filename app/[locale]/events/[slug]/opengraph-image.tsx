import { ImageResponse } from 'next/og'
import OpenGraphCard, { formatOgDate } from '@/app/components/brand/OpenGraphCard'
import { getEventDataBySlug } from '@/lib/events-server'
import { getOgImageSource } from '@/lib/og-image-source'

export const runtime = 'nodejs'
export const alt = 'HackBarna event'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image({ params }: { params: { locale: string; slug: string } }) {
  const data = getEventDataBySlug(params.slug)

  if (!data) {
    return new ImageResponse(
      <OpenGraphCard
        eyebrow="HackBarna event"
        title="Build with Barcelona"
        location="Barcelona, Spain"
      />,
      size
    )
  }

  const { event } = data
  const title = event.eventType === 'hacknight' && event.topic
    ? `${event.name} — ${event.topic}`
    : event.name

  return new ImageResponse(
    <OpenGraphCard
      eyebrow={event.eventType === 'hacknight' ? 'Hack Night' : 'Hackathon'}
      title={title}
      date={formatOgDate(event.startDate, event.endDate)}
      location={event.location}
      imageUrl={getOgImageSource(event.imageUrl)}
      footer={`hackbarna.com/events/${event.slug}`}
    />,
    size
  )
}
