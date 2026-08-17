import type { D1Database } from './d1';

/**
 * Abuse guards for the public RSVP endpoint.
 *
 * The endpoint spends money on every accepted call (one SMS + one email), which
 * is exactly the shape SMS-pumping fraud targets. Two independent layers:
 *
 *  1. Turnstile — proves a human submitted the form.
 *  2. Rate limits — caps how often any one IP or phone number can succeed,
 *     so a solved or replayed challenge still cannot run up a bill.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Per-bucket ceilings inside a rolling window. */
export const RATE_LIMITS = {
  /** One venue's shared wifi can legitimately produce a burst of RSVPs. */
  ip: { max: 10, windowHours: 1 },
  /** A single person re-submitting more than this is not a real attendee. */
  phone: { max: 3, windowHours: 1 },
} as const;

interface SiteverifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

/**
 * Validates a Turnstile token server-side. Never call siteverify from the
 * browser — the secret key would be exposed and the result would be forgeable.
 */
export async function verifyTurnstile(
  secretKey: string,
  token: string,
  remoteIp: string | null,
): Promise<{ ok: boolean; detail: string }> {
  if (!token) return { ok: false, detail: 'missing-input-response' };

  const form = new FormData();
  form.append('secret', secretKey);
  form.append('response', token);
  if (remoteIp) form.append('remoteip', remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, { method: 'POST', body: form });
    const result = (await response.json()) as SiteverifyResponse;
    return result.success
      ? { ok: true, detail: 'verified' }
      : { ok: false, detail: (result['error-codes'] ?? ['unknown']).join(',') };
  } catch (err) {
    // A siteverify outage must not silently open the gate.
    return { ok: false, detail: `siteverify unreachable: ${String(err)}` };
  }
}

/**
 * Returns the first bucket that is over its limit, or null when all are clear.
 * Fails **open** if D1 is unavailable: a database blip should not stop genuine
 * attendees from booking, and Turnstile is still in front of this.
 */
export async function findExceededLimit(
  db: D1Database,
  buckets: { key: string; max: number; windowHours: number }[],
): Promise<string | null> {
  for (const bucket of buckets) {
    try {
      const row = await db
        .prepare(
          `SELECT COUNT(*) AS hits FROM rate_limits
            WHERE bucket = ? AND created_at > datetime('now', ?)`,
        )
        .bind(bucket.key, `-${bucket.windowHours} hours`)
        .first<{ hits: number }>();

      if (row && Number(row.hits) >= bucket.max) return bucket.key;
    } catch (err) {
      console.error('[guards] rate-limit read failed, allowing request', err);
      return null;
    }
  }
  return null;
}

/** Records one hit per bucket, and opportunistically prunes stale rows. */
export async function recordRateLimitHits(db: D1Database, bucketKeys: string[]): Promise<void> {
  try {
    for (const key of bucketKeys) {
      await db.prepare('INSERT INTO rate_limits (bucket) VALUES (?)').bind(key).run();
    }
    // Cheap housekeeping: without this the ledger grows forever.
    await db.prepare("DELETE FROM rate_limits WHERE created_at < datetime('now', '-2 days')").run();
  } catch (err) {
    console.error('[guards] rate-limit write failed', err);
  }
}
