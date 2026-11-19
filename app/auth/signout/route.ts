import { NextResponse, type NextRequest } from 'next/server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { revokeIdentityToken } from '@/lib/auth/session-store'
import { getAuthCookieOptions, getAuthLocale } from '@/lib/auth/shared'
import { identityCookieName } from '@/lib/auth/security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  let config
  try {
    config = getIdentityConfig()
  } catch {
    return NextResponse.json(
      { error: 'signout_unavailable' },
      { status: 503, headers },
    )
  }
  const origin = config
    ? new URL(config.redirectUri).origin
    : request.nextUrl.origin
  if (request.headers.get('origin') !== origin)
    return new NextResponse('Forbidden', { status: 403, headers })
  const url = new URL(origin)
  const cookieName = identityCookieName('session', url.protocol === 'https:')
  const token = request.cookies.get(cookieName)?.value
  try {
    if (token) await revokeIdentityToken(token)
    const form = await request.formData()
    const locale = getAuthLocale(String(form.get('locale') ?? 'en'))
    const response = NextResponse.redirect(new URL(`/${locale}`, origin), 303)
    response.cookies.set(cookieName, '', {
      ...getAuthCookieOptions(url.hostname, url.protocol === 'https:'),
      maxAge: 0,
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch {
    return NextResponse.json(
      { error: 'signout_unavailable' },
      { status: 503, headers },
    )
  }
}
