import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { profileInvitationOptOuts } from '@/db/schema'
import {
  invitationEmailHash,
  verifyInvitationOptOutToken,
} from './invitation-opt-out'

export async function stopProfileInvitations(token: unknown) {
  const emailHash = verifyInvitationOptOutToken(token)
  if (!emailHash) return false
  await getDb()
    .insert(profileInvitationOptOuts)
    .values({ emailHash })
    .onConflictDoNothing()
  return true
}

/** Delivery must fail closed if this lookup or its configuration is unavailable. */
export async function profileInvitationsStopped(email: string) {
  const [row] = await getDb()
    .select({ hash: profileInvitationOptOuts.emailHash })
    .from(profileInvitationOptOuts)
    .where(eq(profileInvitationOptOuts.emailHash, invitationEmailHash(email)))
    .limit(1)
  return !!row
}
