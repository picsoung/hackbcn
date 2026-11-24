import 'server-only'
import { eq, inArray } from 'drizzle-orm'
import { unstable_noStore as noStore } from 'next/cache'
import { getDb } from '@/db'
import { projectVisibility } from '@/db/schema'
import {
  getBuiltProject,
  getBuiltProjects,
  type Project,
} from '@/app/helpers/projects'
import { projectReference } from './ownership'

/** Resolve privacy before any content is passed to a public component. Fail closed on DB errors. */
export async function getPublicArchivedProjects() {
  noStore()
  const sources = getBuiltProjects()
  if (!sources.length) return []
  const overrides = await getDb()
    .select({
      key: projectVisibility.projectKey,
      visibility: projectVisibility.visibility,
    })
    .from(projectVisibility)
    .where(
      inArray(
        projectVisibility.projectKey,
        sources.map((p) => `archive:${p.slug}`),
      ),
    )
  const states = new Map(overrides.map((row) => [row.key, row.visibility]))
  return sources.filter(
    (project) =>
      (states.get(`archive:${project.slug}`) ??
        (project.data.status === 'private' ? 'private' : 'public')) ===
      'public',
  )
}

export async function getPublicArchivedProjectsByEvent(eventSlug: string) {
  return (await getPublicArchivedProjects())
    .filter((project) => project.data.event === eventSlug)
    .sort(
      (a, b) =>
        Number(!a.data.winner) - Number(!b.data.winner) ||
        a.data.title.toLowerCase().localeCompare(b.data.title.toLowerCase()),
    )
}

export async function getPublicArchivedProject(
  slug: string[],
): Promise<Project | null> {
  noStore()
  const reference = projectReference(`archive:${slug.join('/')}`)
  if (!reference || reference.kind !== 'archive') return null
  const source = getBuiltProject(reference.slug)
  if (!source) return null
  const [override] = await getDb()
    .select({ visibility: projectVisibility.visibility })
    .from(projectVisibility)
    .where(eq(projectVisibility.projectKey, reference.key))
    .limit(1)
  return (override?.visibility ??
    (source.data.status === 'private' ? 'private' : 'public')) === 'public'
    ? source
    : null
}
