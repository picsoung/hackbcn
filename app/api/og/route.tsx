import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import OpenGraphCard from '@/app/components/brand/OpenGraphCard'

export const runtime = 'edge'

const size = { width: 1200, height: 630 }

function safeImageUrl(raw: string | null, origin: string) {
  if (!raw) return undefined
  try {
    const url = new URL(raw, origin)
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const title = params.get('title') || 'HackBarna'

  return new ImageResponse(
    <OpenGraphCard
      title={title.slice(0, 100)}
      eyebrow={params.get('eyebrow')?.slice(0, 60) || undefined}
      date={params.get('date')?.slice(0, 80) || undefined}
      location={params.get('location')?.slice(0, 100) || undefined}
      imageUrl={safeImageUrl(params.get('image'), request.nextUrl.origin)}
      footer={params.get('footer')?.slice(0, 100) || 'hackbarna.com'}
    />,
    size
  )
}
