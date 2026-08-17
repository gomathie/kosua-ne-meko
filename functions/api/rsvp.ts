import { WorkerMailer } from 'worker-mailer';
import { sanitizeText, sanitizePhone, sanitizeEmail, sanitizeInt, isValidPhone, isValidEmail, LIMITS } from '../../src/utils/sanitize';
import type { D1Database } from '../_shared/d1';
import { verifyTurnstile, findExceededLimit, recordRateLimitHits, RATE_LIMITS } from '../_shared/guards';

/**
 * Cloudflare Pages Function: POST /api/rsvp
 *
 * Sends the attendee an SMS (mNotify) and an email (SMTP) confirmation.
 * This runs server-side precisely so the credentials never reach the browser —
 * a leaked SMS key or mail login gets used to send spam on your account.
 *
 * Email goes over real SMTP via worker-mailer, which speaks SMTP on Cloudflare's
 * `cloudflare:sockets` TCP API. Nodemailer does NOT work here; this library is
 * the piece that makes plain SMTP viable on Workers. Requires the
 * `nodejs_compat` flag in wrangler.jsonc.
 *
 * Both messages are assembled here from fixed templates; the client only
 * supplies short, sanitized values. Never echo raw client text into a message.
 */

interface Env {
  /** D1 binding declared in wrangler.jsonc. Undefined until the DB is created. */
  DB?: D1Database;
  /** Turnstile secret. When unset the endpoint refuses to send — fail closed. */
  TURNSTILE_SECRET_KEY?: string;
  MNOTIFY_API_KEY?: string;
  MNOTIFY_SENDER_ID?: string;
  /** Optional organiser number that gets a copy of each new RSVP. */
  MNOTIFY_NOTIFY_TO?: string;
  SMTP_HOST?: string;
  /** 587 for STARTTLS, 465 for implicit TLS. Port 25 is blocked by Cloudflare. */
  SMTP_PORT?: string;
  /** "true" for implicit TLS (465); "false" to STARTTLS-upgrade on 587. */
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  /** Sender, e.g. "Kosua Ne Meko <hello@ekowsamfarms.com>". */
  SMTP_FROM?: string;
  /** Optional organiser address that gets a copy of each new RSVP. */
  SMTP_NOTIFY_TO?: string;
}

interface RsvpPayload {
  customerName?: unknown;
  phone?: unknown;
  email?: unknown;
  ticketId?: unknown;
  passName?: unknown;
  quantity?: unknown;
  mekoLevel?: unknown;
  eventTitle?: unknown;
  eventDate?: unknown;
  venue?: unknown;
  /** Turnstile token from the widget in the RSVP form. */
  turnstileToken?: unknown;
}

/** Per-channel outcome reported back to the UI. */
type ChannelResult = 'sent' | 'failed' | 'skipped';

const MNOTIFY_QUICK_SMS_URL = 'https://api.mnotify.com/api/sms/quick';
/** mNotify returns code 2000 on success; anything else is a failure. */
const MNOTIFY_SUCCESS_CODE = 2000;
/** Falls back to the STARTTLS submission port; 25 is blocked on Workers. */
const DEFAULT_SMTP_PORT = 587;
/** Keep the SMS body inside a single segment where possible. */
const MAX_SMS_LENGTH = 160;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** Escapes text before it goes into the HTML email body. */
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
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

  // mNotify can return an HTML error page, so do not assume JSON.
  const raw = await response.text();
  let parsed: { code?: number; message?: string } = {};
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

/** Splits `"Kosua Ne Meko <hello@example.com>"` into its name and address parts. */
function parseFrom(value: string): { name: string; email: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].replace(/^"|"$/g, ''), email: match[2].trim() };
  return { name: '', email: value.trim() };
}

