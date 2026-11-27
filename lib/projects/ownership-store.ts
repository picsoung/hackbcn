import 'server-only'
import { enqueueReviewNotification } from './review-queue'
import { reviewNotificationSettings, reviewText } from './review-notifications'
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  identityAccounts,
  liveProjects,
  projectClaims,
  projectVisibility,
  projectVisibilityAudit,
  projectClaimEvidence,
  projectContent,
} from '@/db/schema'
import { getBuiltProject } from '@/app/helpers/projects'
import { getEventDataBySlug } from '@/lib/events-server'
import { getLiveEvent } from '@/lib/live/config'
import { getProjectManagementSource } from '@/lib/live/projects'
import { archivedProjectCard, submittedProjectCard } from '@/lib/project-cards'
import type { IdentityUser } from '@/lib/auth/types'
import {
  ProjectAccessError,
  isProjectOrganiser,
  projectReference,
  type ProjectVisibility,
} from './ownership'
import {
  claimEmailHash,
  claimKeyId,
  claimLookupKey,
  claimRosterDigest,
} from './email-proof'
import { assertProjectManager } from './project-access'

function verifiedAccount(user: IdentityUser) {
  if (!user.emailVerified || !user.email)
    throw new ProjectAccessError('forbidden', 403)
}

export async function sourceProject(
  key: string,
  locale: string,
  database: Pick<ReturnType<typeof getDb>, 'select'> = getDb(),
) {
  const reference = projectReference(key)
  if (!reference) return null
  if (reference.kind === 'archive') {
    const source = getBuiltProject(reference.slug)
    if (!source) return null
    const event = source.data.event
      ? getEventDataBySlug(source.data.event)?.event
      : undefined
    return {
      reference,
      card: archivedProjectCard(source, locale, event),
      visibility:
        source.data.status === 'private'
          ? ('private' as const)
          : ('public' as const),
    }
  }
  const source = await getProjectManagementSource(
    reference.event,
    reference.slug,
    database,
  )
  const event =
    getEventDataBySlug(reference.event)?.event ?? getLiveEvent(reference.event)
  return source && event
    ? {
        reference,
        card: submittedProjectCard(source, locale, event),
        visibility: source.visibility,
      }
    : null
}

export async function accountProjects(user: IdentityUser, locale: string) {
  verifiedAccount(user)
  const claims = await getDb()
    .select({
      id: projectClaims.id,
      projectKey: projectClaims.projectKey,
      status: projectClaims.status,
      requestedAt: projectClaims.requestedAt,
      automaticBlocked: projectClaims.automaticBlocked,
    })
    .from(projectClaims)
    .where(eq(projectClaims.accountId, user.id))
    .orderBy(desc(projectClaims.requestedAt))
  const keys = claims
    .filter((claim) => claim.status === 'verified')
    .map((claim) => claim.projectKey)
  const settings = keys.length
    ? await getDb()
        .select()
        .from(projectVisibility)
        .where(inArray(projectVisibility.projectKey, keys))
    : []
  const edits = keys.length
    ? await getDb()
        .select({
          key: projectContent.projectKey,
          approved: projectContent.approvedContent,
          status: projectContent.status,
        })
        .from(projectContent)
        .where(inArray(projectContent.projectKey, keys))
    : []
  const editStates = new Map(edits.map((edit) => [edit.key, edit]))
  const states = new Map(
    settings.map((setting) => [setting.projectKey, setting]),
  )
  const projects = (
    await Promise.all(
      keys.map(async (key) => {
        const source = await sourceProject(key, locale)
        if (!source) return null
        const setting = states.get(key)
        const edit = editStates.get(key)
        return {
          project: edit?.approved
            ? {
                ...source.card,
                name: edit.approved.name,
                description: edit.approved.description,
                image:
                  edit.approved.image !== undefined
                    ? edit.approved.image || undefined
                    : source.card.image,
              }
            : source.card,
          editStatus: edit?.status ?? null,
          visibility:
            source.reference.kind === 'archive'
              ? (setting?.visibility ?? source.visibility)
              : source.visibility,
          revision: setting?.revision ?? 0,
        }
      }),
    )
  ).filter(
    (project): project is NonNullable<typeof project> => project !== null,
  )
  const lookup = claimLookupKey()
  const available = []
  if (lookup && user.email) {
    const proofs = await getDb()
      .select()
      .from(projectClaimEvidence)
      .where(
        and(
          eq(
            projectClaimEvidence.emailHash,
            claimEmailHash(user.email, lookup),
          ),
          eq(projectClaimEvidence.keyId, claimKeyId(lookup)),
          isNull(projectClaimEvidence.disabledAt),
        ),
      )
    const grouped = new Map<string, typeof proofs>()
    for (const proof of proofs)
      grouped.set(proof.projectKey, [
        ...(grouped.get(proof.projectKey) ?? []),
        proof,
      ])
    for (const [key, evidence] of Array.from(grouped)) {
      if (
        evidence.length !== 1 ||
        claims.some(
          (claim) =>
            claim.projectKey === key &&
            (claim.automaticBlocked || claim.status !== 'pending'),
        )
      )
        continue
      const source = await sourceProject(key, locale)
      if (
        source &&
        evidence[0].rosterDigest === claimRosterDigest(source.card.hackers) &&
        evidence[0].creditIndex >= 0 &&
        evidence[0].creditIndex < source.card.hackers.length
      )
        available.push(source.card)
    }
  }
  return {
    projects,
    available,
    claims: claims.map((claim) => ({
      ...claim,
      requestedAt: claim.requestedAt.toISOString(),
    })),
  }
}

