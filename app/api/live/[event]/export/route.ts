import { NextResponse } from 'next/server'
import { getLiveEvent } from '@/lib/live/config'
import { exportShareable } from '@/lib/live/projects'

export const dynamic = 'force-dynamic'

/** Projects whose builders opted in to being featured on hackbarna.com. Never includes emails. */
export async function GET(
  _req: Request,
  { params }: { params: { event: string } },
) {
  if (!getLiveEvent(params.event))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await exportShareable(params.event), {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
