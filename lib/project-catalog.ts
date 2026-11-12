import 'server-only'
import { getProjects, getProjectsByEvent } from '@/app/helpers/projects'
import { getEventDataBySlug } from '@/lib/events-server'
import { getLiveEvent } from '@/lib/live/config'
import {
  categoryLabel,
  listAllProjects,
  listProjects,
  votedProjectIds,
} from '@/lib/live/projects'
import { readVoterId } from '@/lib/live/voter'
import { archivedProjectCard, submittedProjectCard } from './project-cards'

export async function getEventProjectCards(locale: string, eventSlug: string) {
  const event = getEventDataBySlug(eventSlug)?.event
  const live = getLiveEvent(eventSlug)
  const archived = getProjectsByEvent(eventSlug).map((project) =>
    archivedProjectCard(project, locale, event),
  )
  if (!live) return archived
  const [submitted, voted] = await Promise.all([
    listProjects(eventSlug),
    live.open
      ? votedProjectIds(readVoterId())
      : Promise.resolve(new Set<number>()),
  ])
  return [
    ...submitted.map((project) =>
      submittedProjectCard(project, locale, event ?? live, {
        category: categoryLabel(project.category),
        open: live.open,
        voted: voted.has(project.id),
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
    ...getProjects().map((project) =>
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