export async function requestProjectClaim(
  user: IdentityUser,
  key: string,
  message: string,
) {
  verifiedAccount(user)
  const reference = projectReference(key)
  if (!reference || message.length > 2000)
    throw new ProjectAccessError('invalid', 422)
  // Match by a stable source ID. Never grant rights from a typed name/social link.
  // A valid but unknown reference uses the same review response as a private
  // project. Unrelated accounts cannot use claiming as an existence oracle.
  return getDb().transaction(async (tx) => {
    // Serialize this account's requests to enforce the pending-request cap.
    await tx
      .select({ id: identityAccounts.id })
      .from(identityAccounts)
      .where(eq(identityAccounts.id, user.id))
      .for('update')
    const [existing] = await tx
      .select()
      .from(projectClaims)
      .where(
        and(
          eq(projectClaims.accountId, user.id),
          eq(projectClaims.projectKey, reference.key),
        ),
      )
      .limit(1)
    if (existing?.status === 'verified')
      return { status: 'verified' as const, id: existing.id }
    const lookup = claimLookupKey()
    const evidence =
      lookup &&
      user.email &&
      !existing?.automaticBlocked &&
      (!existing || existing.status === 'pending')
        ? await tx
            .select()
            .from(projectClaimEvidence)
            .where(
              and(
                eq(projectClaimEvidence.projectKey, reference.key),
                eq(
                  projectClaimEvidence.emailHash,
                  claimEmailHash(user.email, lookup),
                ),
                eq(projectClaimEvidence.keyId, claimKeyId(lookup)),
                isNull(projectClaimEvidence.disabledAt),
              ),
            )
            .for('share')
        : []
    const source =
      evidence.length === 1
        ? await sourceProject(reference.key, 'en', tx)
        : null
    const proof =
      source &&
      evidence.length === 1 &&
      evidence[0].rosterDigest === claimRosterDigest(source.card.hackers) &&
      evidence[0].creditIndex >= 0 &&
      evidence[0].creditIndex < source.card.hackers.length
        ? evidence[0]
        : null
    const status = proof ? ('verified' as const) : ('pending' as const)
    const verification = proof
      ? {
          verificationMethod: 'email' as const,
          evidenceId: proof.id,
          reviewedAt: new Date(),
          reviewedBy: null,
          reviewNote:
            'Exact individual submission and registration email; verified account email.',
        }
      : {
          verificationMethod: null,
          evidenceId: null,
          reviewedAt: null,
          reviewedBy: null,
          reviewNote: null,
        }
    const pending = await tx
      .select({ id: projectClaims.id })
      .from(projectClaims)
      .where(
        and(
          eq(projectClaims.accountId, user.id),
          eq(projectClaims.status, 'pending'),
        ),
      )
    if (!proof && pending.length >= 10)
      throw new ProjectAccessError('limit', 429)
    const [claim] = await tx
      .insert(projectClaims)
      .values({
        accountId: user.id,
        projectKey: reference.key,
        message: message.trim(),
        status,
        ...verification,
      })
      .onConflictDoUpdate({
        target: [projectClaims.accountId, projectClaims.projectKey],
        set: {
          message: message.trim(),
          status,
          requestedAt:
            existing?.status === 'pending' ? existing.requestedAt : new Date(),
          ...verification,
        },
        setWhere: inArray(projectClaims.status, [
          'pending',
          'rejected',
          'revoked',
        ]),
      })
      .returning({
        id: projectClaims.id,
        status: projectClaims.status,
        requestedAt: projectClaims.requestedAt,
      })
    if (
      claim?.status === 'pending' &&
      existing?.status !== 'pending' &&
      reviewNotificationSettings().enabled
    ) {
      const requested = await sourceProject(reference.key, 'en', tx)
      await enqueueReviewNotification(tx, {
        key: `claim:${claim.id}:${claim.requestedAt.getTime()}`,
        projectKey: reference.key,
        claimId: claim.id,
        requestedAt: claim.requestedAt,
        alert: {
          kind: 'project_claim',
          project: reviewText(requested?.card.name, 'Requested project'),
          event: reviewText(requested?.card.eventName, 'HackBarna'),
          actor: reviewText(user.name, 'HackBarna member'),
          fields: [],
          path: `/en/account/review?claim=${claim.id}`,
        },
      })
    }
    return claim
      ? { id: claim.id, status: claim.status }
      : { status: 'existing' as const }
  })
}

