ALTER TABLE "live_projects" ADD COLUMN "screenshot_key" text;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "used_lovable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "jev_usage" text;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "judge_impact" real;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "judge_creativity" real;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "judge_jev_use" real;--> statement-breakpoint
ALTER TABLE "live_projects" ADD COLUMN "judge_score" real;