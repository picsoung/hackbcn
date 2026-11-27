import 'server-only'
import { createHash } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  builderProfiles,
  builderProfileHistory,
  communityProfiles,
} from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { builderAccountId } from '@/lib/community/claimed-display'
import { claimedBuilderDisplays } from '@/lib/community/claimed-profiles'
import {
  validateCommunityProfile,
  ProfileValidationError,
} from '@/lib/community/profile'
import { assertMediaReference } from '@/lib/media/store'
import { ProjectAccessError } from '@/lib/projects/ownership'
import { organiserCatalog, requireOrganiser } from './catalog'

function version(accountId: string | null, revision: number) {
  return createHash('sha256')
    .update(`${accountId ?? 'historical'}:${revision}`)
    .digest('hex')
}

export async function organiserBuilderEditor(
  user: IdentityUser,
  slug: string,
  locale: string,
) {
  requireOrganiser(user)
  if (!/^[a-z0-9-]{1,80}$/.test(slug))
    throw new ProjectAccessError('invalid', 422)
  const catalog = await organiserCatalog(user, locale)
  const builder = catalog.profiles.find((profile) => profile.slug === slug)
  if (!builder) throw new ProjectAccessError('not_found', 404)
  const bindings = await claimedBuilderDisplays(builder.projectKeys)
  const accountId = builderAccountId(
    builder,
    new Map(
      catalog.projects.map(({ project }) => [project.key, project.hackers]),
    ),
    bindings,
  )
  const [row] = accountId
    ? await getDb()
        .select()
        .from(communityProfiles)
        .where(eq(communityProfiles.accountId, accountId))
    : await getDb()
        .select()
        .from(builderProfiles)
        .where(eq(builderProfiles.slug, slug))
  const revision = row?.revision ?? 0
  return {
    builder,
    projects: catalog.projects.filter(({ project }) =>
      builder.projectKeys.includes(project.key),
    ),
    profile: {
      displayName: builder.name,
      avatarUrl: builder.image?.startsWith('/')
        ? `https://www.hackbarna.com${builder.image}`
        : (builder.image ?? ''),
      bio: builder.bio ?? '',
      linkedinUrl: builder.links.linkedin ?? '',
      githubUrl: builder.links.github ?? '',
      revision,
    },
    version: version(accountId, revision),
  }
}

export async function saveOrganiserBuilder(
  user: IdentityUser,
  slug: string,
  expectedVersion: string,
  input: unknown,
) {
  requireOrganiser(user)
  let profile
  try {
    profile = validateCommunityProfile(input)
  } catch (error) {
    if (error instanceof ProfileValidationError)
      throw new ProjectAccessError('invalid', 422)
    throw error
  }
  const current = await organiserBuilderEditor(user, slug, 'en')
  if (
    expectedVersion !== current.version ||
    profile.revision !== current.profile.revision
  )
    throw new ProjectAccessError('conflict', 409)
  return getDb().transaction(async (tx) => {
    // Serialise edits of an unclaimed profile and claim transitions without changing its source identity.
    await tx.insert(builderProfiles).values({ slug }).onConflictDoNothing()
    const [historical] = await tx
      .select()
      .from(builderProfiles)
      .where(eq(builderProfiles.slug, slug))
      .for('update')
    const bindings = await claimedBuilderDisplays(
      current.builder.projectKeys,
      tx,
    )
    const accountId = builderAccountId(
      current.builder,
      new Map(
        current.projects.map(({ project }) => [project.key, project.hackers]),
      ),
      bindings,
    )
    const [claimed] = accountId
      ? await tx
          .select()
          .from(communityProfiles)
          .where(eq(communityProfiles.accountId, accountId))
          .for('update')
      : []
    const revision = claimed?.revision ?? historical.revision
    if (version(accountId, revision) !== expectedVersion)
      throw new ProjectAccessError('conflict', 409)
    // A retained avatar may belong to the member; replacement uploads belong to the organiser.
    if (profile.avatarUrl !== current.profile.avatarUrl)
      await assertMediaReference(
        profile.avatarUrl,
        user.id,
        'avatar',
        undefined,
        tx,
      )
    const { revision: ignored, ...content } = profile
    const next = revision + 1
    if (accountId) {
      if (!claimed) throw new ProjectAccessError('conflict', 409)
      await tx
        .update(communityProfiles)
        .set({ ...content, revision: next, updatedAt: new Date() })
        .where(
          and(
            eq(communityProfiles.accountId, accountId),
            eq(communityProfiles.revision, revision),
          ),
        )
    } else {
      await tx
        .update(builderProfiles)
        .set({ content, revision: next, updatedAt: new Date() })
        .where(eq(builderProfiles.slug, slug))
    }
    const { revision: previousRevision, ...previousContent } = current.profile
    await tx.insert(builderProfileHistory).values({
      slug,
      accountId,
      content,
      previousContent,
      revision: next,
      actorId: user.id,
    })
    return {
      profile: { ...content, revision: next },
      version: version(accountId, next),
    }
  })
}
