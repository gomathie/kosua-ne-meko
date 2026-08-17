import { sanitizeText, sanitizePhone, sanitizeInt, isValidPhone, LIMITS } from '../../src/utils/sanitize';

/**
 * Cloudflare Pages Function: POST /api/rsvp
 *
 * Sends the attendee an SMS confirmation via mNotify. This runs server-side
 * precisely so MNOTIFY_API_KEY never reaches the browser — a leaked SMS key gets
 * used to burn your credit sending spam.
 *
 * The message is assembled here from a fixed template; the client only supplies
 * short, sanitized values. Never echo raw client text into the SMS body.
 */

interface Env {
  MNOTIFY_API_KEY?: string;
  MNOTIFY_SENDER_ID?: string;
  /** Optional admin number that gets a copy of each new RSVP. */
  MNOTIFY_NOTIFY_TO?: string;
}

interface RsvpPayload {
  customerName?: unknown;
  phone?: unknown;
  ticketId?: unknown;
  passName?: unknown;
  quantity?: unknown;
  eventDate?: unknown;
  venue?: unknown;
}

const MNOTIFY_QUICK_SMS_URL = 'https://api.mnotify.com/api/sms/quick';
/** mNotify returns code 2000 on success; anything else is a failure. */
const MNOTIFY_SUCCESS_CODE = 2000;
/** Keep the body inside a single SMS segment where possible. */
const MAX_SMS_LENGTH = 160;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * mNotify expects Ghanaian local format (0241234567). Our client normalizes to
 * E.164 (+233241234567), so convert the country code back to a leading zero.
 */
function toGhanaLocal(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return '0' + digits.slice(3);
  if (digits.startsWith('0')) return digits;
  if (digits.length === 9) return '0' + digits;
  return digits;
}

async function sendSms(env: Env, recipients: string[], message: string): Promise<{ ok: boolean; detail: string }> {
  const response = await fetch(`${MNOTIFY_QUICK_SMS_URL}?key=${encodeURIComponent(env.MNOTIFY_API_KEY ?? '')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: recipients,
      sender: env.MNOTIFY_SENDER_ID,
      message,
      is_schedule: false,
      schedule_date: '',
    }),
  });

  // mNotify has returned HTML error pages before now, so do not assume JSON.
  const raw = await response.text();
  let parsed: { code?: number; status?: string; message?: string } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, detail: `Unexpected response from mNotify (HTTP ${response.status})` };
  }

  if (!response.ok || Number(parsed.code) !== MNOTIFY_SUCCESS_CODE) {
    // Error-code meanings are not publicly documented, so surface what was returned.
    return { ok: false, detail: parsed.message || `mNotify code ${parsed.code ?? 'unknown'}` };
  }
  return { ok: true, detail: parsed.message || 'sent' };
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (!env.MNOTIFY_API_KEY || !env.MNOTIFY_SENDER_ID) {
    console.error('[rsvp] MNOTIFY_API_KEY / MNOTIFY_SENDER_ID are not configured');
    return json({ ok: false, error: 'SMS is not configured on this deployment.' }, 503);
  }

  let payload: RsvpPayload;
  try {
    payload = (await request.json()) as RsvpPayload;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400);
  }

  // Re-validate everything here — the client checks are for UX, not trust.
  const name = sanitizeText(payload.customerName, 40);
  const phone = sanitizePhone(payload.phone);
  const ticketId = sanitizeText(payload.ticketId, LIMITS.id);
  const passName = sanitizeText(payload.passName, 40);
  const quantity = sanitizeInt(payload.quantity, 1, 10, 1);
  const eventDate = sanitizeText(payload.eventDate, 40);
  const venue = sanitizeText(payload.venue, 60);

  if (!name || !isValidPhone(phone) || !ticketId) {
    return json({ ok: false, error: 'A valid name, Ghana phone number and ticket ID are required.' }, 400);
  }

  const message = [
    `Hi ${name}, your ${passName || 'pass'} for Kosua Ne Meko is confirmed.`,
    `ID: ${ticketId} (x${quantity}).`,
    eventDate && venue ? `${eventDate}, ${venue}.` : eventDate || venue || '',
    'Show this ID at the gate.',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, MAX_SMS_LENGTH);

  try {
    const result = await sendSms(env, [toGhanaLocal(phone)], message);

    // Best-effort copy to the organiser; never fail the attendee's RSVP over it.
    const notifyTo = sanitizePhone(env.MNOTIFY_NOTIFY_TO);
    if (result.ok && isValidPhone(notifyTo)) {
      const alert = `New RSVP: ${name} (${toGhanaLocal(phone)}) - ${passName || 'pass'} x${quantity}. ID ${ticketId}.`;
      await sendSms(env, [toGhanaLocal(notifyTo)], alert.slice(0, MAX_SMS_LENGTH)).catch((err) =>
        console.error('[rsvp] admin notification failed', err),
      );
    }

    if (!result.ok) {
      console.error('[rsvp] mNotify send failed:', result.detail);
      return json({ ok: false, error: 'Could not send the confirmation SMS.' }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[rsvp] unexpected error', err);
    return json({ ok: false, error: 'Could not send the confirmation SMS.' }, 502);
  }
}