export async function organiserProjectClaims(
  user: IdentityUser,
  locale: string,
) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
  const rows = await getDb()
    .select({
      id: projectClaims.id,
      projectKey: projectClaims.projectKey,
      status: projectClaims.status,
      message: projectClaims.message,
      email: identityAccounts.email,
      name: identityAccounts.name,
      emailVerified: identityAccounts.emailVerified,
      requestedAt: projectClaims.requestedAt,
    })
    .from(projectClaims)
    .innerJoin(
      identityAccounts,
      eq(projectClaims.accountId, identityAccounts.id),
    )
    .where(inArray(projectClaims.status, ['pending', 'verified']))
    .orderBy(
      asc(sql`case when ${projectClaims.status} = 'pending' then 0 else 1 end`),
      asc(projectClaims.requestedAt),
    )
    .limit(100)
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      requestedAt: row.requestedAt.toISOString(),
      projectName:
        (await sourceProject(row.projectKey, locale))?.card.name ??
        row.projectKey,
    })),
  )
}

export async function reviewProjectClaim(
  user: IdentityUser,
  id: string,
  decision: 'approve' | 'reject' | 'revoke',
  note: string,
) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    note.trim().length < 10 ||
    note.length > 2000
  )
    throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    const [claim] = await tx
      .select({
        claim: projectClaims,
        emailVerified: identityAccounts.emailVerified,
        email: identityAccounts.email,
      })
      .from(projectClaims)
      .innerJoin(
        identityAccounts,
        eq(projectClaims.accountId, identityAccounts.id),
      )
      .where(eq(projectClaims.id, id))
      .for('update', { of: projectClaims })
    if (!claim) throw new ProjectAccessError('not_found', 404)
    if (
      decision === 'approve' &&
      (!claim.emailVerified ||
        !claim.email ||
        !(await sourceProject(claim.claim.projectKey, 'en', tx)))
    )
      throw new ProjectAccessError('forbidden', 403)
    if (claim.claim.status !== (decision === 'revoke' ? 'verified' : 'pending'))
      throw new ProjectAccessError('conflict', 409)
    const status =
      decision === 'approve'
        ? 'verified'
        : decision === 'revoke'
          ? 'revoked'
          : 'rejected'
    await tx
      .update(projectClaims)
      .set({
        status,
        verificationMethod:
          decision === 'approve' ? 'organiser' : claim.claim.verificationMethod,
        automaticBlocked: decision !== 'approve',
        evidenceId: decision === 'approve' ? null : claim.claim.evidenceId,
        reviewedBy: user.id,
        reviewNote: note.trim(),
        reviewedAt: new Date(),
      })
      .where(eq(projectClaims.id, id))
    if (decision === 'revoke' && claim.claim.evidenceId)
      await tx
        .update(projectClaimEvidence)
        .set({ disabledAt: new Date() })
        .where(eq(projectClaimEvidence.id, claim.claim.evidenceId))
    return { status }
  })
}

export async function changeProjectVisibility(
  user: IdentityUser,
  key: string,
  visibility: ProjectVisibility,
  revision: number,
) {
  verifiedAccount(user)
  const reference = projectReference(key)
  if (
    !reference ||
    !['public', 'private'].includes(visibility) ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  )
    throw new ProjectAccessError('invalid', 422)
  return getDb().transaction(async (tx) => {
    await assertProjectManager(tx, user, reference.key)
    const source = await sourceProject(reference.key, 'en', tx)
    if (!source) throw new ProjectAccessError('not_found', 404)
    await tx
      .insert(projectVisibility)
      .values({ projectKey: reference.key, visibility: source.visibility })
      .onConflictDoNothing()
    const [state] = await tx
      .select()
      .from(projectVisibility)
      .where(eq(projectVisibility.projectKey, reference.key))
      .for('update')
    if (state.revision !== revision)
      throw new ProjectAccessError('conflict', 409)
    const [updated] = await tx
      .update(projectVisibility)
      .set({
        visibility,
        revision: sql`${projectVisibility.revision}+1`,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(projectVisibility.projectKey, reference.key))
      .returning({
        visibility: projectVisibility.visibility,
        revision: projectVisibility.revision,
      })
    if (reference.kind === 'submitted')
      await tx
        .update(liveProjects)
        .set({ visibility })
        .where(
          and(
            eq(liveProjects.eventSlug, reference.event),
            eq(liveProjects.slug, reference.slug),
          ),
        )
    await tx.insert(projectVisibilityAudit).values({
      projectKey: reference.key,
      actorId: user.id,
      visibility,
      revision: updated.revision,
    })
    return updated
  })
}
