-- Admin accounts for the portal, checked by POST /api/admin/login.
--
-- Moves admin credentials out of environment variables and into the database,
-- so accounts can be added or revoked without a redeploy.
--
-- Passwords are never stored in plain text: password_hash holds a PBKDF2-SHA256
-- digest in the self-describing form `pbkdf2$<iterations>$<salt>$<hash>`
-- (see functions/_shared/password.ts).

CREATE TABLE IF NOT EXISTS admin_users (
  -- Lowercased email — the login identifier, so it must be unique.
  email         TEXT PRIMARY KEY,
  name          TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Super Admin',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
