-- Rate-limit ledger for POST /api/rsvp.
--
-- Every accepted attempt writes one row per bucket ("ip:1.2.3.4",
-- "phone:0241234567"). The endpoint spends real money per call — an SMS and an
-- email — so this is what stops one client from draining the credit.
--
-- D1 is used rather than KV because KV is eventually consistent, which makes it
-- unreliable for counting; and the D1 binding already exists here.

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The only query shape: count rows for one bucket inside a time window.
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket_time ON rate_limits (bucket, created_at);
