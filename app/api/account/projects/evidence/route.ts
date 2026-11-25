import { projectMutation } from '@/lib/projects/ownership-api'
import { importProjectEvidence } from '@/lib/projects/evidence-import'

export const dynamic = 'force-dynamic'
export async function POST(request: Request) {
  return projectMutation(
    request,
    (user, body) => importProjectEvidence(user, body),
    131072,
  )
}
