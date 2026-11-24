import { projectMutation } from '@/lib/projects/ownership-api'
import { requestProjectClaim } from '@/lib/projects/ownership-store'
import { ProjectAccessError, projectReference } from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  return projectMutation(request, async (user, body) => {
    const reference = projectReference(body.project)
    if (!reference || typeof body.message !== 'string')
      throw new ProjectAccessError('invalid', 422)
    return requestProjectClaim(user, reference.key, body.message)
  })
}
