import type { NextRequest } from 'next/server'
import type { IdentityUser } from '@/lib/auth/types'
import {
  accountRequestHeaders,
  getAccountIdentity,
} from '@/lib/auth/account-request'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { validateCommunicationPreference } from '@/lib/account/communications'
import {
  dispatchContactPreferences,
  getCommunicationPreferences,
  saveCommunicationPreferences,
} from '@/lib/account/communication-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
function verifiedIdentity(user: { id: string }): user is IdentityUser {
  return (
    'emailVerified' in user &&
    user.emailVerified === true &&
    'email' in user &&
    typeof user.email === 'string' &&
    !!user.email
  )
}
export async function OPTIONS(request: NextRequest) {
  const headers = accountRequestHeaders(request)
  return new Response(null, {
    status: headers ? 204 : 403,
    headers: headers ?? { 'Cache-Control': 'no-store' },
  })
}
async function handle(request: NextRequest, write: boolean) {
  const headers = accountRequestHeaders(request)
  if (!headers)
    return Response.json(
      { error: 'forbidden' },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    )
  try {
    if (
      write &&
      !request.headers.has('authorization') &&
      request.headers.get('origin') !==
        new URL(getIdentityConfig()?.redirectUri ?? 'https://www.hackbarna.com')
          .origin
    )
      return Response.json({ error: 'forbidden' }, { status: 403, headers })
    const user = await getAccountIdentity(request)
    if (!user)
      return Response.json({ error: 'unauthorized' }, { status: 401, headers })
    if (write) {
      if (!verifiedIdentity(user))
        return Response.json(
          { error: 'verified_email_required' },
          { status: 403, headers },
        )
      const reader = request.body?.getReader()
      if (!reader)
        return Response.json({ error: 'invalid' }, { status: 400, headers })
      let size = 0,
        text = ''
      const decoder = new TextDecoder()
      try {
        for (;;) {
          const item = await reader.read()
          if (item.done) break
          size += item.value.byteLength
          if (size > 2048) {
            await reader.cancel()
            return Response.json(
              { error: 'too_large' },
              { status: 413, headers },
            )
          }
          text += decoder.decode(item.value, { stream: true })
        }
        text += decoder.decode()
      } finally {
        reader.releaseLock()
      }
      let input
      try {
        input = validateCommunicationPreference(JSON.parse(text))
      } catch {
        return Response.json({ error: 'invalid' }, { status: 400, headers })
      }
      const saved = await saveCommunicationPreferences(user, input)
      if (!saved)
        return Response.json({ error: 'conflict' }, { status: 409, headers })
      // The preference is durable even if the provider is unavailable.
      try {
        await dispatchContactPreferences(user.id)
      } catch {}
    }
    return Response.json(
      { preferences: await getCommunicationPreferences(user.id) },
      { headers },
    )
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503, headers })
  }
}
export const GET = (request: NextRequest) => handle(request, false)
export const PATCH = (request: NextRequest) => handle(request, true)
