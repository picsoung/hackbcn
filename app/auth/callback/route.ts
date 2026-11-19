import { NextResponse, type NextRequest } from 'next/server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { finishSignIn } from '@/lib/auth/oidc'
import {
  createIdentitySession,
  revokeIdentityToken,
} from '@/lib/auth/session-store'
import { getAuthCookieOptions, getSafeReturnPath } from '@/lib/auth/shared'
import {
  identityCookieName,
  readTransaction,
  SESSION_TTL_SECONDS,
} from '@/lib/auth/security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  let locale = 'en'
  let config
  try {
    config = getIdentityConfig()
  } catch {
    return NextResponse.json(
      { error: 'signin_unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  }
  const callback = new URL(config?.redirectUri ?? '/auth/callback', request.url)
  const secure = callback.protocol === 'https:'
  const transactionName = identityCookieName('transaction', secure)
  const sessionName = identityCookieName('session', secure)
  const cookieOptions = getAuthCookieOptions(callback.hostname, secure)
  try {
    if (!config) throw new Error('Identity not configured')
    const raw = request.cookies.get(transactionName)?.value
    if (!raw) throw new Error('Missing sign-in transaction')
    const transaction = readTransaction(
      raw,
      config.encryptionKey,
      config.redirectUri,
    )
    locale = transaction.locale
    // The external callback is fixed in server configuration, including its port.
    // Next.js may receive an internal proxy origin; preserve only its query.
    const externalCallback = new URL(config.redirectUri)
    externalCallback.search = request.nextUrl.search
    const result = await finishSignIn(config, externalCallback, transaction)
    const token = await createIdentitySession(
      config,
      result.user,
      result.credentials,
    )
    const previous = request.cookies.get(sessionName)?.value
    if (previous) await revokeIdentityToken(previous)
    const next = getSafeReturnPath(transaction.returnPath, `/${locale}/account`)
    const response = NextResponse.redirect(new URL(next, callback.origin))
    response.cookies.set(sessionName, token, {
      ...cookieOptions,
      maxAge: SESSION_TTL_SECONDS,
    })
    response.cookies.set(transactionName, '', { ...cookieOptions, maxAge: 0 })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch {
    console.error('HackBarna identity callback failed')
    const retry = new URL(`/${locale}/auth`, callback.origin)
    retry.searchParams.set('error', 'signin')
    const response = NextResponse.redirect(retry)
    response.cookies.set(transactionName, '', { ...cookieOptions, maxAge: 0 })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }
}
