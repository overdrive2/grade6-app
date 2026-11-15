CREATE TABLE learner_accounts (
  user_id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  progress_json TEXT NOT NULL DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 0
);
