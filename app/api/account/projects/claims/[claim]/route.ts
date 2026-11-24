import { projectMutation } from '@/lib/projects/ownership-api'
import { reviewProjectClaim } from '@/lib/projects/ownership-store'
import { ProjectAccessError } from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export async function PATCH(
  request: Request,
  { params }: { params: { claim: string } },
) {
  return projectMutation(request, async (user, body) => {
    if (
      !['approve', 'reject', 'revoke'].includes(String(body.decision)) ||
      typeof body.note !== 'string'
    )
      throw new ProjectAccessError('invalid', 422)
    return reviewProjectClaim(
      user,
      params.claim,
      body.decision as 'approve' | 'reject' | 'revoke',
      body.note,
    )
  })
}
