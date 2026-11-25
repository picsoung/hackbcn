import 'server-only'
import { getPublicArchivedProjects } from './projects/archive-visibility'
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

export async function getBuilderCatalog(locale: string) {
  const projects = await getProjectCatalog(locale)
  const archived = new Map(
    (await getPublicArchivedProjects()).map((project) => [
      `archive:${project.slug}`,
      (project.data.hackers ?? []).map(projectBuilder),
    ]),
  )
  const sourceProfiles = buildBuilderDirectory(
    projects.map((project) => ({
      projectKey: project.key,
      builders:
        archived.get(project.key) ?? project.hackers.map(projectBuilder),
    })),
  )
  const profiles = applyClaimedDisplays(
    sourceProfiles,
    new Map(projects.map((project) => [project.key, project.hackers])),
    await claimedBuilderDisplays(projects.map((project) => project.key)),
  )
  return { profiles, projects }
}

export async function getProjectPageContext(
  current: ProjectCard,
  builders: ProjectBuilder[],
  locale: string,
) {
  const { profiles, projects } = await getBuilderCatalog(locale)
  return {
    related: relatedProjectCards(current, projects),
    builders: builders.map((builder, index) => {
      const profile = builderForCredit(profiles, current.key, index)
      return {
        ...builder,
        ...(profile?.claimed
          ? { name: profile.name, image: profile.image, links: profile.links }
          : {}),
        href: profile ? builderProfilePath(locale, profile.slug) : undefined,
      }
    }),
  }
}
