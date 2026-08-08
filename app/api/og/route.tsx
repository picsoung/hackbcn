import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import OpenGraphCard from '@/app/components/brand/OpenGraphCard'

export const runtime = 'edge'

const size = { width: 1200, height: 630 }
const ASSET_ORIGIN = 'https://hackbarna.com'

function safeImageUrl(raw: string | null) {
  if (!raw) return undefined
  try {
    // Vercel preview deployments can be protected, so an Edge function cannot
    // reliably fetch its own preview-origin public assets. Resolve local event
    // artwork against the stable public production origin instead.
    const url = new URL(raw, ASSET_ORIGIN)
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
      imageUrl={safeImageUrl(params.get('image'))}
      wordmarkUrl={`${ASSET_ORIGIN}/brand/wordmark-white.svg`}
      footer={params.get('footer')?.slice(0, 100) || 'hackbarna.com'}
    />,
    size
  )
}
