import { ImageResponse } from 'next/og'
import OpenGraphCard from '@/app/components/brand/OpenGraphCard'
import { getFeaturedUpcomingEvent } from '@/lib/events-server'
import { getOgImageSource } from '@/lib/og-image-source'

export const runtime = 'nodejs'
export const alt = 'HackBarna — Barcelona AI & tech community'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const upcoming = getFeaturedUpcomingEvent()

  return new ImageResponse(
    <OpenGraphCard
      eyebrow="Barcelona's builder community"
      title="Hack. Build. Ship. Together."
      date={upcoming ? `Next up · ${upcoming.name}` : undefined}
      location={upcoming ? upcoming.location : 'Barcelona, Spain'}
      imageUrl={getOgImageSource(upcoming?.imageUrl)}
    />,
    size
  )
}
