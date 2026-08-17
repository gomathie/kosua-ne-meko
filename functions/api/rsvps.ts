import type { D1Database } from '../_shared/d1';
import { bearerToken, verifySessionToken } from '../_shared/auth';

/**
 * Cloudflare Pages Function: GET /api/rsvps
 *
 * Returns the RSVP list for the Admin Portal. Gated by a server-signed session
 * token from POST /api/admin/login — never by the client-side portal password,
 * which anyone can read out of the JS bundle.
 *
 * Supports `?format=csv` for export, and `?limit=` / `?offset=` for paging.
 */

interface Env {
  DB?: D1Database;
  ADMIN_SESSION_SECRET?: string;
}

interface RsvpRow {
  ticket_id: string;
  customer_name: string;
  phone: string;
  email: string;
  pass_name: string;
  quantity: number;
  meko_level: string;
  event_title: string;
  event_date: string;
  venue: string;
  sms_status: string;
  email_status: string;
  created_at: string;
}

const MAX_LIMIT = 500;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** RFC 4180 quoting: wrap in quotes and double any embedded quote. */
const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  if (!env.ADMIN_SESSION_SECRET) {
    return json({ ok: false, error: 'Server-side admin auth is not configured.' }, 503);
  }

  const session = await verifySessionToken(env.ADMIN_SESSION_SECRET, bearerToken(request));
  if (!session) {
    return json({ ok: false, error: 'Not authorized.' }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: 'No database is bound to this deployment.' }, 503);
  }

  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '100', 10) || 100, 1), MAX_LIMIT);
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0);

  try {
    const { results } = await env.DB.prepare(
      `SELECT ticket_id, customer_name, phone, email, pass_name, quantity,
              meko_level, event_title, event_date, venue, sms_status, email_status, created_at
         FROM rsvps
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all<RsvpRow>();

    const total = await env.DB.prepare('SELECT COUNT(*) AS total FROM rsvps').first<{ total: number }>();

    if (url.searchParams.get('format') === 'csv') {
      const header = [
        'ticket_id', 'customer_name', 'phone', 'email', 'pass_name', 'quantity',
        'meko_level', 'event_title', 'event_date', 'venue', 'sms_status', 'email_status', 'created_at',
      ];
      const csv = [
        header.join(','),
        ...results.map((row) => header.map((column) => csvCell(row[column as keyof RsvpRow])).join(',')),
      ].join('\r\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="kosua-ne-meko-rsvps.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }

    return json({ ok: true, rsvps: results, total: Number(total?.total ?? 0), limit, offset }, 200);
  } catch (err) {
    console.error('[rsvps] query failed', err);
    return json({ ok: false, error: 'Could not read RSVPs.' }, 500);
  }
}
