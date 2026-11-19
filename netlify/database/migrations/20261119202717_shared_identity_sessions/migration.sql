CREATE TABLE "identity_accounts" (
	"id" uuid PRIMARY KEY,
	"issuer" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"token_hash" text NOT NULL UNIQUE,
	"account_id" uuid NOT NULL,
	"credentials" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"refresh_version" integer DEFAULT 0 NOT NULL,
	"refresh_lease" text,
	"refresh_locked_until" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "identity_sessions_expiry_idx" ON "identity_sessions" ("expires_at");--> statement-breakpoint
CREATE INDEX "identity_sessions_account_idx" ON "identity_sessions" ("account_id");--> statement-breakpoint
ALTER TABLE "identity_sessions" ADD CONSTRAINT "identity_sessions_account_id_identity_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "identity_accounts"("id") ON DELETE CASCADE;