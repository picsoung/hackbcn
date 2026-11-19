import 'server-only'
import { getProjects } from '@/app/helpers/projects'
import { getProjectCatalog } from './project-catalog'
import { projectBuilder, type ProjectBuilder } from './project-detail'
import { relatedProjectCards, type ProjectCard } from './project-cards'
import {
  buildBuilderDirectory,
  builderForCredit,
  builderProfilePath,
} from './builders'

export async function getBuilderCatalog(locale: string) {
  const projects = await getProjectCatalog(locale)
  const archived = new Map(
    getProjects().map((project) => [
      `archive:${project.slug}`,
      (project.data.hackers ?? []).map(projectBuilder),
    ]),
  )
  const profiles = buildBuilderDirectory(
    projects.map((project) => ({
      projectKey: project.key,
      builders:
        archived.get(project.key) ?? project.hackers.map(projectBuilder),
    })),
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
        href: profile ? builderProfilePath(locale, profile.slug) : undefined,
      }
    }),
  }
}
