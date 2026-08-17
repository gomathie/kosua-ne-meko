import { sanitizeEmail, sanitizePasscode } from '../../../src/utils/sanitize';
import { createSessionToken, secretsMatch, SESSION_TTL_SECONDS } from '../../_shared/auth';
import { verifyPassword } from '../../_shared/password';
import type { D1Database } from '../../_shared/d1';

/**
 * Cloudflare Pages Function: POST /api/admin/login
 *
 * Real, server-side admin authentication. The portal's VITE_ADMIN_* values ship
 * inside the JS bundle and can only gate the UI; these ADMIN_* values never
 * leave the server, so they are what actually protects attendee data.
 *
 * Returns a short-lived signed token used as a bearer credential by /api/rsvps.
 */

interface Env {
  /** Admin accounts live here; the env pair below is only a bootstrap fallback. */
  DB?: D1Database;
  /** Server-side copies of the portal credentials. No VITE_ prefix — ever. */
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  /** Long random string used to sign session tokens. */
  ADMIN_SESSION_SECRET?: string;
}

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Sessions cannot be signed without this, whatever the credential source is.
  if (!env.ADMIN_SESSION_SECRET) {
    // Signals the portal to fall back to its local-only gate.
    return json({ ok: false, error: 'Server-side admin auth is not configured.' }, 503);
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  // Same normalization as the portal, so a credential typed one way matches.
  const email = sanitizeEmail(body.email);
  const password = sanitizePasscode(body.password);

  if (!email || !password) {
    return json({ ok: false, error: 'Incorrect email or password.' }, 401);
  }

  let authenticated = false;

  // Preferred source: the admin_users table, where passwords are stored hashed
  // and accounts can be added or revoked without a redeploy.
  if (env.DB) {
    try {
      const row = await env.DB.prepare('SELECT password_hash FROM admin_users WHERE email = ?')
        .bind(email)
        .first<{ password_hash: string }>();

      if (row) {
        authenticated = await verifyPassword(password, row.password_hash);
        if (authenticated) {
          await env.DB.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE email = ?")
            .bind(email)
            .run()
            .catch(() => undefined);
        }
      }
    } catch (err) {
      // A database problem must not silently fall through to a weaker check.
      console.error('[admin/login] admin_users lookup failed', err);
      return json({ ok: false, error: 'Sign-in is temporarily unavailable.' }, 503);
    }
  }

  // Bootstrap fallback: lets the first deploy in before any row exists. Only
  // consulted when the database holds no matching account.
  if (!authenticated && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const emailOk = secretsMatch(email, sanitizeEmail(env.ADMIN_EMAIL));
    const passwordOk = secretsMatch(password, sanitizePasscode(env.ADMIN_PASSWORD));
    authenticated = emailOk && passwordOk;
  }

  // The reply never says which half was wrong.
  if (!authenticated) {
    return json({ ok: false, error: 'Incorrect email or password.' }, 401);
  }

  const token = await createSessionToken(env.ADMIN_SESSION_SECRET, email);
  return json({ ok: true, token, expiresIn: SESSION_TTL_SECONDS }, 200);
}
