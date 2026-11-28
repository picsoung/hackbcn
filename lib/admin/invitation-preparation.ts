import 'server-only'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  identityAccounts,
  projectClaims,
  projectClaimEvidence,
  profileInvitationOptOuts,
  accountCommunications,
  projectVisibility,
} from '@/db/schema'
import { sourceProject } from '@/lib/projects/ownership-store'
import {
  creatorPrivacyContext,
  creditPrivacy,
} from '@/lib/projects/creator-privacy'
import {
  claimEmail,
  claimEmailHash,
  claimKeyId,
  claimLookupKey,
  claimRosterDigest,
} from '@/lib/projects/email-proof'
import {
  invitationEmailHash,
  invitationOptOutToken,
} from '@/lib/email/invitation-opt-out'

type Credit = {
  projectKey: string
  creditIndex: number
  rosterDigest: string
  sourceDigest?: string
  individualEmail?: string
  registrationEmail?: string
}
type Recipient = { id: string; email: string; credits: Credit[] }

/** Preparation only. Existing keys stay inside Netlify; this never sends email. */
export async function prepareProfileInvitations(input: {
  recipients: Recipient[]
}) {
  if (process.env.SITE_ORIGIN !== 'https://www.hackbarna.com')
    throw new Error('Production required')
  const key = claimLookupKey()
  if (
    !key ||
    !Array.isArray(input?.recipients) ||
    !input.recipients.length ||
    input.recipients.length > 100
  )
    throw new Error('Invalid preparation')
  const recipients = input.recipients
  const seen = new Set<string>()
  for (const r of recipients) {
    if (
      !/^[a-f0-9]{24}$/.test(r.id) ||
      claimEmail(r.email) !== r.email ||
      seen.has(r.email) ||
      !Array.isArray(r.credits) ||
      !r.credits.length ||
      r.credits.length > 100
    )
      throw new Error('Invalid recipient')
    seen.add(r.email)
  }
  const db = getDb()
  const [actor] = await db
    .select()
    .from(identityAccounts)
    .where(eq(identityAccounts.id, process.env.HACKBARNA_OWNER_ID ?? ''))
    .limit(1)
  if (!actor?.emailVerified) throw new Error('Verified organiser required')
  const privacy = await creatorPrivacyContext()
  const results = []
  for (const r of recipients) {
    const hash = invitationEmailHash(r.email)
    const stopped = await db
      .select()
      .from(profileInvitationOptOuts)
      .where(eq(profileInvitationOptOuts.emailHash, hash))
      .limit(1)
    const claims = await db
      .select({ id: projectClaims.id })
      .from(projectClaims)
      .innerJoin(
        identityAccounts,
        eq(projectClaims.accountId, identityAccounts.id),
      )
      .where(
        and(
          eq(identityAccounts.email, r.email),
          eq(projectClaims.status, 'verified'),
        ),
      )
      .limit(1)
    if (stopped.length || claims.length) {
      results.push({
        id: r.id,
        eligible: false,
        reason: stopped.length ? 'opt_out' : 'already_claimed',
      })
      continue
    }
    const projects = new Map<
      string,
      { key: string; name: string; event: string }
    >()
    const proofs: (typeof projectClaimEvidence.$inferInsert)[] = []
    let hidden = false
    for (const credit of r.credits) {
      const source = await sourceProject(credit.projectKey, 'en')
      const [visibility] = await db
        .select()
        .from(projectVisibility)
        .where(eq(projectVisibility.projectKey, credit.projectKey))
        .limit(1)
      if (
        !source ||
        !Number.isSafeInteger(credit.creditIndex) ||
        credit.creditIndex < 0 ||
        credit.creditIndex >= source.card.hackers.length ||
        credit.rosterDigest !== claimRosterDigest(source.card.hackers)
      )
        throw new Error('Source changed')
      if (
        (visibility?.visibility ?? source.visibility) !== 'public' ||
        creditPrivacy(privacy, credit.projectKey, credit.creditIndex).hidden
      )
        hidden = true
      projects.set(credit.projectKey, {
        key: credit.projectKey,
        name: source.card.name,
        event: source.card.eventName,
      })
      if (credit.individualEmail || credit.registrationEmail) {
        if (
          claimEmail(credit.individualEmail) !== r.email ||
          claimEmail(credit.registrationEmail) !== r.email ||
          !/^[a-f0-9]{64}$/.test(credit.sourceDigest ?? '')
        )
          throw new Error('Individual evidence required')
        proofs.push({
          projectKey: credit.projectKey,
          creditIndex: credit.creditIndex,
          rosterDigest: credit.rosterDigest,
          sourceDigest: credit.sourceDigest!,
          emailHash: claimEmailHash(r.email, key),
          keyId: claimKeyId(key),
          importedBy: actor.id,
        })
      }
    }
    if (hidden) {
      results.push({ id: r.id, eligible: false, reason: 'private_credit' })
      continue
    }
    const imported = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('hackbarna-project-evidence-import-v1'))`,
      )
      const accepted = []
      for (const proof of proofs) {
        const [existing] = await tx
          .select()
          .from(projectClaimEvidence)
          .where(
            and(
              eq(projectClaimEvidence.projectKey, proof.projectKey),
              eq(projectClaimEvidence.creditIndex, proof.creditIndex),
            ),
          )
          .for('update')
        if (
          existing &&
          (existing.disabledAt ||
            existing.emailHash !== proof.emailHash ||
            existing.keyId !== proof.keyId ||
            existing.rosterDigest !== proof.rosterDigest)
        )
          throw new Error('Existing proof conflict')
        if (!existing) await tx.insert(projectClaimEvidence).values(proof)
        accepted.push({
          projectKey: proof.projectKey,
          creditIndex: proof.creditIndex,
        })
      }
      return accepted
    })
    const [preference] = await db
      .select()
      .from(accountCommunications)
      .where(eq(accountCommunications.verifiedEmail, r.email))
      .limit(1)
    results.push({
      id: r.id,
      eligible: true,
      projects: Array.from(projects.values()),
      imported,
      claimKeyId: claimKeyId(key),
      claimEmailHash: claimEmailHash(r.email, key),
      invitationEmailHash: hash,
      optOutUrl: `https://www.hackbarna.com/en/invitations/unsubscribe?token=${invitationOptOutToken(r.email)}`,
      communicationLanguage: preference?.communicationLanguage ?? null,
    })
  }
  return { recipients: results }
}