async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<{ ok: boolean; detail: string }> {
  const port = Number(env.SMTP_PORT) || DEFAULT_SMTP_PORT;
  // Implicit TLS on 465; otherwise connect plain and upgrade with STARTTLS.
  const secure = env.SMTP_SECURE === 'true' || port === 465;

  await WorkerMailer.send(
    {
      host: env.SMTP_HOST as string,
      port,
      secure,
      startTls: !secure,
      credentials: { username: env.SMTP_USER as string, password: env.SMTP_PASSWORD as string },
      authType: 'plain',
    },
    {
      from: parseFrom(env.SMTP_FROM as string),
      to: { email: to },
      subject,
      html,
    },
  );

  return { ok: true, detail: 'sent' };
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const smsConfigured = Boolean(env.MNOTIFY_API_KEY && env.MNOTIFY_SENDER_ID);
  const emailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);

  if (!smsConfigured && !emailConfigured) {
    console.error('[rsvp] neither mNotify nor SMTP is configured');
    return json({ ok: false, error: 'Confirmations are not configured on this deployment.' }, 503);
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
  const email = sanitizeEmail(payload.email);
  const ticketId = sanitizeText(payload.ticketId, LIMITS.id);
  const passName = sanitizeText(payload.passName, 40);
  const quantity = sanitizeInt(payload.quantity, 1, 10, 1);
  const mekoLevel = sanitizeText(payload.mekoLevel, LIMITS.shortText);
  const eventTitle = sanitizeText(payload.eventTitle, LIMITS.title);
  const eventDate = sanitizeText(payload.eventDate, 40);
  const venue = sanitizeText(payload.venue, 60);

  if (!name || !ticketId || (!isValidPhone(phone) && !isValidEmail(email))) {
    return json({ ok: false, error: 'A name, ticket ID and at least one valid phone or email are required.' }, 400);
  }

  // --- Abuse guards: everything below this point spends money --------------

  // Fail closed. An unconfigured Turnstile secret must not leave the endpoint
  // wide open — that is precisely the state an attacker would hope to find.
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('[rsvp] TURNSTILE_SECRET_KEY is not configured — refusing to send');
    return json({ ok: false, error: 'Confirmations are not configured on this deployment.' }, 503);
  }

  const clientIp = request.headers.get('CF-Connecting-IP');
  const turnstile = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    typeof payload.turnstileToken === 'string' ? payload.turnstileToken : '',
    clientIp,
  );
  if (!turnstile.ok) {
    console.warn('[rsvp] Turnstile rejected:', turnstile.detail);
    return json({ ok: false, error: 'Verification failed. Please reload the page and try again.' }, 403);
  }

  const buckets = [
    ...(clientIp ? [{ key: `ip:${clientIp}`, ...RATE_LIMITS.ip }] : []),
    ...(phone ? [{ key: `phone:${phone}`, ...RATE_LIMITS.phone }] : []),
  ];

  if (env.DB && buckets.length > 0) {
    const exceeded = await findExceededLimit(env.DB, buckets);
    if (exceeded) {
      console.warn('[rsvp] rate limit hit for', exceeded);
      return json({ ok: false, error: 'Too many RSVP attempts. Please try again later.' }, 429);
    }
    await recordRateLimitHits(env.DB, buckets.map((bucket) => bucket.key));
  }

  const whereWhen = [eventDate, venue].filter(Boolean).join(', ');
  let sms: ChannelResult = 'skipped';
  let emailResult: ChannelResult = 'skipped';

  // --- SMS -----------------------------------------------------------------
  if (smsConfigured && isValidPhone(phone)) {
    const message = [
      `Hi ${name}, your ${passName || 'pass'} for Kosua Ne Meko is confirmed.`,
      `ID: ${ticketId} (x${quantity}).`,
      whereWhen ? `${whereWhen}.` : '',
      'Show this ID at the gate.',
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, MAX_SMS_LENGTH);

    try {
      const result = await sendSms(env, [toGhanaLocal(phone)], message);
      sms = result.ok ? 'sent' : 'failed';
      if (!result.ok) console.error('[rsvp] mNotify send failed:', result.detail);
    } catch (err) {
      sms = 'failed';
      console.error('[rsvp] mNotify threw', err);
    }
  }

  // --- Email ---------------------------------------------------------------
  if (emailConfigured && isValidEmail(email)) {
    const body = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1c1917">
        <h1 style="font-size:20px;margin:0 0 4px">Your pass is confirmed 🎉</h1>
        <p style="margin:0 0 16px;color:#57534e">Kosua Ne Meko Hangout</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#78716c">Name</td><td style="padding:6px 0"><b>${escapeHtml(name)}</b></td></tr>
          <tr><td style="padding:6px 0;color:#78716c">Ticket ID</td><td style="padding:6px 0"><b>${escapeHtml(ticketId)}</b></td></tr>
          <tr><td style="padding:6px 0;color:#78716c">Pass</td><td style="padding:6px 0">${escapeHtml(passName)} &times; ${quantity}</td></tr>
          ${whereWhen ? `<tr><td style="padding:6px 0;color:#78716c">When &amp; where</td><td style="padding:6px 0">${escapeHtml(whereWhen)}</td></tr>` : ''}
        </table>
        <p style="margin:16px 0 0;font-size:13px;color:#57534e">Show your ticket ID at the gate. Entry is free.</p>
      </div>`;

    try {
      const result = await sendEmail(env, email, `Your Kosua Ne Meko pass — ${ticketId}`, body);
      emailResult = result.ok ? 'sent' : 'failed';
      if (!result.ok) console.error('[rsvp] SMTP send failed:', result.detail);
    } catch (err) {
      emailResult = 'failed';
      console.error('[rsvp] SMTP threw', err);
    }
  }

  // --- Organiser copies (best effort; never affect the attendee's result) ---
  const notifySms = sanitizePhone(env.MNOTIFY_NOTIFY_TO);
  if (smsConfigured && isValidPhone(notifySms)) {
    const alert = `New RSVP: ${name} - ${passName || 'pass'} x${quantity}. ID ${ticketId}.`;
    await sendSms(env, [toGhanaLocal(notifySms)], alert.slice(0, MAX_SMS_LENGTH)).catch((err) =>
      console.error('[rsvp] organiser SMS failed', err),
    );
  }

  const notifyEmail = sanitizeEmail(env.SMTP_NOTIFY_TO);
  if (emailConfigured && isValidEmail(notifyEmail)) {
    const alert = `<p>New RSVP: <b>${escapeHtml(name)}</b> (${escapeHtml(phone || email)})<br>
      ${escapeHtml(passName)} &times; ${quantity} — ID ${escapeHtml(ticketId)}</p>`;
    await sendEmail(env, notifyEmail, `New RSVP: ${name}`, alert).catch((err) =>
      console.error('[rsvp] organiser email failed', err),
    );
  }

  // --- Persist to D1 -------------------------------------------------------
  // Written last so the recorded row carries the real delivery outcome. An
  // INSERT OR REPLACE on ticket_id makes a retried submission idempotent.
  // Storage problems must not fail an RSVP the attendee already holds a pass for.
  let stored = false;
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT OR REPLACE INTO rsvps
           (ticket_id, customer_name, phone, email, pass_name, quantity,
            meko_level, event_title, event_date, venue, sms_status, email_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          ticketId, name, phone, email, passName, quantity,
          mekoLevel, eventTitle, eventDate, venue, sms, emailResult,
        )
        .run();
      stored = true;
    } catch (err) {
      console.error('[rsvp] D1 insert failed', err);
    }
  } else {
    console.warn('[rsvp] no D1 binding — RSVP not persisted server-side');
  }

  return json({ ok: sms !== 'failed' && emailResult !== 'failed', sms, email: emailResult, stored }, 200);
}
