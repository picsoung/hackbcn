ALTER TABLE "creator_privacy" ADD COLUMN "hidden_fields" text[] NOT NULL DEFAULT '{}';
ALTER TABLE "creator_privacy_history" ADD COLUMN "hidden_fields" text[] NOT NULL DEFAULT '{}';
ALTER TABLE "creator_privacy" ADD CONSTRAINT "creator_privacy_fields_check" CHECK (hidden_fields <@ ARRAY['linkedin','github','otherLinks','photo','bio']::text[]);
ALTER TABLE "creator_privacy_history" ADD CONSTRAINT "creator_privacy_history_fields_check" CHECK (hidden_fields <@ ARRAY['linkedin','github','otherLinks','photo','bio']::text[]);
