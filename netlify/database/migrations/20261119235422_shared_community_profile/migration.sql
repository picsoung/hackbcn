CREATE TABLE "community_profiles" (
	"account_id" uuid PRIMARY KEY,
	"display_name" text NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"linkedin_url" text DEFAULT '' NOT NULL,
	"github_url" text DEFAULT '' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
