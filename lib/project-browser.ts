import type { ProjectCard, ProjectEventSummary } from './project-cards'
import { projectTagSearchTerms } from './project-tags'
export type { ProjectCard, ProjectEventSummary } from './project-cards'

export function groupProjectCards(
  projects: ProjectCard[],
  summaries: ProjectEventSummary[] = [],
) {
  const groups = new Map<
    string,
    ProjectEventSummary & { projects: ProjectCard[] }
  >()
  for (const summary of summaries) {
    if (summary.total > 0) groups.set(summary.key, { ...summary, projects: [] })
  }
  for (const project of projects) {
    const key = project.eventSlug ?? 'community'
    const group = groups.get(key) ?? {
      key,
      name: project.eventName,
      image: project.eventImage,
      href: project.eventHref,
      date: project.eventDate,
      total: 0,
      projects: [],
    }
    group.projects.push(project)
    group.total = Math.max(group.total, group.projects.length)
    group.image ??= project.eventImage
    group.date = Math.max(group.date, project.eventDate)
    groups.set(key, group)
  }
  return Array.from(groups.values()).sort(
    (a, b) => b.date - a.date || a.name.localeCompare(b.name),
  )
}

function searchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Every query word can match a different public field or team member. */
export function searchProjectCards(projects: ProjectCard[], query: string) {
  const words = searchText(query).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return projects
  return projects.filter((project) => {
    const text = searchText(
      [
        project.name,
        project.description,
        project.eventName,
        project.eventSlug ?? '',
        project.creator,
        ...project.hackers.map((hacker) => hacker.name),
        ...projectTagSearchTerms([
          ...project.tags,
          ...(project.challenges ?? []),
        ]),
      ].join(' '),
    )
    return words.every((word) => text.includes(word))
  })
}
