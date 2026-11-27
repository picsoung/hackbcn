import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { creatorPrivacy, creatorPrivacyHistory } from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { requireOrganiser, organiserCatalog } from './catalog'
import { sourceProject } from '@/lib/projects/ownership-store'
import { projectReference, ProjectAccessError } from '@/lib/projects/ownership'

export async function saveCreatorPrivacy(
  user: IdentityUser,
  subjectKey: string,
  hidden: boolean,
  revision: number,
) {
  requireOrganiser(user)
  if (
    typeof hidden !== 'boolean' ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  )
    throw new ProjectAccessError('invalid', 422)
  if (subjectKey.startsWith('project:')) {
    const reference = projectReference(subjectKey.slice(8))
    if (!reference || subjectKey !== `project:${reference.key}`)
      throw new ProjectAccessError('invalid', 422)
    if (!(await sourceProject(reference.key, 'en')))
      throw new ProjectAccessError('not_found', 404)
  } else if (/^builder:[a-z0-9-]{1,80}$/.test(subjectKey)) {
    if (
      !(await organiserCatalog(user, 'en')).profiles.some(
        (profile) => `builder:${profile.slug}` === subjectKey,
      )
    )
      throw new ProjectAccessError('not_found', 404)
  } else throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    await tx.insert(creatorPrivacy).values({ subjectKey }).onConflictDoNothing()
    const [current] = await tx
      .select()
      .from(creatorPrivacy)
      .where(eq(creatorPrivacy.subjectKey, subjectKey))
      .for('update')
    if (current.revision !== revision)
      throw new ProjectAccessError('conflict', 409)
    const next = revision + 1
    await tx
      .update(creatorPrivacy)
      .set({
        hidden,
        revision: next,
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(creatorPrivacy.subjectKey, subjectKey))
    await tx
      .insert(creatorPrivacyHistory)
      .values({ subjectKey, hidden, revision: next, actorId: user.id })
    return { hidden, revision: next }
  })
}
