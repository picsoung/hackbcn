ALTER TABLE "live_projects" ADD COLUMN "hackers" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "award" text;