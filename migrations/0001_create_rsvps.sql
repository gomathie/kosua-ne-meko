-- RSVP bookings captured by POST /api/rsvp.
--
-- Until now an RSVP existed only in the attendee's own localStorage, so the
-- organiser had no list of who was coming and a cleared browser lost the pass.
-- This table is the durable record.

CREATE TABLE IF NOT EXISTS rsvps (
  -- The ticket ID shown on the pass (e.g. KNM2-483920). Natural primary key,
  -- which also makes a retried submission idempotent rather than duplicated.
  ticket_id     TEXT PRIMARY KEY,
  customer_name TEXT    NOT NULL,
  phone         TEXT    NOT NULL DEFAULT '',
  email         TEXT    NOT NULL DEFAULT '',
  pass_name     TEXT    NOT NULL DEFAULT '',
  quantity      INTEGER NOT NULL DEFAULT 1,
  meko_level    TEXT    NOT NULL DEFAULT '',
  event_title   TEXT    NOT NULL DEFAULT '',
  event_date    TEXT    NOT NULL DEFAULT '',
  venue         TEXT    NOT NULL DEFAULT '',
  -- Per-channel delivery outcome: sent | failed | skipped
  sms_status    TEXT    NOT NULL DEFAULT 'skipped',
  email_status  TEXT    NOT NULL DEFAULT 'skipped',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Organiser views are "newest first" and "look up one attendee".
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_phone      ON rsvps (phone);
CREATE INDEX IF NOT EXISTS idx_rsvps_email      ON rsvps (email);
