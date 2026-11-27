import { notFound } from 'next/navigation'
import ProjectPageShell from '@/app/components/projects/ProjectPageShell'
import ProjectDetail from '@/app/components/projects/ProjectDetail'
import { submittedProjectCard } from '@/lib/project-cards'
import { getProjectPageContext } from '@/lib/builder-catalog'
import { getEventDataBySlug } from '@/lib/events-server'
import {
  projectBuilder,
  projectLinks,
  projectVideo,
} from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import { getLiveEvent } from '@/lib/live/config'
import { getPublicProject } from '@/lib/live/projects'
import { projectHackers } from '@/lib/live/validate'
import { projectListPath, projectMetadata } from '@/lib/project-seo'

export const dynamic = 'force-dynamic'

type Params = {
  params: { locale: string; slug: string; project: string }
  searchParams: { new?: string }
}

export async function generateMetadata({ params }: Params) {
  const event = getLiveEvent(params.slug)
  const project = event && (await getPublicProject(event.slug, params.project))
  if (!event || !project) return {}
  const makers = projectHackers(project)
    .map((hacker) => hacker.name)
    .join(', ')
  const description = `${project.tagline}${makers ? ` Built by ${makers}` : ''} at ${event.name}.`
  return projectMetadata(
    projectListPath(params.locale, event.slug, project.slug),
    `${project.name} · ${event.name}`,
    description,
  )
}

export default async function ProjectPage({ params, searchParams }: Params) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  const project = await getPublicProject(event.slug, params.project)
  if (!project) notFound()
  const current = submittedProjectCard(
    project,
    params.locale,
    getEventDataBySlug(event.slug)?.event ?? event,
  )
  const { related, builders } = await getProjectPageContext(
    current,
    projectHackers(project).map(projectBuilder),
    params.locale,
  )
  const copy = projectPageCopy(params.locale)
  const screenshot =
    project.imageUrl !== undefined
      ? project.imageUrl || undefined
      : project.screenshotKey
        ? `/api/live/${event.slug}/projects/${project.slug}/screenshot?v=${encodeURIComponent(project.screenshotKey)}`
        : undefined
  const video = projectVideo(project.videoUrl, screenshot)
  const media =
    video ??
    (screenshot ? { type: 'image' as const, src: screenshot } : undefined)
  const links = projectLinks([
    ['website', project.url],
    ['video', project.videoUrl],
    ['screenshot', video ? screenshot : undefined],
  ])
  return (
    <ProjectPageShell>
      <ProjectDetail
        project={current}
        builders={builders}
        links={links}
        media={media}
        related={related}
        locale={params.locale}
        publishedDate={project.createdAt}
        published={event.open && searchParams.new === '1'}
      >
        {project.jevUsage ? (
          <>
            <h3>{copy.jevUsage}</h3>
            <p className="whitespace-pre-wrap">{project.jevUsage}</p>
          </>
        ) : undefined}
      </ProjectDetail>
    </ProjectPageShell>
  )
}
