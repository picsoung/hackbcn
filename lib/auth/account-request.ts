import 'server-only'
import type { NextRequest } from 'next/server'
import { getCurrentIdentity } from './identity-server'
import { getIdentityConfig } from './identity-config'
import { verifyProfileBearer } from './profile-bearer'

export function accountRequestHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    'Cache-Control': 'private, no-store',
    Vary: 'Origin, Cookie, Authorization',
  }
  const origin = request.headers.get('origin')
  const config = getIdentityConfig()
  const allowed = new Set([
    'https://digest.hackbarna.com',
    ...(config ? [new URL(config.redirectUri).origin] : []),
  ])
  if (config?.redirectUri.startsWith('http://localhost:'))
    allowed.add('http://localhost:5173')
  if (origin && !allowed.has(origin)) return null
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  headers['Access-Control-Allow-Methods'] = 'GET, PATCH, OPTIONS'
  headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
  return headers
}

export async function getAccountIdentity(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (authorization) {
    if (!/^Bearer [^\s]{1,16000}$/.test(authorization)) return null
    const config = getIdentityConfig()
    const trusted = [
      config?.clientId,
      ...(process.env.HACKBARNA_PROFILE_CLIENT_IDS ?? '').split(','),
    ]
      .filter((id): id is string => !!id?.trim())
      .map((id) => id.trim())
    try {
      return await verifyProfileBearer(authorization.slice(7), trusted)
    } catch {
      return null
    }
  }
  return getCurrentIdentity()
}
