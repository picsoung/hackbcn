import 'server-only'
import { getArchivedProjectCounts } from '@/app/helpers/projects'
import {
  getPublicArchivedProjects,
  getPublicArchivedProjectsByEvent,
} from './projects/archive-visibility'
import { getEventDataBySlug } from '@/lib/events-server'
import { getLiveEvent } from '@/lib/live/config'
import {
  categoryLabel,
  listAllProjects,
  listProjects,
  listProjectCounts,
} from '@/lib/live/projects'
import {
  archivedProjectCard,
  relatedProjectCards,
  submittedProjectCard,
  type ProjectCard,
  type ProjectEventSummary,
} from './project-cards'
import { projectListPath } from './project-seo'

async function projectCounts(eventSlug?: string) {
  const archived = getArchivedProjectCounts()
  const submitted =
    !eventSlug || getLiveEvent(eventSlug)
      ? await listProjectCounts(eventSlug)
      : []
  for (const row of submitted)
    archived[row.eventSlug] = (archived[row.eventSlug] ?? 0) + row.count
  return archived
}

export async function getEventProjects(locale: string, eventSlug: string) {
  const [projects, counts] = await Promise.all([
    getEventProjectCards(locale, eventSlug),
    projectCounts(eventSlug),
  ])
  return { projects, total: Math.max(projects.length, counts[eventSlug] ?? 0) }
}

export async function getProjectEventSummaries(
  locale: string,
): Promise<ProjectEventSummary[]> {
  return Object.entries(await projectCounts()).map(([slug, total]) => {
    const event = getEventDataBySlug(slug)?.event
    const live = getLiveEvent(slug)
    return {
      key: slug,
      name: event?.name ?? live?.name ?? 'Community projects',
      image: event?.imageUrl ?? live?.image,
      href: event || live ? projectListPath(locale, slug) : undefined,
      date: Date.parse(event?.startDate ?? '') || 0,
      total,
    }
  })
}

export async function getEventProjectCards(locale: string, eventSlug: string) {
  const event = getEventDataBySlug(eventSlug)?.event
  const live = getLiveEvent(eventSlug)
  const archived = (await getPublicArchivedProjectsByEvent(eventSlug)).map(
    (project) => archivedProjectCard(project, locale, event),
  )
  if (!live) return archived
  const submitted = await listProjects(eventSlug)
  return [
    ...submitted.map((project) =>
      submittedProjectCard(project, locale, event ?? live, {
        category: categoryLabel(project.category),
      }),
    ),
    ...archived,
  ]
}

export async function getProjectCatalog(locale: string) {
  const submitted = await listAllProjects()
  return [
    ...submitted.map((project) => {
      const live = getLiveEvent(project.eventSlug)!
      const event = getEventDataBySlug(project.eventSlug)?.event ?? live
      return submittedProjectCard(project, locale, event, {
        category: categoryLabel(project.category),
      })
    }),
    ...(await getPublicArchivedProjects()).map((project) =>
      archivedProjectCard(
        project,
        locale,
        project.data.event
          ? getEventDataBySlug(project.data.event)?.event
          : undefined,
      ),
    ),
  ]
}

export async function getRelatedProjectCards(
  current: ProjectCard,
  locale: string,
) {
  return relatedProjectCards(current, await getProjectCatalog(locale))
}
