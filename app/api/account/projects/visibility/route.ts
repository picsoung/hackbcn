import { projectMutation } from '@/lib/projects/ownership-api'
import { changeProjectVisibility } from '@/lib/projects/ownership-store'
import { ProjectAccessError } from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export async function PATCH(request: Request) {
  return projectMutation(request, async (user, body) => {
    if (
      typeof body.project !== 'string' ||
      (body.visibility !== 'public' && body.visibility !== 'private') ||
      !Number.isSafeInteger(body.revision)
    )
      throw new ProjectAccessError('invalid', 422)
    return changeProjectVisibility(
      user,
      body.project,
      body.visibility,
      body.revision as number,
    )
  })
}
