import { notFound, permanentRedirect } from 'next/navigation'
import { getEventDataBySlug } from '@/lib/events-server'
import { projectListPath } from '@/lib/project-seo'

export default function LegacyEventProjectsRedirect({
  params,
}: {
  params: { locale: string; eventSlug: string }
}) {
  if (!getEventDataBySlug(params.eventSlug)) notFound()
  permanentRedirect(projectListPath(params.locale, params.eventSlug))
}
