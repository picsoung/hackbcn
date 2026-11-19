import { NextResponse, type NextRequest } from 'next/server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { beginSignIn } from '@/lib/auth/oidc'
import {
  getAuthCookieOptions,
  getAuthLocale,
  getSafeReturnPath,
} from '@/lib/auth/shared'
import {
  identityCookieName,
  seal,
  TRANSACTION_TTL_SECONDS,
} from '@/lib/auth/security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const locale = getAuthLocale(request.nextUrl.searchParams.get('locale'))
  const next = getSafeReturnPath(
    request.nextUrl.searchParams.get('next'),
    `/${locale}/account`,
  )
  try {
    const config = getIdentityConfig()
    if (!config)
      return NextResponse.json(
        { error: 'signin_unavailable' },
        {
          status: 503,
          headers: { 'Cache-Control': 'private, no-store' },
        },
      )
    const callback = new URL(config.redirectUri)
    // Netlify's proxy can expose an internal Next.js origin (localhost:3000).
    // Host only decides whether to redirect to the fixed configured origin.
    const host =
      request.headers.get('x-forwarded-host')?.split(',')[0].trim() ||
      request.headers.get('host')
    if (host !== callback.host) {
      const canonical = new URL('/auth/start', callback.origin)
      canonical.searchParams.set('locale', locale)
      canonical.searchParams.set('next', next)
      return NextResponse.redirect(canonical)
    }
    const { url, transaction } = await beginSignIn(config, next, locale)
    const response = NextResponse.redirect(url)
    response.cookies.set(
      identityCookieName('transaction', callback.protocol === 'https:'),
      seal(transaction, config.encryptionKey, 'transaction'),
      {
        ...getAuthCookieOptions(
          callback.hostname,
          callback.protocol === 'https:',
        ),
        maxAge: TRANSACTION_TTL_SECONDS,
      },
    )
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch {
    console.error('HackBarna identity start failed')
    const retry = new URL(`/${locale}/auth`, request.nextUrl.origin)
    retry.searchParams.set('error', 'signin')
    retry.searchParams.set('next', next)
    const response = NextResponse.redirect(retry)
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }
}
