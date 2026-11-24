CREATE TABLE "project_claim_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_key" text NOT NULL,
	"credit_index" integer NOT NULL,
	"email_hash" text NOT NULL,
	"key_id" text NOT NULL,
	"roster_digest" text NOT NULL,
	"source_digest" text NOT NULL,
	"disabled_at" timestamp with time zone,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"imported_by" uuid
);
--> statement-breakpoint
CREATE TABLE "project_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_key" text NOT NULL,
	"account_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"review_note" text,
	"verification_method" text,
	"automatic_blocked" boolean DEFAULT false NOT NULL,
	"evidence_id" uuid,
	"reviewed_by" uuid,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "project_claims_status_check" CHECK ("status" in ('pending','verified','rejected','revoked'))
);
--> statement-breakpoint
CREATE TABLE "project_visibility" (
	"project_key" text PRIMARY KEY,
	"visibility" text NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_visibility_state_check" CHECK ("visibility" in ('public','private'))
);
--> statement-breakpoint
CREATE TABLE "project_visibility_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_key" text NOT NULL,
	"actor_id" uuid,
	"visibility" text NOT NULL,
	"revision" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "project_claim_evidence_credit_idx" ON "project_claim_evidence" ("project_key","credit_index");--> statement-breakpoint
CREATE INDEX "project_claim_evidence_email_idx" ON "project_claim_evidence" ("email_hash","key_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_claims_account_project_idx" ON "project_claims" ("account_id","project_key");--> statement-breakpoint
CREATE INDEX "project_claims_status_idx" ON "project_claims" ("status","requested_at");--> statement-breakpoint
CREATE INDEX "project_visibility_audit_project_idx" ON "project_visibility_audit" ("project_key","created_at");--> statement-breakpoint
ALTER TABLE "project_claim_evidence" ADD CONSTRAINT "project_claim_evidence_imported_by_identity_accounts_id_fkey" FOREIGN KEY ("imported_by") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_claims" ADD CONSTRAINT "project_claims_account_id_identity_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "identity_accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "project_claims" ADD CONSTRAINT "project_claims_evidence_id_project_claim_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "project_claim_evidence"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_claims" ADD CONSTRAINT "project_claims_reviewed_by_identity_accounts_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_visibility" ADD CONSTRAINT "project_visibility_updated_by_identity_accounts_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_visibility_audit" ADD CONSTRAINT "project_visibility_audit_actor_id_identity_accounts_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "identity_accounts"("id") ON DELETE SET NULL;