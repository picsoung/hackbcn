import { projectMutation } from '@/lib/projects/ownership-api'
import { saveCreatorPrivacy } from '@/lib/admin/creator-privacy'
import { ProjectAccessError } from '@/lib/projects/ownership'
import { requireOrganiser } from '@/lib/admin/catalog'

export const dynamic = 'force-dynamic'
export async function PATCH(request: Request) {
  return projectMutation(request, async (user, body) => {
    requireOrganiser(user)
    if (
      typeof body.subjectKey !== 'string' ||
      typeof body.hidden !== 'boolean' ||
      typeof body.revision !== 'number'
    )
      throw new ProjectAccessError('invalid', 422)
    return saveCreatorPrivacy(
      user,
      body.subjectKey,
      body.hidden,
      body.revision,
      body.hiddenFields,
    )
  })
}
