import { getAuthLocale } from '@/lib/auth/shared'
import { stopProfileInvitations } from '@/lib/email/invitation-opt-out-store'
import { validInvitationTokenShape } from '@/lib/email/invitation-opt-out'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const headers = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
}

/** Mail-client link discovery and scanners may GET this URL without changing anything. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  return new Response(null, {
    status: 303,
    headers: {
      ...headers,
      Location: `/en/invitations/unsubscribe${validInvitationTokenShape(token) ? `?token=${encodeURIComponent(token)}` : ''}`,
    },
  })
}

/** Possession of the signed link only grants an invitation opt-out, never account access. */
export async function POST(request: Request) {
  if (
    request.headers.get('content-type')?.split(';')[0].trim() !==
    'application/x-www-form-urlencoded'
  )
    return new Response(null, { status: 415, headers })
  const reader = request.body?.getReader()
  if (!reader) return new Response(null, { status: 400, headers })
  let text = '',
    bytes = 0
  const decoder = new TextDecoder()
  try {
    for (;;) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > 1024) {
        await reader.cancel()
        return new Response(null, { status: 413, headers })
      }
      text += decoder.decode(part.value, { stream: true })
    }
    text += decoder.decode()
  } catch {
    return new Response(null, { status: 400, headers })
  } finally {
    reader.releaseLock()
  }
  const body = new URLSearchParams(text),
    oneClick = body.get('List-Unsubscribe') === 'One-Click',
    token = oneClick
      ? new URL(request.url).searchParams.get('token')
      : body.get('token'),
    locale = getAuthLocale(body.get('locale') ?? 'en')
  const path = `/${locale}/invitations/unsubscribe`
  if (!validInvitationTokenShape(token))
    return new Response(null, {
      status: oneClick ? 400 : 303,
      headers: { ...headers, ...(oneClick ? {} : { Location: path }) },
    })
  try {
    const saved = await stopProfileInvitations(token)
    if (oneClick)
      return new Response(null, { status: saved ? 200 : 400, headers })
    return new Response(null, {
      status: 303,
      headers: { ...headers, Location: saved ? `${path}?done=1` : path },
    })
  } catch {
    if (oneClick) return new Response(null, { status: 503, headers })
    return new Response(null, {
      status: 303,
      headers: {
        ...headers,
        Location: `${path}?error=1&token=${encodeURIComponent(token)}`,
      },
    })
  }
}
