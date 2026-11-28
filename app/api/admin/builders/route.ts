import { projectMutation } from '@/lib/projects/ownership-api'
import { saveOrganiserBuilder } from '@/lib/admin/profiles'
import { ProjectAccessError } from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export async function PATCH(request: Request) {
  return projectMutation(
    request,
    async (user, body) => {
      if (typeof body.builder !== 'string' || typeof body.version !== 'string')
        throw new ProjectAccessError('invalid', 422)
      return saveOrganiserBuilder(
        user,
        body.builder,
        body.version,
        body.profile,
      )
    },
    16384,
  )
}
