CREATE TABLE "account_communications" (
	"account_id" uuid PRIMARY KEY,
	"verified_email" text NOT NULL,
	"communication_language" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"synced_revision" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lease" uuid,
	"locked_until" timestamp with time zone,
	"last_error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_communications_language" CHECK ("communication_language" IS NULL OR "communication_language" IN ('en', 'es', 'ca'))
);
