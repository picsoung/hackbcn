import 'server-only'
import { getProjectCatalog } from './project-catalog'
import { projectBuilder, type ProjectBuilder } from './project-detail'
import { relatedProjectCards, type ProjectCard } from './project-cards'
import {
  buildBuilderDirectory,
  builderForCredit,
  builderProfilePath,
} from './builders'
import { claimedBuilderDisplays } from './community/claimed-profiles'
import { applyClaimedDisplays } from './community/claimed-display'
import { applyBuilderDisplays } from './community/builder-display'
import { builderDisplayOverrides } from './community/builder-profiles'
import {
  creatorPrivacyContext,
  globalBuilderFields,
} from '@/lib/projects/creator-privacy'
import { maskBuilderFields } from './projects/privacy-model'

export function sourceBuilderProfiles(projects: ProjectCard[]) {
  return buildBuilderDirectory(
    projects.map((project) => ({
      projectKey: project.key,
      builders: project.builders ?? project.hackers.map(projectBuilder),
    })),
  )
}

export async function getBuilderCatalog(locale: string) {
  const projects = await getProjectCatalog(locale)
  const sourceProfiles = sourceBuilderProfiles(projects)
  const privacy = await creatorPrivacyContext()
  const profiles = applyClaimedDisplays(
    applyBuilderDisplays(
      sourceProfiles,
      await builderDisplayOverrides(
        sourceProfiles.map((profile) => profile.slug),
      ),
    ),
    privacy.rosters,
    await claimedBuilderDisplays(projects.map((project) => project.key)),
  )
  return {
    profiles: profiles.map((profile) =>
      maskBuilderFields(profile, globalBuilderFields(privacy, profile.credits)),
    ),
    projects,
  }
}

export async function getProjectPageContext(
  current: ProjectCard,
  builders: ProjectBuilder[],
  locale: string,
) {
  const { profiles, projects } = await getBuilderCatalog(locale)
  return {
    related: relatedProjectCards(current, projects),
    builders: builders.flatMap((builder, index) => {
      const profile = builderForCredit(
        profiles,
        current.key,
        builder.creditIndex ?? index,
      )
      if (!profile) return []
      return [
        maskBuilderFields(
          {
            ...builder,
            ...(profile?.claimed || profile?.edited
              ? {
                  name: profile.name,
                  image: profile.image,
                  links: profile.links,
                }
              : {}),
            href: profile
              ? builderProfilePath(locale, profile.slug)
              : undefined,
          },
          builder.hiddenFields ?? [],
        ),
      ]
    }),
  }
}
