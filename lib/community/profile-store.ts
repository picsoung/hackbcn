import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { communityProfiles } from '@/db/schema'
import { assertMediaReference } from '@/lib/media/store'
import { defaultCommunityProfile, type CommunityProfile } from './profile'

function publicFields(
  row: typeof communityProfiles.$inferSelect,
): CommunityProfile {
  return {
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    linkedinUrl: row.linkedinUrl,
    githubUrl: row.githubUrl,
    revision: row.revision,
  }
}
export async function getCommunityProfile(account: {
  id: string
  name: string | null
  avatarUrl: string | null
}) {
  const [row] = await getDb()
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.accountId, account.id))
    .limit(1)
  return row
    ? publicFields(row)
    : defaultCommunityProfile(account.name, account.avatarUrl)
}
export async function saveCommunityProfile(
  accountId: string,
  profile: CommunityProfile,
) {
  return getDb().transaction(async (tx) => {
    await assertMediaReference(
      profile.avatarUrl,
      accountId,
      'avatar',
      undefined,
      tx,
    )
    const { revision, ...values } = profile
    if (revision === 0) {
      const [row] = await tx
        .insert(communityProfiles)
        .values({ ...values, accountId })
        .onConflictDoNothing()
        .returning()
      return row ? publicFields(row) : null
    }
    const [row] = await tx
      .update(communityProfiles)
      .set({
        ...values,
        revision: sql`${communityProfiles.revision} + 1`,
        updatedAt: new Date(),
      })
      .where(
        sql`${communityProfiles.accountId} = ${accountId} AND ${communityProfiles.revision} = ${revision}`,
      )
      .returning()
    return row ? publicFields(row) : null
  })
}
