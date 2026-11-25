import 'server-only'
import { inArray, isNotNull, and } from 'drizzle-orm'
import { getDb } from '@/db'
import { projectContent } from '@/db/schema'
import type { Project } from '@/app/helpers/projects'
import type { PublicProject } from '@/lib/live/projects'
import type { ProjectEditContent } from './edit-content'

export async function approvedProjectContent(keys: string[]) {
  if (!keys.length) return new Map<string, ProjectEditContent>()
  const rows = await getDb()
    .select({
      key: projectContent.projectKey,
      content: projectContent.approvedContent,
    })
    .from(projectContent)
    .where(
      and(
        inArray(projectContent.projectKey, keys),
        isNotNull(projectContent.approvedContent),
      ),
    )
  return new Map(
    rows.filter((row) => row.content).map((row) => [row.key, row.content!]),
  )
}
export function applyArchiveContent(
  project: Project,
  content?: ProjectEditContent,
): Project {
  if (!content) return project
  return {
    ...project,
    data: {
      ...project.data,
      ...(content.image !== undefined
        ? { projectImage: content.image, thumbnailUrl: content.image }
        : {}),
      title: content.name,
      description: content.description,
      youtubeLink: content.video,
      links: { ...project.data.links, website: content.website },
    },
  }
}
export async function applySubmittedContent<
  T extends Pick<
    PublicProject,
    'eventSlug' | 'slug' | 'name' | 'tagline' | 'url' | 'videoUrl'
  >,
>(projects: T[]): Promise<(T & { imageUrl?: string })[]> {
  const approved = await approvedProjectContent(
    projects.map((p) => `submitted:${p.eventSlug}:${p.slug}`),
  )
  return projects.map((p) => {
    const content = approved.get(`submitted:${p.eventSlug}:${p.slug}`)
    return content
      ? {
          ...p,
          ...(content.image !== undefined ? { imageUrl: content.image } : {}),
          name: content.name,
          tagline: content.description,
          url: content.website,
          videoUrl: content.video || null,
        }
      : p
  })
}
