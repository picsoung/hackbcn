import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { creatorPrivacy, creatorPrivacyHistory } from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { builderAccountId } from '@/lib/community/claimed-display'
import { verifiedBuilderBindings } from '@/lib/community/claimed-profiles'
import { sourceProject } from './ownership-store'
import { isProjectOrganiser, ProjectAccessError } from './ownership'
import { assertProjectManager } from './project-access'
import { creatorPrivacyContext } from './creator-privacy'
import {
  PRIVACY_FIELDS,
  privacySetting,
  privacySubject,
  type PrivacyField,
} from './privacy-model'

async function authorize(
  user: IdentityUser,
  key: string,
  database: Pick<ReturnType<typeof getDb>, 'select'>,
) {
  if (!user.emailVerified || !user.email)
    throw new ProjectAccessError('forbidden', 403)
  const subject = privacySubject(key)
  if (!subject) throw new ProjectAccessError('invalid', 422)
  if (subject.kind !== 'builder') {
    await assertProjectManager(database, user, subject.projectKey)
    if (!(await sourceProject(subject.projectKey, 'en', database)))
      throw new ProjectAccessError('not_found', 404)
    if (subject.kind === 'credit') {
      const context = await creatorPrivacyContext(database)
      if (
        !context.profiles.some(
          (profile) =>
            profile.slug === subject.slug &&
            profile.projectKeys.includes(subject.projectKey),
        )
      )
        throw new ProjectAccessError('not_found', 404)
    }
  } else {
    const context = await creatorPrivacyContext(database)
    const profile = context.profiles.find(
      (profile) => profile.slug === subject.slug,
    )
    if (!profile) throw new ProjectAccessError('not_found', 404)
    if (!isProjectOrganiser(user)) {
      const bindings = await verifiedBuilderBindings(
        profile.projectKeys,
        database,
        true,
      )
      if (builderAccountId(profile, context.rosters, bindings) !== user.id)
        throw new ProjectAccessError('forbidden', 403)
    }
  }
}
export async function saveCreatorPrivacy(
  user: IdentityUser,
  subjectKey: string,
  hidden: boolean,
  revision: number,
  inputFields?: unknown,
) {
  if (
    typeof hidden !== 'boolean' ||
    !Number.isSafeInteger(revision) ||
    revision < 0 ||
    (inputFields !== undefined &&
      (!Array.isArray(inputFields) ||
        inputFields.length > PRIVACY_FIELDS.length ||
        inputFields.some((field) => !PRIVACY_FIELDS.includes(field))))
  )
    throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    await authorize(user, subjectKey, tx)
    await tx.insert(creatorPrivacy).values({ subjectKey }).onConflictDoNothing()
    const [current] = await tx
      .select()
      .from(creatorPrivacy)
      .where(eq(creatorPrivacy.subjectKey, subjectKey))
      .for('update')
    if (current.revision !== revision)
      throw new ProjectAccessError('conflict', 409)
    const hiddenFields =
      inputFields === undefined
        ? current.hiddenFields
        : PRIVACY_FIELDS.filter((field) =>
            (inputFields as PrivacyField[]).includes(field),
          )
    const next = revision + 1
    await tx
      .update(creatorPrivacy)
      .set({
        hidden,
        hiddenFields,
        revision: next,
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(creatorPrivacy.subjectKey, subjectKey))
    await tx.insert(creatorPrivacyHistory).values({
      subjectKey,
      hidden,
      hiddenFields,
      revision: next,
      actorId: user.id,
    })
    return { hidden, hiddenFields, revision: next }
  })
}
export async function projectPrivacyOptions(user: IdentityUser, key: string) {
  await assertProjectManager(getDb(), user, key)
  const context = await creatorPrivacyContext()
  const source = await sourceProject(key, 'en')
  if (!source) throw new ProjectAccessError('not_found', 404)
  const credits = Array.from(
    new Map(
      source.card.hackers.flatMap((person, index) => {
        const slug = context.managementIdentities.get(`${key}:${index}`)
        return slug
          ? [
              [
                slug,
                {
                  name: person.name,
                  setting: privacySetting(
                    `credit:${key}:${slug}`,
                    context.policies.get(`credit:${key}:${slug}`),
                  ),
                },
              ] as const,
            ]
          : []
      }),
    ).values(),
  )
  return {
    project: privacySetting(
      `project:${key}`,
      context.policies.get(`project:${key}`),
    ),
    credits,
  }
}
export async function accountPrivacyOptions(user: IdentityUser) {
  if (!user.emailVerified || !user.email) return []
  const context = await creatorPrivacyContext()
  const bindings = await verifiedBuilderBindings(
    Array.from(context.rosters.keys()),
  )
  return context.profiles
    .filter(
      (profile) =>
        builderAccountId(profile, context.rosters, bindings) === user.id,
    )
    .map((profile) => ({
      name: profile.name,
      setting: privacySetting(
        `builder:${profile.slug}`,
        context.policies.get(`builder:${profile.slug}`),
      ),
    }))
}
