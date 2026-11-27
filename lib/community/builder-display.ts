import type { BuilderProfile } from '../builders'
import type { CommunityProfile } from './profile'

export type BuilderDisplay = {
  slug: string
  content: Omit<CommunityProfile, 'revision'> | null
}

/** Display-only corrections: never regroup credits or grant project access. */
export function applyBuilderDisplays(
  profiles: BuilderProfile[],
  rows: BuilderDisplay[],
) {
  const overrides = new Map(rows.map((row) => [row.slug, row.content]))
  return profiles.map((profile) => {
    const content = overrides.get(profile.slug)
    if (!content) return profile
    const { linkedin, github, ...links } = profile.links
    return {
      ...profile,
      edited: true,
      name: content.displayName,
      bio: content.bio || undefined,
      image: content.avatarUrl || undefined,
      links: {
        ...links,
        ...(content.linkedinUrl ? { linkedin: content.linkedinUrl } : {}),
        ...(content.githubUrl ? { github: content.githubUrl } : {}),
      },
    }
  })
}
