import 'server-only'
import { getDb } from '@/db'
import { reviewNotifications } from '@/db/schema'
import {
  reviewNotificationSettings,
  type ReviewAlert,
} from './review-notifications'

export async function enqueueReviewNotification(
  database: Pick<ReturnType<typeof getDb>, 'insert'>,
  event: {
    key: string
    projectKey: string
    revision?: number
    claimId?: string
    requestedAt?: Date
    alert: ReviewAlert
  },
) {
  const settings = reviewNotificationSettings()
  if (!settings.enabled) return
  await database
    .insert(reviewNotifications)
    .values({
      eventKey: event.key,
      projectKey: event.projectKey,
      revision: event.revision,
      claimId: event.claimId,
      requestedAt: event.requestedAt,
      webhookFingerprint: settings.fingerprint,
      payload: event.alert,
    })
    .onConflictDoNothing()
}
