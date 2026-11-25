import { ProjectAccessError } from '@/lib/projects/ownership'
import { NextResponse, type NextRequest } from 'next/server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import {
  accountRequestHeaders as requestHeaders,
  getAccountIdentity as account,
} from '@/lib/auth/account-request'
import {
  getCommunityProfile,
  saveCommunityProfile,
} from '@/lib/community/profile-store'
import {
  ProfileValidationError,
  validateCommunityProfile,
} from '@/lib/community/profile'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
class ProfileBodyTooLarge extends Error {}
async function readProfileBody(request: NextRequest) {
  const reader = request.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let size = 0,
    body = ''
  try {
    for (;;) {
      const result = await reader.read()
      if (result.done) break
      size += result.value.byteLength
      if (size > 16000) {
        await reader.cancel()
        throw new ProfileBodyTooLarge()
      }
      body += decoder.decode(result.value, { stream: true })
    }
    return body + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}
export async function OPTIONS(request: NextRequest) {
  const headers = requestHeaders(request)
  return new NextResponse(null, {
    status: headers ? 204 : 403,
    headers: headers ?? { 'Cache-Control': 'no-store' },
  })
}
export async function GET(request: NextRequest) {
  let headers: Record<string, string> = { 'Cache-Control': 'private, no-store' }
  try {
    const allowedHeaders = requestHeaders(request)
    if (!allowedHeaders)
      return NextResponse.json({ error: 'forbidden' }, { status: 403, headers })
    headers = allowedHeaders
    const user = await account(request)
    if (!user)
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers },
      )
    return NextResponse.json(
      { profile: await getCommunityProfile(user) },
      { headers },
    )
  } catch {
    return NextResponse.json(
      { error: 'profile_unavailable' },
      { status: 503, headers },
    )
  }
}
export async function PATCH(request: NextRequest) {
  let headers: Record<string, string> = { 'Cache-Control': 'private, no-store' }
  try {
    const allowedHeaders = requestHeaders(request)
    if (!allowedHeaders)
      return NextResponse.json({ error: 'forbidden' }, { status: 403, headers })
    headers = allowedHeaders
    // Cookie-authenticated mutations require explicit same-origin provenance.
    const config = getIdentityConfig()
    if (
      !request.headers.has('authorization') &&
      request.headers.get('origin') !==
        (config && new URL(config.redirectUri).origin)
    )
      return NextResponse.json({ error: 'forbidden' }, { status: 403, headers })
    const user = await account(request)
    if (!user)
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers },
      )
    const body = await readProfileBody(request)
    if (body.length > 16000)
      return NextResponse.json({ error: 'too_large' }, { status: 413, headers })
    let input: unknown
    try {
      input = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'invalid_profile' },
        { status: 400, headers },
      )
    }
    const profile = await saveCommunityProfile(
      user.id,
      validateCommunityProfile(input),
    )
    return profile
      ? NextResponse.json({ profile }, { headers })
      : NextResponse.json(
          { error: 'profile_conflict' },
          { status: 409, headers },
        )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ProfileValidationError ||
          error instanceof ProjectAccessError
            ? 'invalid_profile'
            : 'profile_unavailable',
        ...(error instanceof ProfileValidationError
          ? { field: error.field }
          : {}),
      },
      {
        status:
          error instanceof ProfileBodyTooLarge
            ? 413
            : error instanceof ProfileValidationError ||
                error instanceof ProjectAccessError
              ? 400
              : 503,
        headers,
      },
    )
  }
}
