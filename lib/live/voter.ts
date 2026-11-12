import 'server-only'
import { cookies } from 'next/headers'

/**
 * Votes are deduplicated by an anonymous httpOnly cookie plus a unique index on
 * (project_id, voter_id). No IP limits: everyone at the venue shares one network.
 */
const VOTER_COOKIE = 'hb_voter'

/** Readable from server components and route handlers. */
export function readVoterId(): string | undefined {
  const id = cookies().get(VOTER_COOKIE)?.value
  return id && /^[a-f0-9-]{36}$/.test(id) ? id : undefined
}

/** Route handlers only: cookies can't be set while rendering a page. */
export function ensureVoterId(): string {
  const existing = readVoterId()
  if (existing) return existing
  const id = crypto.randomUUID()
  cookies().set(VOTER_COOKIE, id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  })
  return id
}
