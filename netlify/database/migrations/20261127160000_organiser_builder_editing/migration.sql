CREATE TABLE "builder_profiles" (
  "slug" text PRIMARY KEY,
  "content" jsonb,
  "revision" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE "builder_profile_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL,
  "account_id" uuid,
  "content" jsonb NOT NULL,
  "previous_content" jsonb NOT NULL,
  "revision" integer NOT NULL,
  "actor_id" uuid REFERENCES "identity_accounts"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX "builder_profile_history_slug_idx" ON "builder_profile_history" ("slug", "created_at");
