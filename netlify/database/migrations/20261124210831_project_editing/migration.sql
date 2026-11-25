CREATE TABLE "project_content" (
	"project_key" text PRIMARY KEY,
	"revision" integer DEFAULT 0 NOT NULL,
	"approved_content" jsonb,
	"current_content" jsonb,
	"status" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "project_content_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_key" text NOT NULL,
	"revision" integer NOT NULL,
	"content" jsonb NOT NULL,
	"status" text NOT NULL,
	"actor_id" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "project_content_history_revision_idx" ON "project_content_history" ("project_key","revision");--> statement-breakpoint
ALTER TABLE "project_content" ADD CONSTRAINT "project_content_updated_by_identity_accounts_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_content_history" ADD CONSTRAINT "project_content_history_actor_id_identity_accounts_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;