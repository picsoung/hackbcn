import { NextResponse } from 'next/server'
import { getLiveEvent } from '@/lib/live/config'
import { addShare } from '@/lib/live/projects'

export const dynamic = 'force-dynamic'

/** Hype counter for share-button clicks. Not deduplicated; only a ranking tiebreaker. */
export async function POST(
  _req: Request,
  { params }: { params: { event: string; project: string } },
) {
  const event = getLiveEvent(params.event)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!event.open)
    return NextResponse.json(
      { error: 'Event results are closed.' },
      { status: 403 },
    )
  const result = await addShare(params.event, params.project)
  if (!result)
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  return NextResponse.json(result)
}
