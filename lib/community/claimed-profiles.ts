import 'server-only'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  communityProfiles,
  projectClaims,
  projectClaimEvidence,
} from '@/db/schema'
import type { ClaimedDisplay } from './claimed-display'

/** Only verified, unambiguous individual credits can bind an account to a public builder. */
export async function claimedBuilderDisplays(
  projectKeys: string[],
): Promise<ClaimedDisplay[]> {
  if (!projectKeys.length) return []
  return getDb()
    .select({
      projectKey: projectClaims.projectKey,
      creditIndex: projectClaimEvidence.creditIndex,
      rosterDigest: projectClaimEvidence.rosterDigest,
      accountId: communityProfiles.accountId,
      displayName: communityProfiles.displayName,
      avatarUrl: communityProfiles.avatarUrl,
      bio: communityProfiles.bio,
      linkedinUrl: communityProfiles.linkedinUrl,
      githubUrl: communityProfiles.githubUrl,
    })
    .from(projectClaims)
    .innerJoin(
      communityProfiles,
      eq(communityProfiles.accountId, projectClaims.accountId),
    )
    .innerJoin(
      projectClaimEvidence,
      and(
        eq(projectClaimEvidence.id, projectClaims.evidenceId),
        eq(projectClaimEvidence.projectKey, projectClaims.projectKey),
      ),
    )
    .where(
      and(
        inArray(projectClaims.projectKey, projectKeys),
        eq(projectClaims.status, 'verified'),
        eq(projectClaims.verificationMethod, 'email'),
        isNull(projectClaimEvidence.disabledAt),
      ),
    )
}
