import { getStore } from '@netlify/blobs'
import { getLiveEvent } from '@/lib/live/config'
import {
  getPublicProject,
  getProjectManagementSource,
} from '@/lib/live/projects'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { isProjectOrganiser } from '@/lib/projects/ownership'
import { canManageProjectImage } from '@/lib/media/store'
import { imageType } from '@/lib/live/media'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { event: string; project: string } },
) {
  if (!getLiveEvent(params.event))
    return new Response('Not found', { status: 404 })
  let project = await getPublicProject(params.event, params.project)
  if (!project) {
    const user = await getCurrentIdentity()
    if (
      user &&
      (isProjectOrganiser(user) ||
        (await canManageProjectImage(
          user,
          `submitted:${params.event}:${params.project}`,
        )))
    )
      project = await getProjectManagementSource(params.event, params.project)
  }
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
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
