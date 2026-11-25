CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"project_key" text,
	"ready" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "media_assets_owner_created_idx" ON "media_assets" ("owner_id","created_at");--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_id_identity_accounts_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "identity_accounts"("id") ON DELETE CASCADE;