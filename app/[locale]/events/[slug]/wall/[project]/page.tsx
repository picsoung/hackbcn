import { notFound, permanentRedirect } from 'next/navigation'
import { getLiveEvent } from '@/lib/live/config'
import { projectListPath } from '@/lib/project-seo'

export default function ProjectRedirect({
  params,
}: {
  params: { locale: string; slug: string; project: string }
}) {
  if (!getLiveEvent(params.slug)) notFound()
  permanentRedirect(projectListPath(params.locale, params.slug, params.project))
}
