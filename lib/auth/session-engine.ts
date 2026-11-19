import { randomUUID } from 'node:crypto'
import type { IdentityCredentials, IdentityUser } from './types'

export type StoredIdentitySession = {
  id: string
  user: IdentityUser
  credentials: IdentityCredentials
  expiresAt: number
  revoked: boolean
  refreshVersion: number
}

export interface IdentitySessionStore {
  load(hash: string): Promise<StoredIdentitySession | null>
  lock(
    id: string,
    version: number,
    lease: string,
    now: number,
  ): Promise<boolean>
  rotate(
    id: string,
    lease: string,
    user: IdentityUser,
    credentials: IdentityCredentials,
  ): Promise<boolean>
  release(id: string, lease: string): Promise<void>
  revoke(id: string): Promise<void>
}

export class IdentityUnavailable extends Error {
  constructor() {
    super('Identity service temporarily unavailable')
  }
}

/** Server authorization: a live opaque session is required; refreshes are version/lease coordinated. */
export async function resolveIdentitySession(
  hash: string,
  store: IdentitySessionStore,
  refresh: (
    credentials: IdentityCredentials,
    subject: string,
  ) => Promise<{ user: IdentityUser; credentials: IdentityCredentials }>,
  revoked: (error: unknown) => boolean,
  clock = Date.now,
  delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
): Promise<IdentityUser | null> {
  let session = await store.load(hash)
  for (let attempt = 0; attempt < 6; attempt++) {
    const now = clock()
    if (!session || session.revoked || session.expiresAt <= now) return null
    if (session.credentials.expiresAt > now + 60_000) return session.user
    if (!session.credentials.refreshToken) {
      if (session.credentials.expiresAt > now) return session.user
      await store.revoke(session.id)
      return null
    }
    const lease = randomUUID()
    if (await store.lock(session.id, session.refreshVersion, lease, now)) {
      try {
        const result = await refresh(session.credentials, session.user.id)
        if (result.user.id !== session.user.id) {
          await store.revoke(session.id)
          return null
        }
        return (await store.rotate(
          session.id,
          lease,
          result.user,
          result.credentials,
        ))
          ? result.user
          : null
      } catch (error) {
        if (revoked(error)) {
          await store.revoke(session.id)
          return null
        }
        // A transport failure never turns into an authenticated session with expired credentials.
        if (session.credentials.expiresAt > clock()) return session.user
        throw new IdentityUnavailable()
      } finally {
        await store.release(session.id, lease)
      }
    }
    if (attempt < 5) {
      await delay(100)
      session = await store.load(hash)
    }
  }
  if (
    session &&
    !session.revoked &&
    session.expiresAt > clock() &&
    session.credentials.expiresAt > clock()
  )
    return session.user
  throw new IdentityUnavailable()
}
