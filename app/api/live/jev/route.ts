import { NextResponse } from 'next/server'
import { CATEGORIES, playground } from '@/lib/live/jev'

export const dynamic = 'force-dynamic'

// Small in-memory limiter for the public Jev lab. A cache, not storage: it resets on cold start.
const hits = new Map<string, number[]>()
function limited(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > max
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  if (limited(ip))
    return NextResponse.json(
      { error: 'Easy there. Try again in a minute.' },
      { status: 429 },
    )

  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown
    tagline?: unknown
  }
  const name =
    typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
  const tagline =
    typeof body.tagline === 'string' ? body.tagline.trim().slice(0, 280) : ''
  if (!name || tagline.length < 5)
    return NextResponse.json(
      { error: 'Give Jev a name and a pitch to read.' },
      { status: 400 },
    )

  try {
    const result = await playground({ name, tagline })
    return NextResponse.json({
      ...result,
      categoryLabels: Object.fromEntries(
        Object.entries(CATEGORIES).map(([k, v]) => [k, v.label]),
      ),
    })
  } catch (err) {
    console.error('Jev lab failed', err)
    return NextResponse.json(
      { error: "Jev didn't answer this time. Try again." },
      { status: 502 },
    )
  }
}
