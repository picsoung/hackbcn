import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import type { ProjectHacker } from '../lib/live/validate'
import type { ProjectEditContent } from '../lib/projects/edit-content'
import type { ReviewAlert } from '../lib/projects/review-notifications'
import type { CommunicationLanguage } from '../lib/account/communications'
import type { CommunityProfile } from '../lib/community/profile'
import type { PrivacyField } from '../lib/projects/privacy-model'

/** Creator credits can be hidden independently of project visibility and account permissions. */
export const creatorPrivacy = pgTable('creator_privacy', {
  subjectKey: text('subject_key').primaryKey(),
  hidden: boolean().notNull().default(false),
  hiddenFields: text('hidden_fields')
    .$type<PrivacyField>()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  revision: integer().notNull().default(0),
  updatedBy: uuid('updated_by').references(() => identityAccounts.id, {
    onDelete: 'set null',
  }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
export const creatorPrivacyHistory = pgTable(
  'creator_privacy_history',
  {
    id: uuid().primaryKey().defaultRandom(),
    subjectKey: text('subject_key').notNull(),
    hidden: boolean().notNull(),
    hiddenFields: text('hidden_fields')
      .$type<PrivacyField>()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    revision: integer().notNull(),
    actorId: uuid('actor_id').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('creator_privacy_history_revision_idx').on(
      table.subjectKey,
      table.revision,
    ),
  ],
)

/** Public corrections for historical, unclaimed builder credits. Identity grouping stays source-based. */
export const builderProfiles = pgTable('builder_profiles', {
  slug: text().primaryKey(),
  content: jsonb().$type<Omit<CommunityProfile, 'revision'>>(),
  revision: integer().notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/** Private organiser edit history for both historical and claimed public profiles. */
export const builderProfileHistory = pgTable(
  'builder_profile_history',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull(),
    accountId: uuid('account_id'),
    content: jsonb().$type<Omit<CommunityProfile, 'revision'>>().notNull(),
    previousContent: jsonb('previous_content')
      .$type<Omit<CommunityProfile, 'revision'>>()
      .notNull(),
    revision: integer().notNull(),
    actorId: uuid('actor_id').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('builder_profile_history_slug_idx').on(table.slug, table.createdAt),
  ],
)

/** Invitation-only opt-outs. No plaintext addresses and no newsletter subscription changes. */
export const profileInvitationOptOuts = pgTable('profile_invitation_opt_outs', {
  emailHash: text('email_hash').primaryKey(),
  optedOutAt: timestamp('opted_out_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/** Private shared-account preference and durable contact-sync queue. Never public profile data. */
export const accountCommunications = pgTable(
  'account_communications',
  {
    accountId: uuid('account_id').primaryKey(),
    verifiedEmail: text('verified_email').notNull(),
    communicationLanguage: text(
      'communication_language',
    ).$type<CommunicationLanguage>(),
    revision: integer().notNull().default(1),
    syncedRevision: integer('synced_revision').notNull().default(0),
    attempts: integer().notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lease: uuid(),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastError: text('last_error'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'account_communications_language',
      sql`${table.communicationLanguage} IS NULL OR ${table.communicationLanguage} IN ('en', 'es', 'ca')`,
    ),
  ],
)

/** Canonical community fields shared by HackBarna and Digest. Account IDs remain private. */
export const communityProfiles = pgTable('community_profiles', {
  accountId: uuid('account_id').primaryKey(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url').notNull().default(''),
  bio: text().notNull().default(''),
  linkedinUrl: text('linkedin_url').notNull().default(''),
  githubUrl: text('github_url').notNull().default(''),
  revision: integer().notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/** Private identity/session records. Public catalog queries never join these tables. */
export const identityAccounts = pgTable('identity_accounts', {
  id: uuid().primaryKey(), // Existing Digest Auth subject, not a new auth identity.
  issuer: text().notNull(),
  email: text(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const identitySessions = pgTable(
  'identity_sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    tokenHash: text('token_hash').notNull().unique(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => identityAccounts.id, { onDelete: 'cascade' }),
    credentials: text().notNull(), // AES-GCM ciphertext; never a browser session payload.
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    refreshVersion: integer('refresh_version').notNull().default(0),
    refreshLease: text('refresh_lease'),
    refreshLockedUntil: timestamp('refresh_locked_until', {
      withTimezone: true,
    }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('identity_sessions_expiry_idx').on(t.expiresAt),
    index('identity_sessions_account_idx').on(t.accountId),
  ],
)

/** Private asset metadata. Image bytes live in Netlify Blobs, never in database rows. */
export const mediaAssets = pgTable(
  'media_assets',
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => identityAccounts.id, { onDelete: 'cascade' }),
    purpose: text().$type<'avatar' | 'project'>().notNull(),
    projectKey: text('project_key'),
    ready: boolean().notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('media_assets_owner_created_idx').on(t.ownerId, t.createdAt)],
)

/** Durable Slack delivery, committed together with the edit/claim. No webhook secrets or email addresses. */
export const reviewNotifications = pgTable(
  'review_notifications',
  {
    id: uuid().primaryKey().defaultRandom(),
    eventKey: text('event_key').notNull(),
    projectKey: text('project_key').notNull(),
    revision: integer(),
    claimId: uuid('claim_id'),
    requestedAt: timestamp('requested_at', { withTimezone: true }),
    webhookFingerprint: text('webhook_fingerprint').notNull(),
    payload: jsonb().$type<ReviewAlert>().notNull(),
    status: text()
      .$type<'pending' | 'sending' | 'sent' | 'cancelled' | 'failed'>()
      .notNull()
      .default('pending'),
    attempts: integer().notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lease: uuid(),
    lastError: text('last_error'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('review_notifications_event_idx').on(
      t.eventKey,
      t.webhookFingerprint,
    ),
    index('review_notifications_due_idx').on(t.status, t.nextAttemptAt),
  ],
)

/** Public readers select only approvedContent. Pending/rejected edits stay private. */
export const projectContent = pgTable('project_content', {
  projectKey: text('project_key').primaryKey(),
  revision: integer().notNull().default(0),
  approvedContent: jsonb('approved_content').$type<ProjectEditContent>(),
  currentContent: jsonb('current_content').$type<ProjectEditContent>(),
  status: text().$type<'pending' | 'approved' | 'rejected'>(),
  updatedBy: uuid('updated_by').references(() => identityAccounts.id, {
    onDelete: 'set null',
  }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewNote: text('review_note'),
})

/** Immutable edit and decision snapshots. No personal contact data. */
export const projectContentHistory = pgTable(
  'project_content_history',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectKey: text('project_key').notNull(),
    revision: integer().notNull(),
    content: jsonb().$type<ProjectEditContent>().notNull(),
    status: text().$type<'pending' | 'approved' | 'rejected'>().notNull(),
    actorId: uuid('actor_id').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    note: text(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('project_content_history_revision_idx').on(
      t.projectKey,
      t.revision,
    ),
  ],
)

/** Private, keyed contact proofs. Raw attendee/submission emails never enter public tables. */
export const projectClaimEvidence = pgTable(
  'project_claim_evidence',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectKey: text('project_key').notNull(),
    creditIndex: integer('credit_index').notNull(),
    emailHash: text('email_hash').notNull(),
    keyId: text('key_id').notNull(),
    rosterDigest: text('roster_digest').notNull(),
    sourceDigest: text('source_digest').notNull(),
    disabledAt: timestamp('disabled_at', { withTimezone: true }),
    importedAt: timestamp('imported_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    importedBy: uuid('imported_by').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [
    uniqueIndex('project_claim_evidence_credit_idx').on(
      t.projectKey,
      t.creditIndex,
    ),
    index('project_claim_evidence_email_idx').on(t.emailHash, t.keyId),
  ],
)

/** A verified claim is a project membership. Editable public profiles grant no rights. */
export const projectClaims = pgTable(
  'project_claims',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectKey: text('project_key').notNull(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => identityAccounts.id, { onDelete: 'cascade' }),
    status: text()
      .$type<'pending' | 'verified' | 'rejected' | 'revoked'>()
      .notNull()
      .default('pending'),
    message: text().notNull().default(''),
    reviewNote: text('review_note'),
    verificationMethod: text('verification_method').$type<
      'email' | 'organiser'
    >(),
    automaticBlocked: boolean('automatic_blocked').notNull().default(false),
    evidenceId: uuid('evidence_id').references(() => projectClaimEvidence.id, {
      onDelete: 'set null',
    }),
    reviewedBy: uuid('reviewed_by').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    requestedAt: timestamp('requested_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('project_claims_account_project_idx').on(
      t.accountId,
      t.projectKey,
    ),
    index('project_claims_status_idx').on(t.status, t.requestedAt),
    check(
      'project_claims_status_check',
      sql`${t.status} in ('pending','verified','rejected','revoked')`,
    ),
  ],
)

/** Runtime overrides for archived content; submitted projects also keep their DB flag. */
export const projectVisibility = pgTable(
  'project_visibility',
  {
    projectKey: text('project_key').primaryKey(),
    visibility: text().$type<'public' | 'private'>().notNull(),
    revision: integer().notNull().default(0),
    updatedBy: uuid('updated_by').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      'project_visibility_state_check',
      sql`${t.visibility} in ('public','private')`,
    ),
  ],
)

/** Private history shared by verified teammates; never joined into public catalogs. */
export const projectVisibilityAudit = pgTable(
  'project_visibility_audit',
  {
    id: uuid().primaryKey().defaultRandom(),
    projectKey: text('project_key').notNull(),
    actorId: uuid('actor_id').references(() => identityAccounts.id, {
      onDelete: 'set null',
    }),
    visibility: text().$type<'public' | 'private'>().notNull(),
    revision: integer().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('project_visibility_audit_project_idx').on(t.projectKey, t.createdAt),
  ],
)

/** Projects submitted live during an event. One table for every event, keyed by event_slug. */
export const liveProjects = pgTable(
  'live_projects',
  {
    id: serial().primaryKey(),
    eventSlug: text('event_slug').notNull(),
    slug: text().notNull(),
    name: text().notNull(),
    visibility: text()
      .$type<'public' | 'private'>()
      .notNull()
      .default('public'),
    tagline: text().notNull(),
    url: text().notNull(),
    videoUrl: text('video_url'),
    screenshotKey: text('screenshot_key'),
    creatorName: text('creator_name').notNull(),
    // Private: never returned by public routes.
    creatorEmail: text('creator_email').notNull(),
    linkedinUrl: text('linkedin_url').notNull(),
    hackers: jsonb().$type<ProjectHacker[]>().notNull().default([]),
    award: text(),
    shareConsent: boolean('share_consent').notNull().default(false),
    usedLovable: boolean('used_lovable').notNull().default(false),
    jevUsage: text('jev_usage'),
    // Jev categorization
    category: text(),
    categoryConfidence: real('category_confidence'),
    jevAnswers: jsonb('jev_answers'),
    jevModel: text('jev_model'),
    judgeImpact: real('judge_impact'),
    judgeCreativity: real('judge_creativity'),
    judgeJevUse: real('judge_jev_use'),
    judgeScore: real('judge_score'),
    voteCount: integer('vote_count').notNull().default(0),
    shareCount: integer('share_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('live_projects_event_slug_idx').on(t.eventSlug, t.slug),
    index('live_projects_event_votes_idx').on(t.eventSlug, t.voteCount),
    check(
      'live_projects_visibility_check',
      sql`${t.visibility} in ('public', 'private')`,
    ),
  ],
)

export const liveVotes = pgTable(
  'live_votes',
  {
    id: serial().primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => liveProjects.id, { onDelete: 'cascade' }),
    voterId: text('voter_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('live_votes_project_voter_idx').on(t.projectId, t.voterId),
    index('live_votes_voter_idx').on(t.voterId),
  ],
)
