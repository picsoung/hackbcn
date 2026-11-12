import { NextResponse } from 'next/server'
import { getLiveEvent } from '@/lib/live/config'
import { setVote } from '@/lib/live/projects'
import { ensureVoterId } from '@/lib/live/voter'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { event: string; project: string } },
) {
  const event = getLiveEvent(params.event)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!event.open)
    return NextResponse.json({ error: 'Voting is closed.' }, { status: 403 })

  const body = (await req.json().catch(() => ({}))) as { voted?: boolean }
  const result = await setVote(
    event.slug,
    params.project,
    ensureVoterId(),
    body.voted !== false,
  )
  if (!result)
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  return NextResponse.json(result)
}
