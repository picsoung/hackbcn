import { notFound, permanentRedirect } from 'next/navigation'
import { getEventDataBySlug } from '@/lib/events-server'
import { projectListPath } from '@/lib/project-seo'

export default function EventProjectsRedirect({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  if (!getEventDataBySlug(params.slug)) notFound()
  permanentRedirect(projectListPath(params.locale, params.slug))
}
