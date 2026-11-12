import { notFound } from 'next/navigation'
import LiveEventProjects from '@/app/components/projects/LiveEventProjects'
import StaticEventProjects from '@/app/components/projects/StaticEventProjects'
import { getProjectsByEvent } from '@/app/helpers/projects'
import { getLiveEvent } from '@/lib/live/config'
import { getEventDataBySlug } from '@/lib/events-server'
import {
  projectListPath,
  projectListSchema,
  projectMetadata,
  serializeJsonLd,
} from '@/lib/project-seo'

export const dynamic = 'force-dynamic'
type Props = { params: { locale: string; slug: string } }

export function generateMetadata({ params }: Props) {
  const event =
    getLiveEvent(params.slug) ?? getEventDataBySlug(params.slug)?.event
  if (!event) return {}
  return projectMetadata(
    projectListPath(params.locale, params.slug),
    `Projects from ${event.name}`,
    `Discover the projects built at ${event.name} in Barcelona, meet their builders, and explore their demos.`,
  )
}

export default function EventProjectsPage({ params }: Props) {
  if (getLiveEvent(params.slug)) return <LiveEventProjects params={params} />
  const event = getEventDataBySlug(params.slug)?.event
  if (!event) notFound()
  const projects = getProjectsByEvent(params.slug)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            projectListSchema(
              `Projects from ${event.name}`,
              projectListPath(params.locale, params.slug),
              projects.map((p) => ({
                name: p.data.title,
                path: `/${params.locale}/projects/${p.slug}`,
              })),
            ),
          ),
        }}
      />
      <StaticEventProjects params={params} />
    </>
  )
}
