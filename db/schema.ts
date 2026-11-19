import {
  boolean,
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

/** Projects submitted live during an event. One table for every event, keyed by event_slug. */
export const liveProjects = pgTable(
  'live_projects',
  {
    id: serial().primaryKey(),
    eventSlug: text('event_slug').notNull(),
    slug: text().notNull(),
    name: text().notNull(),
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
