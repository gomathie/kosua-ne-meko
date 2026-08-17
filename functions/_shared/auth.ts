/**
 * Server-side admin sessions.
 *
 * The portal's VITE_ADMIN_* credentials only gate the *UI* — they ship in the JS
 * bundle, so they cannot protect data. Anything that reads the RSVP table is
 * gated by these functions instead, which check credentials that never leave the
 * server and hand back a short-lived signed token.
 *
 * The token is a stateless HMAC (`base64url(payload).base64url(signature)`), so
 * no session store is needed. It is signed, not encrypted: it carries no secret,
 * only an email and an expiry.
 */

const encoder = new TextEncoder();

/** How long a portal session stays valid before re-login. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

interface SessionPayload {
  email: string;
  /** Unix seconds. */
  exp: number;
}

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

/** Length-safe, non-short-circuiting comparison — avoids leaking equality by timing. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string, email: string): Promise<string> {
  const payload: SessionPayload = { email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = toBase64Url(await hmac(secret, encoded));
  return `${encoded}.${signature}`;
}

/** Returns the session payload, or null when the token is absent, forged or expired. */
export async function verifySessionToken(secret: string, token: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = toBase64Url(await hmac(secret, encoded));
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Pulls the bearer token out of an Authorization header. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() || null : null;
}

/** Compares two secrets without short-circuiting. Exported for the login route. */
export const secretsMatch = constantTimeEqual;
