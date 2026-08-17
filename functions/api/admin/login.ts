import { sanitizeEmail, sanitizePasscode } from '../../../src/utils/sanitize';
import { createSessionToken, secretsMatch, SESSION_TTL_SECONDS } from '../../_shared/auth';

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

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
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

  const emailOk = secretsMatch(email, sanitizeEmail(env.ADMIN_EMAIL));
  const passwordOk = secretsMatch(password, sanitizePasscode(env.ADMIN_PASSWORD));

  // Both are always evaluated, and the reply never says which half was wrong.
  if (!emailOk || !passwordOk) {
    return json({ ok: false, error: 'Incorrect email or password.' }, 401);
  }

  const token = await createSessionToken(env.ADMIN_SESSION_SECRET, email);
  return json({ ok: true, token, expiresIn: SESSION_TTL_SECONDS }, 200);
}
