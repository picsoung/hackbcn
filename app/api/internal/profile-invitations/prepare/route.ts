import { timingSafeEqual } from 'node:crypto'
import { prepareProfileInvitations } from '@/lib/admin/invitation-preparation'

export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' }
  const expected = process.env.HACKBARNA_INVITATION_PREPARE_TOKEN ?? ''
  const supplied =
    request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const expires = Date.parse(
    process.env.HACKBARNA_INVITATION_PREPARE_UNTIL ?? '',
  )
  if (
    !/^[a-f0-9]{64}$/i.test(expected) ||
    !/^[a-f0-9]{64}$/i.test(supplied) ||
    !Number.isFinite(expires) ||
    Date.now() >= expires ||
    expires - Date.now() > 24 * 60 * 60 * 1000 ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  )
    return Response.json({ error: 'unauthorized' }, { status: 401, headers })
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 250000)
      return Response.json({ error: 'limit' }, { status: 413, headers })
    const result = await prepareProfileInvitations(JSON.parse(text))
    return Response.json(result, { headers })
  } catch {
    return Response.json(
      { error: 'preparation_failed' },
      { status: 422, headers },
    )
  }
}
