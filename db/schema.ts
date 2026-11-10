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
} from 'drizzle-orm/pg-core'

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
    creatorName: text('creator_name').notNull(),
    // Private: never returned by public routes.
    creatorEmail: text('creator_email').notNull(),
    linkedinUrl: text('linkedin_url').notNull(),
    shareConsent: boolean('share_consent').notNull().default(false),
    // Jev categorization
    category: text(),
    categoryConfidence: real('category_confidence'),
    jevAnswers: jsonb('jev_answers'),
    jevModel: text('jev_model'),
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
