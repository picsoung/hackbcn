import type { BuilderProfile } from '../builders'
import { claimRosterDigest } from '../projects/email-proof'

export type ClaimedDisplay = {
  projectKey: string
  creditIndex: number
  rosterDigest: string
  accountId: string
  displayName: string
  avatarUrl: string
  bio: string
  linkedinUrl: string
  githubUrl: string
}

/** Presentation changes happen after source-based grouping, so editable links cannot merge identities. */
export function applyClaimedDisplays(
  profiles: BuilderProfile[],
  rosters: Map<string, { name: string; linkedinUrl?: string | null }[]>,
  bindings: ClaimedDisplay[],
): BuilderProfile[] {
  return profiles.map((profile) => {
    const candidates = bindings.filter((binding) => {
      const roster = rosters.get(binding.projectKey)
      return (
        roster &&
        binding.creditIndex >= 0 &&
        binding.creditIndex < roster.length &&
        binding.rosterDigest === claimRosterDigest(roster) &&
        profile.credits.some(
          (credit) =>
            credit.projectKey === binding.projectKey &&
            credit.index === binding.creditIndex,
        )
      )
    })
    // Conflicting accounts cannot overwrite a shared historical identity.
    if (
      !candidates.length ||
      new Set(candidates.map((row) => row.accountId)).size !== 1
    )
      return profile
    const current = candidates[0]
    const { linkedin, github, ...otherLinks } = profile.links
    return {
      ...profile,
      name: current.displayName,
      image: current.avatarUrl || undefined,
      bio: current.bio || undefined,
      links: {
        ...otherLinks,
        ...(current.linkedinUrl ? { linkedin: current.linkedinUrl } : {}),
        ...(current.githubUrl ? { github: current.githubUrl } : {}),
      },
      claimed: true,
    }
  })
}
