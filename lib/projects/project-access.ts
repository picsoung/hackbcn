import 'server-only'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { projectClaims } from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { isProjectOrganiser, ProjectAccessError } from './ownership'

export async function assertProjectManager(
  database: Pick<ReturnType<typeof getDb>, 'select'>,
  user: IdentityUser,
  key: string,
) {
  if (!user.emailVerified || !user.email)
    throw new ProjectAccessError('forbidden', 403)
  if (isProjectOrganiser(user)) return
  const [claim] = await database
    .select({ id: projectClaims.id })
    .from(projectClaims)
    .where(
      and(
        eq(projectClaims.projectKey, key),
        eq(projectClaims.accountId, user.id),
        eq(projectClaims.status, 'verified'),
      ),
    )
    .for('share')
  if (!claim) throw new ProjectAccessError('forbidden', 403)
}
