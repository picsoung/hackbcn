CREATE TABLE IF NOT EXISTS deployment_operations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
