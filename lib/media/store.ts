import 'server-only'
import { getStore } from '@netlify/blobs'
import { and, eq, gt, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  communityProfiles,
  identityAccounts,
  mediaAssets,
  projectClaims,
  projectContent,
  projectContentHistory,
  projectVisibility,
  builderProfiles,
  builderProfileHistory,
} from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { getBuiltProject } from '@/app/helpers/projects'
import { getPublicProject } from '@/lib/live/projects'
import {
  isProjectOrganiser,
  projectReference,
  ProjectAccessError,
} from '@/lib/projects/ownership'
import { managedImageId, ImageUploadError } from './shared'
import { getBuilderCatalog } from '@/lib/builder-catalog'

export const mediaStore = () =>
  getStore({ name: 'community-media', consistency: 'strong' })
export function mediaUrl(id: string) {
  return new URL(
    `/api/media/${id}`,
    getIdentityConfig()?.redirectUri ?? 'https://www.hackbarna.com',
  ).href
}
export async function canManageProjectImage(
  user: IdentityUser,
  key: string,
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
) {
  if (!user.emailVerified || !user.email || !projectReference(key)) return false
  if (isProjectOrganiser(user)) return true
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
  return !!claim
}
export async function reserveMedia(
  user: IdentityUser,
  purpose: 'avatar' | 'project',
  projectKey: string | null,
) {
  if (
    !user.emailVerified ||
    !user.email ||
    (purpose === 'project' &&
      (!projectKey || !(await canManageProjectImage(user, projectKey))))
  )
    throw new ProjectAccessError('forbidden', 403)
  return getDb().transaction(async (tx) => {
    const [owner] = await tx
      .select({ id: identityAccounts.id })
      .from(identityAccounts)
      .where(eq(identityAccounts.id, user.id))
      .for('update')
    if (!owner) throw new ProjectAccessError('forbidden', 403)
    const [usage] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.ownerId, user.id),
          gt(mediaAssets.createdAt, new Date(Date.now() - 3600000)),
        ),
      )
    if (usage.count >= 20) throw new ImageUploadError('limit', 429)
    const [asset] = await tx
      .insert(mediaAssets)
      .values({ ownerId: user.id, purpose, projectKey })
      .returning()
    return asset
  })
}
/** Managed references must belong to this profile or the same verified project team. */
export async function assertMediaReference(
  url: string | undefined,
  ownerId: string,
  purpose: 'avatar' | 'project',
  projectKey?: string,
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
) {
  if (!url) return
  const id = managedImageId(url)
  if (!id) {
    try {
      if (new URL(url, mediaUrl('')).pathname.startsWith('/api/media/'))
        throw new ProjectAccessError('invalid', 422)
    } catch (error) {
      if (error instanceof ProjectAccessError) throw error
    }
    return
  }
  const parsed = new URL(url, mediaUrl(id))
  const allowed = new Set([
    new URL(mediaUrl(id)).origin,
    'https://www.hackbarna.com',
    'https://hackbarna.com',
  ])
  if (!allowed.has(parsed.origin)) throw new ProjectAccessError('invalid', 422)
  const [asset] = await database
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .for('share')
  if (
    !asset?.ready ||
    asset.purpose !== purpose ||
    (purpose === 'avatar'
      ? asset.ownerId !== ownerId
      : asset.projectKey !== projectKey)
  )
    throw new ProjectAccessError('invalid', 422)
}
export async function publicMedia(asset: typeof mediaAssets.$inferSelect) {
  if (!asset.ready) return false
  if (asset.purpose === 'avatar') {
    const profiles = await getDb()
      .select({ url: communityProfiles.avatarUrl })
      .from(communityProfiles)
      .where(
        sql`${communityProfiles.avatarUrl} LIKE ${'%/api/media/' + asset.id}`,
      )
    if (profiles.some((profile) => managedImageId(profile.url) === asset.id))
      return true
    const builders = await getDb()
      .select({ slug: builderProfiles.slug, content: builderProfiles.content })
      .from(builderProfiles)
      .where(
        sql`${builderProfiles.content}->>'avatarUrl' LIKE ${'%/api/media/' + asset.id}`,
      )
    if (!builders.length) return false
    const catalog = await getBuilderCatalog('en')
    return builders.some((row) =>
      catalog.profiles.some(
        (profile) =>
          profile.slug === row.slug &&
          managedImageId(profile.image ?? '') === asset.id,
      ),
    )
  }
  if (!asset.projectKey) return false
  const [state] = await getDb()
    .select({ content: projectContent.approvedContent })
    .from(projectContent)
    .where(eq(projectContent.projectKey, asset.projectKey))
  if (
    !state?.content?.image ||
    managedImageId(state.content.image) !== asset.id
  )
    return false
  const reference = projectReference(asset.projectKey)
  if (!reference) return false
  if (reference.kind === 'submitted')
    return !!(await getPublicProject(reference.event, reference.slug))
  const source = getBuiltProject(reference.slug)
  if (!source) return false
  const [setting] = await getDb()
    .select({ visibility: projectVisibility.visibility })
    .from(projectVisibility)
    .where(eq(projectVisibility.projectKey, reference.key))
  return (
    (setting?.visibility ??
      (source.data.status === 'private' ? 'private' : 'public')) === 'public'
  )
}
export async function canReadMedia(
  asset: typeof mediaAssets.$inferSelect,
  user: IdentityUser | null,
) {
  if (!asset.ready) return false
  if (await publicMedia(asset)) return true
  if (!user?.emailVerified || !user.email) return false
  if (asset.purpose === 'avatar')
    return asset.ownerId === user.id || isProjectOrganiser(user)
  return (
    !!asset.projectKey &&
    (isProjectOrganiser(user) ||
      (await canManageProjectImage(user, asset.projectKey)))
  )
}

