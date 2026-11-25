import 'server-only'
import { and, eq, lte, lt, or, isNull, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDb } from '@/db'
import { accountCommunications } from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import type {
  CommunicationPreferences,
  CommunicationLanguage,
} from './communications'
import { syncResendCommunicationLanguage } from './resend-contact.mjs'

export function contactSyncEnabled() {
  return (
    process.env.HACKBARNA_CONTACT_SYNC_ENABLED === 'true' &&
    !!process.env.HACKBARNA_RESEND_API_KEY &&
    ['https://www.hackbarna.com', 'https://hackbarna.com'].includes(
      process.env.SITE_ORIGIN ?? 'https://www.hackbarna.com',
    )
  )
}

function fields(
  row?: typeof accountCommunications.$inferSelect,
): CommunicationPreferences {
  return {
    communicationLanguage: row?.communicationLanguage ?? null,
    revision: row?.revision ?? 0,
    contactSync:
      row && row.syncedRevision === row.revision
        ? 'synced'
        : contactSyncEnabled()
          ? 'pending'
          : 'not_configured',
  }
}
export async function getCommunicationPreferences(accountId: string) {
  const [row] = await getDb()
    .select()
    .from(accountCommunications)
    .where(eq(accountCommunications.accountId, accountId))
  return fields(row)
}
export async function saveCommunicationPreferences(
  user: IdentityUser,
  value: { communicationLanguage: CommunicationLanguage; revision: number },
) {
  if (!user.emailVerified || !user.email) throw Error('Unverified account')
  const values = {
    communicationLanguage: value.communicationLanguage,
    verifiedEmail: user.email,
    updatedAt: new Date(),
    nextAttemptAt: new Date(),
    attempts: 0,
    lastError: null,
  }
  const query =
    value.revision === 0
      ? getDb()
          .insert(accountCommunications)
          .values({ ...values, accountId: user.id })
          .onConflictDoNothing()
          .returning()
      : getDb()
          .update(accountCommunications)
          .set({
            ...values,
            revision: sql`${accountCommunications.revision} + 1`,
          })
          .where(
            and(
              eq(accountCommunications.accountId, user.id),
              eq(accountCommunications.revision, value.revision),
            ),
          )
          .returning()
  const [row] = await query
  return row ? fields(row) : null
}

export async function dispatchContactPreferences(
  accountId?: string,
  send: typeof fetch = fetch,
) {
  const result = { synced: 0, retried: 0, disabled: !contactSyncEnabled() }
  if (result.disabled) return result
  return getDb().transaction(async (guard) => {
    const [lock] = await guard
      .select({
        acquired:
          sql<boolean>`pg_try_advisory_xact_lock(hashtext('hackbarna-contact-preferences'))`.as(
            'acquired',
          ),
      })
      .from(sql`(select 1) as sync_guard`)
    if (!lock.acquired) return result
    const deadline = Date.now() + 12000
    for (
      let i = 0;
      i < (accountId ? 1 : 3) && Date.now() < deadline - 6000;
      i++
    ) {
      const row = await getDb().transaction(async (tx) => {
        const [item] = await tx
          .select()
          .from(accountCommunications)
          .where(
            and(
              ...(accountId
                ? [eq(accountCommunications.accountId, accountId)]
                : []),
              lt(
                accountCommunications.syncedRevision,
                accountCommunications.revision,
              ),
              lte(accountCommunications.nextAttemptAt, new Date()),
              or(
                isNull(accountCommunications.lockedUntil),
                lte(accountCommunications.lockedUntil, new Date()),
              ),
            ),
          )
          .limit(1)
          .for('update', { skipLocked: true })
        if (!item) return null
        const lease = randomUUID()
        await tx
          .update(accountCommunications)
          .set({ lease, lockedUntil: new Date(Date.now() + 60000) })
          .where(eq(accountCommunications.accountId, item.accountId))
        return { ...item, lease }
      })
      if (!row) break
      let error: string | null = null
      let retryAfter = 0
      try {
        await syncResendCommunicationLanguage(
          {
            email: row.verifiedEmail,
            language: row.communicationLanguage,
            apiKey: process.env.HACKBARNA_RESEND_API_KEY,
          },
          send,
        )
      } catch (cause) {
        error =
          cause instanceof Error && /^contact_http_\d{3}$/.test(cause.message)
            ? cause.message
            : 'contact_sync_unconfirmed'
        retryAfter =
          cause &&
          typeof cause === 'object' &&
          'retryAfter' in cause &&
          typeof cause.retryAfter === 'number' &&
          Number.isFinite(cause.retryAfter)
            ? Math.max(0, cause.retryAfter)
            : 0
      }
      await getDb()
        .update(accountCommunications)
        .set({
          ...(error ? {} : { syncedRevision: row.revision }),
          lease: null,
          lockedUntil: null,
          lastError: error,
          attempts: error ? row.attempts + 1 : 0,
          nextAttemptAt: new Date(
            Date.now() +
              Math.max(
                retryAfter * 1000,
                Math.min(3600000, 60000 * 2 ** Math.min(row.attempts, 6)),
              ),
          ),
        })
        .where(
          and(
            eq(accountCommunications.accountId, row.accountId),
            eq(accountCommunications.lease, row.lease),
            eq(accountCommunications.revision, row.revision),
          ),
        )
      // A newer save stays due immediately; do not overwrite its retry state.
      await getDb()
        .update(accountCommunications)
        .set({ lease: null, lockedUntil: null })
        .where(
          and(
            eq(accountCommunications.accountId, row.accountId),
            eq(accountCommunications.lease, row.lease),
          ),
        )
      if (error) result.retried++
      else result.synced++
      if (error) break
    }
    return result
  })
}
