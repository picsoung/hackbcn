CREATE TABLE "profile_invitation_opt_outs" (
	"email_hash" text PRIMARY KEY,
	"opted_out_at" timestamp with time zone DEFAULT now() NOT NULL
);
