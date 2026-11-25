import 'server-only'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { projectClaimEvidence, projectClaims } from '@/db/schema'
import type { IdentityUser } from '@/lib/auth/types'
import { sourceProject } from './ownership-store'
import { claimKeyId, claimLookupKey, claimRosterDigest } from './email-proof'
import {
  isProjectOrganiser,
  ProjectAccessError,
  projectReference,
} from './ownership'

type Proof = {
  projectKey: string
  creditIndex: number
  emailHash: string
  rosterDigest: string
  sourceDigest: string
}
const digest = /^[a-f0-9]{64}$/

export async function importProjectEvidence(
  user: IdentityUser,
  input: Record<string, unknown>,
) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
  const key = claimLookupKey()
  if (!key || input.keyId !== claimKeyId(key))
    throw new ProjectAccessError('invalid', 422)
  if (
    input.version !== 1 ||
    Object.keys(input).some(
      (name) => !['version', 'keyId', 'projectKeys', 'evidence'].includes(name),
    ) ||
    !Array.isArray(input.projectKeys) ||
    !input.projectKeys.length ||
    input.projectKeys.length > 250 ||
    !Array.isArray(input.evidence) ||
    input.evidence.length > 1000
  )
    throw new ProjectAccessError('invalid', 422)
  const keys = input.projectKeys.map((value) => projectReference(value)?.key)
  if (keys.some((value) => !value) || new Set(keys).size !== keys.length)
    throw new ProjectAccessError('invalid', 422)
  const projectKeys = keys as string[]
  const sources = new Map(
    await Promise.all(
      projectKeys.map(
        async (key) => [key, await sourceProject(key, 'en')] as const,
      ),
    ),
  )
  if (Array.from(sources.values()).some((source) => !source))
    throw new ProjectAccessError('invalid', 422)
  const creditIds = new Set<string>(),
    emails = new Set<string>(),
    proofs: Proof[] = []
  for (const value of input.evidence) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new ProjectAccessError('invalid', 422)
    const row = value as Record<string, unknown>
    if (
      Object.keys(row).some(
        (name) =>
          ![
            'projectKey',
            'creditIndex',
            'emailHash',
            'rosterDigest',
            'sourceDigest',
          ].includes(name),
      )
    )
      throw new ProjectAccessError('invalid', 422)
    const source =
      typeof row.projectKey === 'string' ? sources.get(row.projectKey) : null
    if (
      !source ||
      !Number.isSafeInteger(row.creditIndex) ||
      (row.creditIndex as number) < 0 ||
      (row.creditIndex as number) >= source.card.hackers.length ||
      typeof row.emailHash !== 'string' ||
      !digest.test(row.emailHash) ||
      typeof row.sourceDigest !== 'string' ||
      !digest.test(row.sourceDigest) ||
      row.rosterDigest !== claimRosterDigest(source.card.hackers)
    )
      throw new ProjectAccessError('invalid', 422)
    const credit = `${row.projectKey}:${row.creditIndex}`,
      email = `${row.projectKey}:${row.emailHash}`
    if (creditIds.has(credit) || emails.has(email))
      throw new ProjectAccessError('invalid', 422)
    creditIds.add(credit)
    emails.add(email)
    proofs.push({
      projectKey: row.projectKey as string,
      creditIndex: row.creditIndex as number,
      emailHash: row.emailHash,
      rosterDigest: row.rosterDigest as string,
      sourceDigest: row.sourceDigest,
    })
  }
  await getDb().transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('hackbarna-project-evidence-import-v1'))`,
    )
    const previous = await tx
      .select()
      .from(projectClaimEvidence)
      .where(inArray(projectClaimEvidence.projectKey, projectKeys))
      .for('update')
    const replacements = new Map(
      proofs.map((proof) => [
        `${proof.projectKey}:${proof.creditIndex}`,
        proof,
      ]),
    )
    const changed = previous
      .filter((row) => {
        const replacement = replacements.get(
          `${row.projectKey}:${row.creditIndex}`,
        )
        return (
          !replacement ||
          row.emailHash !== replacement.emailHash ||
          row.rosterDigest !== replacement.rosterDigest ||
          row.keyId !== input.keyId
        )
      })
      .map((row) => row.id)
    if (changed.length)
      await tx
        .update(projectClaims)
        .set({
          status: 'revoked',
          automaticBlocked: true,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote:
            'Imported individual ownership evidence changed; review required.',
        })
        .where(
          and(
            inArray(projectClaims.evidenceId, changed),
            eq(projectClaims.verificationMethod, 'email'),
            eq(projectClaims.status, 'verified'),
          ),
        )
    await tx
      .update(projectClaimEvidence)
      .set({ disabledAt: new Date() })
      .where(inArray(projectClaimEvidence.projectKey, projectKeys))
    if (proofs.length)
      await tx
        .insert(projectClaimEvidence)
        .values(
          proofs.map((proof) => ({
            ...proof,
            keyId: input.keyId as string,
            disabledAt: null,
            importedAt: new Date(),
            importedBy: user.id,
          })),
        )
        .onConflictDoUpdate({
          target: [
            projectClaimEvidence.projectKey,
            projectClaimEvidence.creditIndex,
          ],
          set: {
            emailHash: sql`excluded.email_hash`,
            rosterDigest: sql`excluded.roster_digest`,
            sourceDigest: sql`excluded.source_digest`,
            keyId: sql`excluded.key_id`,
            disabledAt: null,
            importedAt: new Date(),
            importedBy: user.id,
          },
        })
  })
  return { projects: projectKeys.length, proofs: proofs.length }
}
