import 'server-only'
import { enqueueReviewNotification } from './review-queue'
import { reviewNotificationSettings, reviewText } from './review-notifications'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  projectClaims,
  projectContent,
  projectContentHistory,
  projectVisibility,
} from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { assertMediaReference } from '@/lib/media/store'
import { getBuiltProject } from '@/app/helpers/projects'
import { getProjectManagementSource } from '@/lib/live/projects'
import { sourceProject } from './ownership-store'
import {
  ProjectAccessError,
  projectReference,
  isProjectOrganiser,
} from './ownership'
import { validateProjectEdit, type ProjectEditContent } from './edit-content'

function verified(user: IdentityUser) {
  if (!user.emailVerified || !user.email)
    throw new ProjectAccessError('forbidden', 403)
}
async function membership(
  database: Pick<ReturnType<typeof getDb>, 'select'>,
  user: IdentityUser,
  key: string,
) {
  verified(user)
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
async function sourceContent(key: string): Promise<ProjectEditContent | null> {
  const ref = projectReference(key)
  const image = (await sourceProject(key, 'en'))?.card.image ?? ''
  if (!ref) return null
  if (ref.kind === 'archive') {
    const source = getBuiltProject(ref.slug)
    return source
      ? {
          image,
          name: source.data.title,
          description: source.data.description,
          website: source.data.links?.website || '',
          video: source.data.youtubeLink || '',
        }
      : null
  }
  const source = await getProjectManagementSource(ref.event, ref.slug)
  return source
    ? {
        image,
        name: source.name,
        description: source.tagline,
        website: source.url,
        video: source.videoUrl || '',
      }
    : null
}
export async function projectEditor(
  user: IdentityUser,
  key: string,
  locale: string,
) {
  await membership(getDb(), user, key)
  const source = await sourceProject(key, locale),
    content = await sourceContent(key)
  if (!source || !content) throw new ProjectAccessError('not_found', 404)
  const [state] = await getDb()
    .select()
    .from(projectContent)
    .where(eq(projectContent.projectKey, key))
  const [visibility] = await getDb()
    .select()
    .from(projectVisibility)
    .where(eq(projectVisibility.projectKey, key))
  return {
    organiser: isProjectOrganiser(user),
    visibility:
      source.reference.kind === 'submitted'
        ? source.visibility
        : (visibility?.visibility ?? source.visibility),
    visibilityRevision: visibility?.revision ?? 0,
    project: source.card,
    content: {
      ...(state?.currentContent ?? state?.approvedContent ?? content),
      image:
        state?.currentContent?.image ??
        state?.approvedContent?.image ??
        content.image ??
        '',
    },
    revision: state?.revision ?? 0,
    status: state?.status ?? null,
    reviewNote: state?.status === 'rejected' ? state.reviewNote : null,
  }
}
export async function saveProjectEdit(
  user: IdentityUser,
  key: string,
  revision: number,
  input: unknown,
) {
  const ref = projectReference(key),
    content = validateProjectEdit(input)
  if (!ref || !Number.isSafeInteger(revision) || revision < 0)
    throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    await membership(tx, user, ref.key)
    await assertMediaReference(content.image, user.id, 'project', ref.key, tx)
    const source = await sourceProject(ref.key, 'en', tx)
    if (!source) throw new ProjectAccessError('not_found', 404)
    await tx
      .insert(projectContent)
      .values({ projectKey: ref.key })
      .onConflictDoNothing()
    const [state] = await tx
      .select()
      .from(projectContent)
      .where(eq(projectContent.projectKey, ref.key))
      .for('update')
    if (state.revision !== revision)
      throw new ProjectAccessError('conflict', 409)
    const next = revision + 1
    const status = isProjectOrganiser(user)
      ? ('approved' as const)
      : ('pending' as const)
    const [updated] = await tx
      .update(projectContent)
      .set({
        currentContent: content,
        status,
        ...(status === 'approved' ? { approvedContent: content } : {}),
        revision: next,
        updatedBy: user.id,
        updatedAt: new Date(),
        reviewNote: null,
      })
      .where(
        and(
          eq(projectContent.projectKey, ref.key),
          eq(projectContent.revision, revision),
        ),
      )
      .returning({ revision: projectContent.revision })
    if (!updated) throw new ProjectAccessError('conflict', 409)
    await tx.insert(projectContentHistory).values({
      projectKey: ref.key,
      revision: next,
      content,
      status,
      actorId: user.id,
    })
    if (status === 'pending' && reviewNotificationSettings().enabled) {
      const baseline = state.approvedContent ?? (await sourceContent(ref.key))
      const labels = {
        name: 'Name',
        description: 'Description',
        website: 'Website',
        video: 'Demo video',
        image: 'Picture',
      }
      const fields = (Object.keys(labels) as (keyof typeof labels)[])
        .filter(
          (key) =>
            content[key] !== undefined &&
            (content[key] ?? '').trim() !== (baseline?.[key] ?? '').trim(),
        )
        .map((key) => labels[key])
      await enqueueReviewNotification(tx, {
        key: `edit:${ref.key}:${next}`,
        projectKey: ref.key,
        revision: next,
        alert: {
          kind: 'project_edit',
          project: reviewText(content.name, 'Project'),
          event: reviewText(source.card.eventName, 'HackBarna'),
          actor: reviewText(user.name, 'HackBarna member'),
          fields: fields.length ? fields : ['Project details'],
          path: `/en/account/review?project=${encodeURIComponent(ref.key)}`,
        },
      })
    }
    return { revision: next, status }
  })
}
export async function projectEditsForReview(
  user: IdentityUser,
  locale: string,
) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
  const rows = await getDb()
    .select()
    .from(projectContent)
    .where(eq(projectContent.status, 'pending'))
    .orderBy(desc(projectContent.updatedAt))
    .limit(100)
  return (
    await Promise.all(
      rows.map(async (row) => {
        const source = await sourceProject(row.projectKey, locale),
          original = await sourceContent(row.projectKey)
        if (!source || !original || !row.currentContent) return null
        return {
          key: row.projectKey,
          name: source.card.name,
          eventName: source.card.eventName,
          revision: row.revision,
          current: {
            ...(row.approvedContent ?? original),
            image: row.approvedContent?.image ?? original.image ?? '',
          },
          proposed: {
            ...row.currentContent,
            image:
              row.currentContent.image ??
              row.approvedContent?.image ??
              original.image ??
              '',
          },
        }
      }),
    )
  ).filter((row): row is NonNullable<typeof row> => !!row)
}
export async function reviewProjectEdit(
  user: IdentityUser,
  key: string,
  revision: number,
  decision: 'approve' | 'reject',
  note: string,
) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
  if (
    !projectReference(key) ||
    !Number.isSafeInteger(revision) ||
    revision < 0 ||
    !['approve', 'reject'].includes(decision) ||
    typeof note !== 'string' ||
    (decision === 'reject' && note.trim().length < 10) ||
    note.length > 2000
  )
    throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    const [state] = await tx
      .select()
      .from(projectContent)
      .where(eq(projectContent.projectKey, key))
      .for('update')
    if (
      !state ||
      state.revision !== revision ||
      state.status !== 'pending' ||
      !state.currentContent
    )
      throw new ProjectAccessError('conflict', 409)
    if (!(await sourceProject(key, 'en', tx)))
      throw new ProjectAccessError('not_found', 404)
    const next = revision + 1,
      status =
        decision === 'approve' ? ('approved' as const) : ('rejected' as const)
    const [updated] = await tx
      .update(projectContent)
      .set({
        revision: next,
        status,
        ...(decision === 'approve'
          ? { approvedContent: state.currentContent }
          : {}),
        reviewNote: note.trim(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectContent.projectKey, key),
          eq(projectContent.revision, revision),
          eq(projectContent.status, 'pending'),
        ),
      )
      .returning({ revision: projectContent.revision })
    if (!updated) throw new ProjectAccessError('conflict', 409)
    await tx.insert(projectContentHistory).values({
      projectKey: key,
      revision: next,
      status,
      content: state.currentContent,
      actorId: user.id,
      note: note.trim(),
    })
    // Approval changes content only. It must never restore a hidden project.
    return { revision: next, status }
  })
}
