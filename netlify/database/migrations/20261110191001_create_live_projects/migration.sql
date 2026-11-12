CREATE TABLE "live_projects" (
	"id" serial PRIMARY KEY,
	"event_slug" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"url" text NOT NULL,
	"video_url" text,
	"creator_name" text NOT NULL,
	"creator_email" text NOT NULL,
	"linkedin_url" text NOT NULL,
	"share_consent" boolean DEFAULT false NOT NULL,
	"category" text,
	"category_confidence" real,
	"jev_answers" jsonb,
	"jev_model" text,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_votes" (
	"id" serial PRIMARY KEY,
	"project_id" integer NOT NULL,
	"voter_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "live_projects_event_slug_idx" ON "live_projects" ("event_slug","slug");--> statement-breakpoint
CREATE INDEX "live_projects_event_votes_idx" ON "live_projects" ("event_slug","vote_count");--> statement-breakpoint
CREATE UNIQUE INDEX "live_votes_project_voter_idx" ON "live_votes" ("project_id","voter_id");--> statement-breakpoint
CREATE INDEX "live_votes_voter_idx" ON "live_votes" ("voter_id");--> statement-breakpoint
ALTER TABLE "live_votes" ADD CONSTRAINT "live_votes_project_id_live_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "live_projects"("id") ON DELETE CASCADE;