/** Discard only unattached uploads. Shared/approved/history references are preserved. */
export async function discardMedia(user: IdentityUser, id: string) {
  if (!user.emailVerified || !user.email)
    throw new ProjectAccessError('forbidden', 403)
  return getDb().transaction(async (tx) => {
    const [asset] = await tx
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .for('update')
    if (!asset || asset.ownerId !== user.id)
      throw new ProjectAccessError('not_found', 404)
    const profiles = await tx
      .select({ image: communityProfiles.avatarUrl })
      .from(communityProfiles)
      .where(sql`${communityProfiles.avatarUrl} LIKE ${'%/api/media/' + id}`)
    const overrides = await tx
      .select({ content: builderProfiles.content })
      .from(builderProfiles)
      .where(
        sql`${builderProfiles.content}->>'avatarUrl' LIKE ${'%/api/media/' + id}`,
      )
    const profileHistory = await tx
      .select({
        content: builderProfileHistory.content,
        previous: builderProfileHistory.previousContent,
      })
      .from(builderProfileHistory)
      .where(
        sql`${builderProfileHistory.content}->>'avatarUrl' LIKE ${'%/api/media/' + id} OR ${builderProfileHistory.previousContent}->>'avatarUrl' LIKE ${'%/api/media/' + id}`,
      )
    let referenced =
      profiles.some((profile) => managedImageId(profile.image) === id) ||
      overrides.some(
        (row) => managedImageId(row.content?.avatarUrl ?? '') === id,
      ) ||
      profileHistory.some((row) =>
        [row.content.avatarUrl, row.previous.avatarUrl].some(
          (url) => managedImageId(url) === id,
        ),
      )
    if (asset.projectKey) {
      const [state] = await tx
        .select()
        .from(projectContent)
        .where(eq(projectContent.projectKey, asset.projectKey))
      const history = await tx
        .select({
          image: sql<string>`${projectContentHistory.content}->>'image'`,
        })
        .from(projectContentHistory)
        .where(eq(projectContentHistory.projectKey, asset.projectKey))
      referenced ||= [
        state?.currentContent?.image,
        state?.approvedContent?.image,
        ...history.map((row) => row.image),
      ].some((image) => !!image && managedImageId(image) === id)
    }
    if (referenced) throw new ProjectAccessError('conflict', 409)
    await mediaStore().delete(`${id}.webp`)
    // Retain the reservation so discard/re-upload cannot bypass the hourly limit.
    await tx
      .update(mediaAssets)
      .set({ ready: false })
      .where(eq(mediaAssets.id, id))
  })
}
