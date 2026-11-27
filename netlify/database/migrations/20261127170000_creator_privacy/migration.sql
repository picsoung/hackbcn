CREATE TABLE "creator_privacy" (
  "subject_key" text PRIMARY KEY,
  "hidden" boolean NOT NULL DEFAULT false,
  "revision" integer NOT NULL DEFAULT 0,
  "updated_by" uuid REFERENCES "identity_accounts"("id") ON DELETE SET NULL,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE "creator_privacy_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subject_key" text NOT NULL,
  "hidden" boolean NOT NULL,
  "revision" integer NOT NULL,
  "actor_id" uuid REFERENCES "identity_accounts"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "creator_privacy_history_revision_idx" ON "creator_privacy_history" ("subject_key", "revision");
