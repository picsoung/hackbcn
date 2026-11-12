import { notFound, permanentRedirect } from 'next/navigation'
import { getLiveEvent } from '@/lib/live/config'
import { projectListPath } from '@/lib/project-seo'

export default function WallRedirect({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  if (!getLiveEvent(params.slug)) notFound()
  permanentRedirect(projectListPath(params.locale, params.slug))
}
