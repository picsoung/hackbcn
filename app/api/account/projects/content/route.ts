import { projectMutation } from '@/lib/projects/ownership-api'
import { saveProjectEdit, reviewProjectEdit } from '@/lib/projects/edit-store'
import { ProjectAccessError } from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export async function PATCH(request: Request) {
  return projectMutation(
    request,
    async (user, body) => {
      if (typeof body.project !== 'string' || typeof body.revision !== 'number')
        throw new ProjectAccessError('invalid', 422)
      return saveProjectEdit(user, body.project, body.revision, body.content)
    },
    16384,
  )
}
export async function POST(request: Request) {
  return projectMutation(request, async (user, body) => {
    if (
      typeof body.project !== 'string' ||
      typeof body.revision !== 'number' ||
      !['approve', 'reject'].includes(String(body.decision)) ||
      typeof body.note !== 'string'
    )
      throw new ProjectAccessError('invalid', 422)
    return reviewProjectEdit(
      user,
      body.project,
      body.revision,
      body.decision as 'approve' | 'reject',
      body.note,
    )
  })
}
