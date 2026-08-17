/**
 * Password hashing for admin accounts stored in D1.
 *
 * Storing a login password in plain text would mean anyone who ever reads the
 * database — a backup, a console query, a leaked export — has the credential
 * itself. PBKDF2-SHA256 is used instead: available in both the Workers runtime
 * and Node via Web Crypto, with no dependency to keep patched.
 *
 * Stored format is self-describing so the cost can be raised later without
 * invalidating existing rows:
 *
 *   pbkdf2$<iterations>$<saltHex>$<hashHex>
 */

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string): Uint8Array => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS,
  );
  return toHex(new Uint8Array(bits));
}

/** Hashes a password with a fresh random salt. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${hash}`;
}

/**
 * Verifies a password against a stored hash. Returns false on any malformed
 * input rather than throwing, so a corrupt row cannot crash the login route.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  try {
    const candidate = await derive(password, fromHex(parts[2]), iterations);
    // Constant-time: compare every character regardless of early mismatch.
    if (candidate.length !== parts[3].length) return false;
    let diff = 0;
    for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ parts[3].charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}
