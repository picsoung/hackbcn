import type { Project } from '../app/helpers/projects'
import type { PublicProject } from './live/projects'
import { projectListPath } from './project-seo'
import { projectHackers } from './live/validate'
import type { ProjectHacker } from './live/validate'

/** Explicit public fields shared by the event grid and the community archive. */
export type ProjectCard = {
  key: string
  name: string
  description: string
  href: string
  image?: string
  creator: string
  hackers: ProjectHacker[]
  eventSlug?: string
  eventName: string
  eventHref?: string
  eventDate: number
  tags: string[]
  award?: string
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
  options: { category?: string | null } = {},
): ProjectCard {
  return {
    key: `submitted:${project.eventSlug}:${project.slug}`,
    name: project.name,
    description: project.tagline,
    href: projectListPath(locale, project.eventSlug, project.slug),
    image: project.screenshotKey
      ? `/api/live/${encodeURIComponent(project.eventSlug)}/projects/${encodeURIComponent(project.slug)}/screenshot?v=${encodeURIComponent(project.screenshotKey)}`
      : videoThumbnail(project.videoUrl),
    creator: projectHackers(project)
      .map((hacker) => hacker.name)
      .join(', '),
    hackers: projectHackers(project),
    eventSlug: project.eventSlug,
    eventName: event.name,
    eventHref: projectListPath(locale, project.eventSlug),
    eventDate:
      Date.parse(event.startDate ?? '') ||
      new Date(project.createdAt).getTime() ||
      0,
    tags: options.category ? [options.category] : [],
    award: project.award ?? undefined,
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
    hackers: projectHackers({
      hackers: project.data.hackers?.map((person) => ({
        name: person.name,
        linkedinUrl: person.links?.linkedin,
      })),
      creatorName: '',
      linkedinUrl: '',
    }).filter((person) => person.name),
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

/** Profile identity ignores tracking parameters, host variants and a trailing slash. */
function builderProfile(url: string | null) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !/(^|\.)linkedin\.com$/i.test(parsed.hostname)
    )
      return null
    const match = parsed.pathname.match(/^\/in\/([^/]+)\/?$/i)
    return match ? decodeURIComponent(match[1]).toLowerCase() : null
  } catch {
    return null
  }
}

export function relatedProjectCards(
  current: ProjectCard,
  catalog: ProjectCard[],
  limit = 3,
) {
  const profiles = new Set(
    current.hackers
      .map((hacker) => builderProfile(hacker.linkedinUrl))
      .filter(Boolean),
  )
  const seen = new Set([current.href])
  const candidates = catalog.filter((project) => {
    if (project.key === current.key || seen.has(project.href)) return false
    seen.add(project.href)
    return true
  })
  const byBuilder = candidates
    .filter((project) =>
      project.hackers.some((hacker) => {
        const profile = builderProfile(hacker.linkedinUrl)
        return profile != null && profiles.has(profile)
      }),
    )
    .slice(0, limit)
  const builderLinks = new Set(byBuilder.map((project) => project.href))
  const byEvent = current.eventSlug
    ? candidates
        .filter(
          (project) =>
            project.eventSlug === current.eventSlug &&
            !builderLinks.has(project.href),
        )
        .slice(0, limit)
    : []
  return { byBuilder, byEvent }
}
