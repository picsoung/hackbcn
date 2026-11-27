import 'server-only'
import { unstable_noStore as noStore } from 'next/cache'
import { getDb } from '@/db'
import { creatorPrivacy, liveProjects, projectVisibility } from '@/db/schema'
import { getBuiltProjects, type Project } from '@/app/helpers/projects'
import { buildBuilderDirectory } from '@/lib/builders'
import { projectBuilder } from '@/lib/project-detail'
import { projectHackers, type ProjectHacker } from '@/lib/live/validate'
import { getLiveEvent, isHiddenProject } from '@/lib/live/config'
import {
  type PrivacyField,
  visibleLinks,
  visibleProjectUrl,
  visibleTextLinks,
} from './privacy-model'

/** Private matching context, always read fresh. Never serialize source rosters to public components. */
export async function creatorPrivacyContext(
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
) {
  noStore()
  const states = await database.select().from(creatorPrivacy)
  const submitted = await database
    .select({
      eventSlug: liveProjects.eventSlug,
      slug: liveProjects.slug,
      creatorName: liveProjects.creatorName,
      linkedinUrl: liveProjects.linkedinUrl,
      hackers: liveProjects.hackers,
      visibility: liveProjects.visibility,
    })
    .from(liveProjects)
  const visibility = await database.select().from(projectVisibility)
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
  const managementIdentities = new Map(
    profiles.flatMap((profile) =>
      profile.credits.map(
        (credit) =>
          [`${credit.projectKey}:${credit.index}`, profile.slug] as const,
      ),
    ),
  )
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
  return {
    states,
    policies: new Map(states.map((row) => [row.subjectKey, row])),
    profiles,
    managementIdentities,
    identities,
    hiddenSubjects,
    hiddenCredits,
    rosters,
  }
}

export function creditPrivacy(
  context: Awaited<ReturnType<typeof creatorPrivacyContext>>,
  key: string,
  index: number,
) {
  const slug = context.managementIdentities.get(`${key}:${index}`)
  const rows = [
    `project:${key}`,
    ...(slug ? [`credit:${key}:${slug}`, `builder:${slug}`] : []),
  ].map((subject) => context.policies.get(subject))
  return {
    hidden: rows.some((row) => row?.hidden),
    hiddenFields: Array.from(
      new Set(rows.flatMap((row) => row?.hiddenFields ?? [])),
    ),
  }
}
export function globalBuilderFields(
  context: Awaited<ReturnType<typeof creatorPrivacyContext>>,
  credits: { projectKey: string; index: number }[],
): PrivacyField[] {
  return Array.from(
    new Set(
      credits.flatMap((credit) => {
        const slug = context.managementIdentities.get(
          `${credit.projectKey}:${credit.index}`,
        )
        return slug
          ? (context.policies.get(`builder:${slug}`)?.hiddenFields ?? [])
          : []
      }),
    ),
  )
}
function publicBody(content: string, fields: PrivacyField[]) {
  if (!fields.length) return content
  return visibleTextLinks(content, fields)
    .replace(/<YouTube\b[^>]*\/>/g, (component) =>
      fields.includes('otherLinks') ? '' : component,
    )
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (component) =>
      fields.includes('otherLinks') ? '' : component,
    )
}

export async function publicArchiveCreators(projects: Project[]) {
  const context = await creatorPrivacyContext()
  return projects.map((project) => {
    const key = `archive:${project.slug}`
    const projectFields =
      context.policies.get(`project:${key}`)?.hiddenFields ?? []
    const hackers = project.data.hackers.flatMap((person, index) => {
      const profileSlug = context.identities.get(`${key}:${index}`)
      const policy = creditPrivacy(context, key, index)
      return policy.hidden
        ? []
        : [
            {
              ...person,
              name: visibleTextLinks(person.name, policy.hiddenFields),
              creditIndex: index,
              profileSlug,
              hiddenFields: policy.hiddenFields,
              links: visibleLinks(
                Object.fromEntries(
                  Object.entries(person.links ?? {}).filter(
                    (entry): entry is [string, string] =>
                      typeof entry[1] === 'string',
                  ),
                ),
                policy.hiddenFields,
              ),
              ...(policy.hiddenFields.includes('photo')
                ? { image: { src: '' } }
                : {}),
              ...(policy.hiddenFields.includes('bio')
                ? { description: '', job: '' }
                : {}),
            },
          ]
    })
    return {
      ...project,
      content: publicBody(project.content, projectFields),
      data: {
        ...project.data,
        title: visibleTextLinks(project.data.title, projectFields),
        description: visibleTextLinks(project.data.description, projectFields),
        hackers,
        links: visibleLinks(
          Object.fromEntries(
            Object.entries(project.data.links ?? {}).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === 'string',
            ),
          ),
          projectFields,
        ),
        youtubeLink: visibleProjectUrl(project.data.youtubeLink, projectFields),
      },
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
    const projectFields =
      context.policies.get(`project:${key}`)?.hiddenFields ?? []
    const hackers = projectHackers(project).flatMap((person, index) => {
      const profileSlug = context.identities.get(`${key}:${index}`)
      const policy = creditPrivacy(context, key, index)
      return policy.hidden
        ? []
        : [
            {
              ...person,
              name: visibleTextLinks(person.name, policy.hiddenFields),
              creditIndex: index,
              profileSlug,
              hiddenFields: policy.hiddenFields,
              linkedinUrl: policy.hiddenFields.includes('linkedin')
                ? null
                : person.linkedinUrl,
            },
          ]
    })
    return {
      ...project,
      ...('name' in project
        ? { name: visibleTextLinks(project.name as string, projectFields) }
        : {}),
      ...('tagline' in project
        ? {
            tagline: visibleTextLinks(project.tagline as string, projectFields),
          }
        : {}),
      ...('jevUsage' in project && typeof project.jevUsage === 'string'
        ? { jevUsage: visibleTextLinks(project.jevUsage, projectFields) }
        : {}),
      ...('url' in project
        ? { url: visibleProjectUrl(project.url as string, projectFields) }
        : {}),
      ...('videoUrl' in project
        ? {
            videoUrl:
              visibleProjectUrl(
                project.videoUrl as string | null,
                projectFields,
              ) || null,
          }
        : {}),
      hackers,
      creatorName: hackers.map((person) => person.name).join(', '),
      linkedinUrl: hackers[0]?.linkedinUrl ?? '',
      creatorCreditsHidden: hackers.length === 0,
    }
  })
}
