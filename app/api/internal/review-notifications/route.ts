import { timingSafeEqual } from 'node:crypto'
import { dispatchReviewNotifications } from '@/lib/projects/review-dispatch'

export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  const expected = process.env.HACKBARNA_REVIEW_DISPATCH_TOKEN ?? ''
  const supplied =
    request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const headers = { 'Cache-Control': 'private, no-store' }
  if (
    !/^[0-9a-f]{64}$/i.test(expected) ||
    !/^[0-9a-f]{64}$/i.test(supplied) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  )
    return Response.json({ error: 'unauthorized' }, { status: 401, headers })
  try {
    return Response.json(await dispatchReviewNotifications(), { headers })
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503, headers })
  }
}
