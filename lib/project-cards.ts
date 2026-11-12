import type { Project } from '../app/helpers/projects'
import type { PublicProject } from './live/projects'
import { projectListPath } from './project-seo'

/** Explicit public fields shared by the event grid and the community archive. */
export type ProjectCard = {
  key: string
  name: string
  description: string
  href: string
  image?: string
  creator: string
  eventSlug?: string
  eventName: string
  eventHref?: string
  eventDate: number
  tags: string[]
  award?: string
  voteCount?: number
  judgeScore?: number | null
  voting?: { eventSlug: string; slug: string; voted: boolean }
}

function videoThumbnail(url: string | null) {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const id =
      host === 'youtu.be'
        ? parsed.pathname.slice(1)
        : ['youtube.com', 'm.youtube.com'].includes(host)
          ? (parsed.searchParams.get('v') ??
            parsed.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1])
          : null
    return id && /^[a-zA-Z0-9_-]+$/.test(id)
      ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      : undefined
  } catch {
    return undefined
  }
}

type EventInfo = { name: string; startDate?: string }

export function submittedProjectCard(
  project: PublicProject,
  locale: string,
  event: EventInfo,
  options: { category?: string | null; open?: boolean; voted?: boolean } = {},
): ProjectCard {
  return {
    key: `submitted:${project.eventSlug}:${project.slug}`,
    name: project.name,
    description: project.tagline,
    href: projectListPath(locale, project.eventSlug, project.slug),
    image: project.screenshotKey
      ? `/api/live/${encodeURIComponent(project.eventSlug)}/projects/${encodeURIComponent(project.slug)}/screenshot?v=${encodeURIComponent(project.screenshotKey)}`
      : videoThumbnail(project.videoUrl),
    creator: project.creatorName,
    eventSlug: project.eventSlug,
    eventName: event.name,
    eventHref: projectListPath(locale, project.eventSlug),
    eventDate:
      Date.parse(event.startDate ?? '') ||
      new Date(project.createdAt).getTime() ||
      0,
    tags: options.category ? [options.category] : [],
    voteCount: project.voteCount,
    judgeScore: project.judgeScore,
    voting: options.open
      ? {
          eventSlug: project.eventSlug,
          slug: project.slug,
          voted: options.voted ?? false,
        }
      : undefined,
  }
}

export function archivedProjectCard(
  project: Project,
  locale: string,
  event?: EventInfo,
): ProjectCard {
  return {
    key: `archive:${project.slug}`,
    name: project.data.title,
    description: project.data.description,
    href: `/${locale}/projects/${project.slug.split('/').map(encodeURIComponent).join('/')}`,
    image: project.data.thumbnailUrl || undefined,
    creator:
      project.data.hackers?.map((person) => person.name).join(', ') ?? '',
    eventSlug: project.data.event,
    eventName: event?.name ?? 'Community projects',
    eventHref: project.data.event
      ? projectListPath(locale, project.data.event)
      : undefined,
    eventDate:
      Date.parse(event?.startDate ?? '') ||
      project.data.publishedDate.getTime() ||
      0,
    tags: project.data.techStack ?? [],
    award: project.data.winner ? project.data.winner.text : undefined,
  }
}

export function groupProjectCards(projects: ProjectCard[]) {
  const groups = new Map<
    string,
    {
      key: string
      name: string
      href?: string
      date: number
      projects: ProjectCard[]
    }
  >()
  for (const project of projects) {
    const key = project.eventSlug ?? 'community'
    const group = groups.get(key) ?? {
      key,
      name: project.eventName,
      href: project.eventHref,
      date: project.eventDate,
      projects: [],
    }
    group.projects.push(project)
    group.date = Math.max(group.date, project.eventDate)
    groups.set(key, group)
  }
  return Array.from(groups.values()).sort(
    (a, b) => b.date - a.date || a.name.localeCompare(b.name),
  )
}
