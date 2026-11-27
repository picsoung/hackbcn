import 'server-only'
import { unstable_noStore as noStore } from 'next/cache'
import { getDb } from '@/db'
import { creatorPrivacy, liveProjects, projectVisibility } from '@/db/schema'
import { getBuiltProjects, type Project } from '@/app/helpers/projects'
import { buildBuilderDirectory } from '@/lib/builders'
import { projectBuilder } from '@/lib/project-detail'
import { projectHackers, type ProjectHacker } from '@/lib/live/validate'
import { getLiveEvent, isHiddenProject } from '@/lib/live/config'

/** Private matching context, always read fresh. Never serialize source rosters to public components. */
export async function creatorPrivacyContext() {
  noStore()
  const [states, submitted, visibility] = await Promise.all([
    getDb().select().from(creatorPrivacy),
    getDb()
      .select({
        eventSlug: liveProjects.eventSlug,
        slug: liveProjects.slug,
        creatorName: liveProjects.creatorName,
        linkedinUrl: liveProjects.linkedinUrl,
        hackers: liveProjects.hackers,
        visibility: liveProjects.visibility,
      })
      .from(liveProjects),
    getDb().select().from(projectVisibility),
  ])
  const visibilityStates = new Map(
    visibility.map((row) => [row.projectKey, row.visibility]),
  )
  const archived = getBuiltProjects()
  const entries = [
    ...archived.map((project) => ({
      projectKey: `archive:${project.slug}`,
      builders: project.data.hackers.map(projectBuilder),
      visible:
        (visibilityStates.get(`archive:${project.slug}`) ??
          (project.data.status === 'private' ? 'private' : 'public')) ===
        'public',
    })),
    ...submitted
      .filter(
        (project) =>
          getLiveEvent(project.eventSlug) &&
          !isHiddenProject(project.eventSlug, project.slug),
      )
      .map((project) => ({
        projectKey: `submitted:${project.eventSlug}:${project.slug}`,
        builders: projectHackers(project).map(projectBuilder),
        visible: project.visibility === 'public',
      })),
  ]
  const profiles = buildBuilderDirectory(entries)
  // Private credits may identify the organiser's target, but cannot introduce a public identity/URL.
  const publicProfiles = buildBuilderDirectory(
    entries.filter((entry) => entry.visible),
  )
  const identities = new Map(
    publicProfiles.flatMap((profile) =>
      profile.credits.map(
        (credit) =>
          [`${credit.projectKey}:${credit.index}`, profile.slug] as const,
      ),
    ),
  )
  const hiddenSubjects = new Set(
    states.filter((state) => state.hidden).map((state) => state.subjectKey),
  )
  const hiddenCredits = new Set(
    profiles
      .filter((profile) => hiddenSubjects.has(`builder:${profile.slug}`))
      .flatMap((profile) =>
        profile.credits.map((credit) => `${credit.projectKey}:${credit.index}`),
      ),
  )
  const rosters = new Map(
    entries.map((entry) => [
      entry.projectKey,
      entry.builders.map((builder) => ({
        name: builder.name,
        linkedinUrl: builder.links.linkedin ?? null,
      })),
    ]),
  )
  return { states, identities, hiddenSubjects, hiddenCredits, rosters }
}

export async function publicArchiveCreators(projects: Project[]) {
  const context = await creatorPrivacyContext()
  return projects.map((project) => {
    const key = `archive:${project.slug}`
    const hackers = project.data.hackers.flatMap((person, index) => {
      const profileSlug = context.identities.get(`${key}:${index}`)
      return context.hiddenSubjects.has(`project:${key}`) ||
        context.hiddenCredits.has(`${key}:${index}`)
        ? []
        : [{ ...person, creditIndex: index, profileSlug }]
    })
    return {
      ...project,
      data: { ...project.data, hackers },
      builders: hackers.map(projectBuilder),
    }
  })
}

export async function publicSubmittedCreators<
  T extends {
    eventSlug: string
    slug: string
    creatorName: string
    linkedinUrl: string
    hackers: ProjectHacker[]
  },
>(projects: T[]): Promise<(T & { creatorCreditsHidden?: boolean })[]> {
  const context = await creatorPrivacyContext()
  return projects.map((project) => {
    const key = `submitted:${project.eventSlug}:${project.slug}`
    const hackers = projectHackers(project).flatMap((person, index) => {
      const profileSlug = context.identities.get(`${key}:${index}`)
      return context.hiddenSubjects.has(`project:${key}`) ||
        context.hiddenCredits.has(`${key}:${index}`)
        ? []
        : [{ ...person, creditIndex: index, profileSlug }]
    })
    return {
      ...project,
      hackers,
      creatorName: hackers.map((person) => person.name).join(', '),
      linkedinUrl: hackers[0]?.linkedinUrl ?? '',
      creatorCreditsHidden: hackers.length === 0,
    }
  })
}
