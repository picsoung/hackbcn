CREATE TABLE "review_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_key" text NOT NULL,
	"project_key" text NOT NULL,
	"revision" integer,
	"claim_id" uuid,
	"requested_at" timestamp with time zone,
	"webhook_fingerprint" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_until" timestamp with time zone,
	"lease" uuid,
	"last_error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "review_notifications_event_idx" ON "review_notifications" ("event_key","webhook_fingerprint");--> statement-breakpoint
CREATE INDEX "review_notifications_due_idx" ON "review_notifications" ("status","next_attempt_at");