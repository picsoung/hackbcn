import { getStore } from '@netlify/blobs'
import { getLiveEvent } from '@/lib/live/config'
import { getPublicProject } from '@/lib/live/projects'
import { imageType } from '@/lib/live/media'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { event: string; project: string } },
) {
  if (!getLiveEvent(params.event))
    return new Response('Not found', { status: 404 })
  const project = await getPublicProject(params.event, params.project)
  if (!project?.screenshotKey) return new Response('Not found', { status: 404 })
  const data = await getStore('project-screenshots').get(
    project.screenshotKey,
    { type: 'arrayBuffer' },
  )
  if (!data) return new Response('Not found', { status: 404 })
  const contentType = imageType(new Uint8Array(data))
  if (!contentType) return new Response('Unsupported image', { status: 415 })
  return new Response(data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
