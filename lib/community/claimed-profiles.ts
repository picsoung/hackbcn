import 'server-only'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  communityProfiles,
  projectClaims,
  projectClaimEvidence,
  identityAccounts,
} from '@/db/schema'
import type { ClaimedDisplay } from './claimed-display'
import type { BuilderBinding } from '../projects/privacy-model'

/** Permission binding does not require a saved public community profile. */
export async function verifiedBuilderBindings(
  projectKeys: string[],
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
  lock = false,
): Promise<BuilderBinding[]> {
  if (!projectKeys.length) return []
  const query = database
    .select({
      projectKey: projectClaims.projectKey,
      creditIndex: projectClaimEvidence.creditIndex,
      rosterDigest: projectClaimEvidence.rosterDigest,
      accountId: projectClaims.accountId,
    })
    .from(projectClaims)
    .innerJoin(
      projectClaimEvidence,
      and(
        eq(projectClaimEvidence.id, projectClaims.evidenceId),
        eq(projectClaimEvidence.projectKey, projectClaims.projectKey),
      ),
    )
    .innerJoin(
      identityAccounts,
      eq(identityAccounts.id, projectClaims.accountId),
    )
    .where(
      and(
        inArray(projectClaims.projectKey, projectKeys),
        eq(projectClaims.status, 'verified'),
        eq(projectClaims.verificationMethod, 'email'),
        eq(identityAccounts.emailVerified, true),
        isNull(projectClaimEvidence.disabledAt),
      ),
    )
  return lock ? query.for('share') : query
}

/** Only verified, unambiguous individual credits can bind an account to a public builder. */
export async function claimedBuilderDisplays(
  projectKeys: string[],
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
): Promise<ClaimedDisplay[]> {
  if (!projectKeys.length) return []
  return database
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
