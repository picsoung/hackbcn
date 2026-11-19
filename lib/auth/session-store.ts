import 'server-only'
import { and, eq, gt, isNull, lte, or, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  identityAccounts as accounts,
  identitySessions as sessions,
} from '@/db/schema'
import {
  randomSessionToken,
  seal,
  sessionTokenHash,
  SESSION_TTL_SECONDS,
  unseal,
} from './security'
import type { IdentityConfig } from './identity-config'
import type { IdentityCredentials, IdentityUser } from './types'
import type { IdentitySessionStore } from './session-engine'

async function saveAccount(user: IdentityUser, issuer: string) {
  const [account] = await getDb()
    .insert(accounts)
    .values({ ...user, issuer })
    .onConflictDoUpdate({
      target: accounts.id,
      set: {
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        avatarUrl: user.avatarUrl,
        updatedAt: new Date(),
      },
      setWhere: eq(accounts.issuer, issuer),
    })
    .returning({ id: accounts.id })
  if (!account) throw new Error('Identity issuer mismatch')
}

export async function createIdentitySession(
  config: IdentityConfig,
  user: IdentityUser,
  credentials: IdentityCredentials,
) {
  await saveAccount(user, config.issuer)
  const token = randomSessionToken()
  await getDb()
    .insert(sessions)
    .values({
      tokenHash: sessionTokenHash(token)!,
      accountId: user.id,
      credentials: seal(credentials, config.encryptionKey, 'credentials'),
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    })
  return token
}

export function identitySessionStore(
  config: IdentityConfig,
): IdentitySessionStore {
  return {
    async load(hash) {
      const [row] = await getDb()
        .select({ session: sessions, account: accounts })
        .from(sessions)
        .innerJoin(accounts, eq(sessions.accountId, accounts.id))
        .where(
          and(eq(sessions.tokenHash, hash), eq(accounts.issuer, config.issuer)),
        )
        .limit(1)
      if (!row) return null
      const a = row.account,
        s = row.session
      if (s.revokedAt || s.expiresAt.getTime() <= Date.now()) return null
      const credentials = unseal(
        s.credentials,
        config.encryptionKey,
        'credentials',
      ) as IdentityCredentials
      if (
        !credentials ||
        typeof credentials.accessToken !== 'string' ||
        !Number.isFinite(credentials.expiresAt) ||
        (credentials.refreshToken !== undefined &&
          typeof credentials.refreshToken !== 'string')
      )
        throw new Error('Invalid stored identity credentials')
      return {
        id: s.id,
        user: {
          id: a.id,
          email: a.email,
          emailVerified: a.emailVerified,
          name: a.name,
          avatarUrl: a.avatarUrl,
        },
        credentials,
        expiresAt: s.expiresAt.getTime(),
        revoked: false,
        refreshVersion: s.refreshVersion,
      }
    },
    async lock(id, version, lease, now) {
      const rows = await getDb()
        .update(sessions)
        .set({
          refreshLease: lease,
          // Longer than discovery, token exchange, key verification and userinfo
          // combined; each provider request has a ten-second timeout.
          refreshLockedUntil: new Date(now + 60_000),
        })
        .where(
          and(
            eq(sessions.id, id),
            eq(sessions.refreshVersion, version),
            isNull(sessions.revokedAt),
            gt(sessions.expiresAt, new Date(now)),
            or(
              isNull(sessions.refreshLockedUntil),
              lte(sessions.refreshLockedUntil, new Date(now)),
            ),
          ),
        )
        .returning({ id: sessions.id })
      return rows.length === 1
    },
    async rotate(id, lease, user, credentials) {
      const rows = await getDb()
        .update(sessions)
        .set({
          credentials: seal(credentials, config.encryptionKey, 'credentials'),
          refreshVersion: sql`${sessions.refreshVersion} + 1`,
          refreshLease: null,
          refreshLockedUntil: null,
        })
        .where(
          and(
            eq(sessions.id, id),
            eq(sessions.refreshLease, lease),
            eq(sessions.accountId, user.id),
            isNull(sessions.revokedAt),
            gt(sessions.expiresAt, new Date()),
          ),
        )
        .returning({ id: sessions.id })
      if (rows.length !== 1) return false
      await saveAccount(user, config.issuer)
      return true
    },
    async release(id, lease) {
      await getDb()
        .update(sessions)
        .set({ refreshLease: null, refreshLockedUntil: null })
        .where(and(eq(sessions.id, id), eq(sessions.refreshLease, lease)))
    },
    async revoke(id) {
      await getDb()
        .update(sessions)
        .set({
          revokedAt: new Date(),
          refreshLease: null,
          refreshLockedUntil: null,
        })
        .where(eq(sessions.id, id))
    },
  }
}

export async function revokeIdentityToken(token: string) {
  const hash = sessionTokenHash(token)
  if (hash)
    await getDb()
      .update(sessions)
      .set({
        revokedAt: new Date(),
        refreshLease: null,
        refreshLockedUntil: null,
      })
      .where(eq(sessions.tokenHash, hash))
}
