import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import ReactMarkdown from 'react-markdown'
import { getPublicArchivedProject } from '@/lib/projects/archive-visibility'
import { archivedProjectCard } from '@/lib/project-cards'
import {
  archivedProjectContent,
  projectBuilder,
  projectLinks,
} from '@/lib/project-detail'
import { getProjectPageContext } from '@/lib/builder-catalog'
import { getEventDataBySlug } from '@/lib/events-server'
import { projectMetadata } from '@/lib/project-seo'
import { projectPageCopy } from '@/data/project-page'
import ProjectDetail from '@/app/components/projects/ProjectDetail'
import ProjectVideo, {
  type ProjectVideoProps,
} from '@/app/components/projects/ProjectVideo'

type Params = { params: { slug: string[]; locale: string } }

export async function generateMetadata({ params }: Params) {
  const project = await getPublicArchivedProject(params.slug)
  if (!project) return {}
  return projectMetadata(
    `/${params.locale}/projects/${params.slug.map(encodeURIComponent).join('/')}`,
    project.data.title,
    project.data.description,
  )
}

export const dynamic = 'force-dynamic'

export default async function ProjectBySlug({ params }: Params) {
  const project = await getPublicArchivedProject(params.slug)
  if (!project) notFound()
  const { data } = project
  const copy = projectPageCopy(params.locale)
  const event = data.event ? getEventDataBySlug(data.event)?.event : undefined
  const current = archivedProjectCard(project, params.locale, event)
  const { related, builders } = await getProjectPageContext(
    current,
    (data.hackers ?? []).map(projectBuilder),
    params.locale,
  )
  const { content, media } = archivedProjectContent(project)
  const links = projectLinks([
    ...Object.entries(data.links ?? {}),
    ['video', data.youtubeLink],
  ])
  return (
    <ProjectDetail
      project={current}
      builders={builders}
      links={links}
      media={media}
      related={related}
      locale={params.locale}
      publishedDate={data.publishedDate}
      modifiedDate={data.modifiedDate}
    >
      {content.trim() ? (
        data.contentFormat === 'markdown' ? (
          <ReactMarkdown skipHtml>{content}</ReactMarkdown>
        ) : (
          <MDXRemote
            source={content}
            components={{
              YouTube: (
                props: Omit<ProjectVideoProps, 'announce' | 'title'> & {
                  title?: string
                },
              ) => (
                <div className="my-8">
                  <ProjectVideo
                    {...props}
                    title={props.title || data.title}
                    announce={copy.watchDemo}
                  />
                </div>
              ),
            }}
          />
        )
      ) : undefined}
    </ProjectDetail>
  )
}
