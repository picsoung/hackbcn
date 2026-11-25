import 'server-only'
import { NextResponse } from 'next/server'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import type { IdentityUser } from '@/lib/auth/types'
import { ProjectAccessError } from './ownership'

export async function projectMutation(
  request: Request,
  action: (
    user: IdentityUser,
    body: Record<string, unknown>,
  ) => Promise<unknown>,
  maxBytes = 8192,
) {
  const headers = {
    'Cache-Control': 'private, no-store',
    Vary: 'Cookie, Origin',
  }
  try {
    const config = getIdentityConfig()
    if (
      !config ||
      request.headers.get('origin') !== new URL(config.redirectUri).origin
    )
      throw new ProjectAccessError('forbidden', 403)
    if (
      request.headers.get('content-type')?.split(';')[0].trim() !==
      'application/json'
    )
      throw new ProjectAccessError('invalid', 415)
    const user = await getCurrentIdentity()
    if (!user)
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers },
      )
    if (!user.emailVerified || !user.email)
      throw new ProjectAccessError('forbidden', 403)
    const reader = request.body?.getReader()
    if (!reader) throw new ProjectAccessError('invalid', 400)
    let size = 0,
      text = ''
    const decoder = new TextDecoder()
    try {
      for (;;) {
        const result = await reader.read()
        if (result.done) break
        size += result.value.byteLength
        if (size > maxBytes) {
          await reader.cancel()
          return NextResponse.json(
            { error: 'too_large' },
            { status: 413, headers },
          )
        }
        text += decoder.decode(result.value, { stream: true })
      }
      text += decoder.decode()
    } finally {
      reader.releaseLock()
    }
    let body
    try {
      body = JSON.parse(text)
    } catch {
      throw new ProjectAccessError('invalid', 400)
    }
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new ProjectAccessError('invalid', 400)
    return NextResponse.json(await action(user, body), { headers })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof ProjectAccessError ? error.code : 'unavailable',
      },
      {
        status: error instanceof ProjectAccessError ? error.status : 503,
        headers,
      },
    )
  }
}
