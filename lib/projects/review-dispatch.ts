import 'server-only'
import { randomUUID } from 'node:crypto'
import { and, eq, gt, lte, or, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { projectClaims, projectContent, reviewNotifications } from '@/db/schema'
import { sourceProject } from './ownership-store'
import {
  reviewNotificationSettings,
  slackReviewPayload,
} from './review-notifications'

export async function dispatchReviewNotifications(
  send: typeof fetch = fetch,
  budgetMs = 15000,
) {
  const settings = reviewNotificationSettings()
  const result = {
    sent: 0,
    retried: 0,
    cancelled: 0,
    failed: 0,
    disabled: !settings.enabled,
  }
  if (!settings.enabled) return result
  return getDb().transaction(async (guard) => {
    const [lock] = await guard
      .select({
        acquired:
          sql<boolean>`pg_try_advisory_xact_lock(hashtext('hackbarna-review-delivery'))`.as(
            'acquired',
          ),
      })
      .from(sql`(select 1) as notification_guard`)
    if (!lock.acquired) return result
    const [cooldown] = await guard
      .select({ id: reviewNotifications.id })
      .from(reviewNotifications)
      .where(
        and(
          eq(reviewNotifications.webhookFingerprint, settings.fingerprint),
          eq(reviewNotifications.lastError, 'http_429'),
          gt(reviewNotifications.nextAttemptAt, new Date()),
        ),
      )
      .limit(1)
    if (cooldown) return result
    const deadline = Date.now() + Math.min(budgetMs, 15000)
    for (let count = 0; count < 20 && Date.now() < deadline - 1000; count++) {
      const item = await getDb().transaction(async (tx) => {
        const now = new Date()
        const [row] = await tx
          .select()
          .from(reviewNotifications)
          .where(
            or(
              and(
                eq(reviewNotifications.status, 'pending'),
                lte(reviewNotifications.nextAttemptAt, now),
              ),
              and(
                eq(reviewNotifications.status, 'sending'),
                lte(reviewNotifications.lockedUntil, now),
              ),
            ),
          )
          .orderBy(reviewNotifications.createdAt)
          .limit(1)
          .for('update', { skipLocked: true })
        if (!row) return null
        const lease = randomUUID()
        await tx
          .update(reviewNotifications)
          .set({
            status: 'sending',
            lease,
            lockedUntil: new Date(Date.now() + 120000),
            attempts: sql`${reviewNotifications.attempts}+1`,
          })
          .where(eq(reviewNotifications.id, row.id))
        return { ...row, lease, attempts: row.attempts + 1 }
      })
      if (!item) break
      let status: 'sent' | 'pending' | 'cancelled' | 'failed' = 'cancelled',
        error: string | null = null,
        retryAt = new Date(Date.now() + 300000)
      try {
        let current = item.webhookFingerprint === settings.fingerprint
        if (current && item.claimId) {
          const [claim] = await getDb()
            .select()
            .from(projectClaims)
            .where(eq(projectClaims.id, item.claimId))
          current =
            claim?.status === 'pending' &&
            claim.requestedAt.getTime() === item.requestedAt?.getTime()
        } else if (current) {
          const [edit] = await getDb()
            .select({
              status: projectContent.status,
              revision: projectContent.revision,
            })
            .from(projectContent)
            .where(eq(projectContent.projectKey, item.projectKey))
          current =
            edit?.status === 'pending' &&
            edit.revision === item.revision &&
            !!(await sourceProject(item.projectKey, 'en'))
        }
        if (current) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const response = await send(settings.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              slackReviewPayload(item.payload, settings.origin),
            ),
            redirect: 'error',
            signal: AbortSignal.timeout(
              Math.max(500, Math.min(4000, deadline - Date.now() - 500)),
            ),
          })
          if (response.ok && (await response.text()).trim() === 'ok')
            status = 'sent'
          else {
            error = `http_${response.status}`
            status =
              response.status === 429 || response.status >= 500
                ? 'pending'
                : 'failed'
            const retryAfter = Number(response.headers.get('retry-after'))
            retryAt = new Date(
              Date.now() +
                Math.max(
                  60000,
                  Math.min(
                    3600000,
                    Number.isFinite(retryAfter) && retryAfter > 0
                      ? retryAfter * 1000
                      : 60000 * 2 ** Math.min(item.attempts, 6),
                  ),
                ),
            )
          }
        }
      } catch {
        error = 'delivery_unconfirmed'
        status = 'pending'
      }
      if (
        status === 'pending' &&
        (item.attempts >= 10 ||
          Date.now() - item.createdAt.getTime() > 86400000)
      )
        status = 'failed'
      await getDb()
        .update(reviewNotifications)
        .set({
          status,
          lastError: error,
          nextAttemptAt: retryAt,
          lease: null,
          lockedUntil: null,
          sentAt: status === 'sent' ? new Date() : null,
        })
        .where(
          and(
            eq(reviewNotifications.id, item.id),
            eq(reviewNotifications.lease, item.lease),
          ),
        )
      if (status === 'sent') result.sent++
      else if (status === 'pending') result.retried++
      else if (status === 'failed') result.failed++
      else result.cancelled++
      if (error === 'http_429') break
    }
    return result
  })
}
