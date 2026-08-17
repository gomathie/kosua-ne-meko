# 🥚🌶️ Kosua Ne Meko Hangout

> **Accra’s Premier Street Food, Cultural & Arts Festival Platform**

**Kosua Ne Meko Hangout** is an interactive web application built for Accra's premier street food festival celebrating iconic Ghanaian street cuisine—hard-boiled eggs paired with signature spicy pepper sauce (*Meko*), vibrant Afrobeat music, games, and local artisan enterprise.

The web app serves as the official festival hub: allowing festival-goers to explore event schedules, discover food vendors, participate in the interactive Pepper Meter spice challenge, purchase & view digital QR-coded event passes, and manage event operations via an integrated Admin Portal.

---

## ✨ Features

### 🎟️ Festival Pass & Ticketing
- **Ticket Booking**: Interactive ticket selection for multiple pass tiers (Regular, VIP Spice Pass, Squad Pass).
- **Digital Passes with QR Codes**: Unique generated QR code per ticket for seamless event entrance verification.
- **My Tickets Hub**: Saved digital passes persisted locally in the browser with pass download options.

### 🌶️ Interactive Pepper Meter
- **Dynamic Spice Gauge**: Explore spice tolerance levels from *Mild* to *Fiery Lava / Meko Overload*.
- **Festival Trivia & Challenges**: Interactive highlights covering Ghana's street food culture and egg-eating competitions.

### 📅 Event Schedule & Timeline
- Real-time countdown timer to festival kickoff.
- Categorized schedule of events including live cooking demos, egg-eating contests, DJ lineups, and cultural showcases.

### 🏪 Vendor & Sponsor Directory
- Showcase of participating food stalls, beverage bars, and local artisans.
- Profiles for primary organizers (**Ekow Sam Farms**) and partners (**Pebble**).

### 📍 Venue Location & Directions
- Interactive map coordinates and direction info for Cencor Venue, North Dzorwulu, Accra.

### 📸 Photo & Video Highlights
- Gallery displaying memories and highlights from previous festival editions.

### 🛠️ Integrated Admin Portal
- **Dashboard Analytics**: Ticket sales metrics, check-in stats, and revenue tracking.
- **Event Management**: Edit event details, schedules, vendors, sponsors, and admin roles.
- **Data Export**: Export attendee and booking data as CSV files.
- Accessible via the `/adm` path or the `#adm` URL hash, plus the discreet link in the footer.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI & Animations**: [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/), [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **State & Persistence**: Custom React Hooks with Browser `localStorage` persistence

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/kosua-ne-meko.git
   cd kosua-ne-meko
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 📁 Project Structure

```
kosua-ne-meko/
├── src/
│   ├── components/         # UI components (Hero, Navbar, TicketModal, AdminModal, etc.)
│   ├── data/               # Default event data, vendors, schedule, and FAQs
│   ├── utils/              # Event store, state management, and helper functions
│   ├── types.ts            # TypeScript interfaces and data models
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Vite configuration
```

---

## 🔐 Accessing the Admin Portal

To access the administrative dashboard:
1. Go to `/adm` (e.g. `http://localhost:3000/adm`), or append `#adm` to the URL
   (`http://localhost:3000/#adm`). The footer also has a discreet "Admin Portal" link.
   > The `/adm` path requires SPA history fallback on your host — if your deploy
   > returns a 404 there, use the `#adm` hash form instead, which works anywhere.
2. Sign in with the **email and password** from your `.env` file
   (`VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD`). Copy `.env.example` to `.env` and fill
   them in — without them no admin account exists and the login screen says so.

The admin list is the only authority — there are no hardcoded fallbacks, so removing
an admin in the portal revokes their access immediately. The last remaining admin
cannot be deleted, to prevent locking yourself out.

> **Security note:** this is a convenience gate, not a security boundary. Moving the
> password to `.env` keeps it out of git, but Vite inlines `VITE_*` values into the
> production bundle at build time — so it still ships to the browser and anyone can
> read it from the JS or devtools. Changing a password requires a rebuild **and** a
> `STORAGE_KEY` bump in `src/utils/eventStore.ts` (otherwise browsers keep
> authenticating against the admin list already saved in their storage). Move auth
> to a server before treating the portal as protected.

---

## 📬 RSVP confirmations (SMS + email)

One Cloudflare Pages Function, `functions/api/rsvp.ts` (`POST /api/rsvp`), handles both
channels and persists the booking to D1.

**Flow:** `handleSubmit` in `src/components/TicketModal.tsx` saves the pass locally,
then posts the booking to `/api/rsvp`. The Function re-validates every field, sends the
SMS and the email from **fixed server-side templates**, writes the row to D1, and
returns `{ ok, sms, email, stored }`. Each channel fails independently and neither can
block an RSVP — the pass is already saved, and the UI reports what actually went out.

### Email — SMTP

Sent over real SMTP by [`worker-mailer`](https://github.com/zou-yu/worker-mailer),
which speaks SMTP on Cloudflare's `cloudflare:sockets` TCP API. **Nodemailer does not
work on Workers** — this library is what makes plain SMTP viable here. It needs
`"compatibility_flags": ["nodejs_compat"]`, already set in `wrangler.jsonc`.

Variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`,
`SMTP_FROM`, `SMTP_NOTIFY_TO`.

> **Port 25 is blocked on Cloudflare.** Use **587** (`SMTP_SECURE="false"`, upgrades via
> STARTTLS) or **465** (`SMTP_SECURE="true"`, implicit TLS). If mail silently fails,
> check the port first — then confirm your provider allows SMTP AUTH from a datacentre IP.

### SMS — mNotify

Sent via [mNotify](https://readthedocs.mnotify.com/)'s quick-SMS endpoint. Response
code `2000` means success; anything else is logged and reported as a failure.

Variables: `MNOTIFY_API_KEY`, `MNOTIFY_SENDER_ID`, `MNOTIFY_NOTIFY_TO`. The sender ID
must be registered with mNotify and is limited to 11 alphanumeric characters.

### Configuring both

| Where | How |
|---|---|
| Cloudflare | Settings → Variables and Secrets → add as **Secrets** (encrypted) |
| Local dev | `.dev.vars` (copy `.dev.vars.example`), then `npm run pages:dev` |

None of these carry a `VITE_` prefix — that is precisely what keeps them server-side.
Never add one. `npm run dev` does not run Functions; use `npm run pages:dev`.

### Abuse protection

`/api/rsvp` spends money on every accepted call, which is exactly what SMS-pumping
fraud targets. Two independent layers run **before** anything is sent:

1. **Cloudflare Turnstile.** The widget sits above the submit button in the RSVP form;
   `functions/_shared/guards.ts` verifies the token against `siteverify` server-side.
   The check **fails closed** — if `TURNSTILE_SECRET_KEY` is missing the endpoint
   returns 503 rather than sending, so a misconfiguration cannot silently open it.
2. **Rate limits**, backed by the D1 `rate_limits` table: **10 per IP per hour** and
   **3 per phone number per hour** (`RATE_LIMITS` in `functions/_shared/guards.ts`).
   D1 is used rather than KV because KV is eventually consistent and unreliable for
   counting. Limits fail *open* on a database error — a D1 blip should not block real
   attendees, and Turnstile is still in front.

Also still in force: one recipient per request, fixed server-side message templates
(no client text is ever echoed into a message), strict length caps, and phone/email
validation.

**Setup:** create a widget at **dash.cloudflare.com → Turnstile → Add widget** (domains:
your production hostname plus `localhost` and `127.0.0.1`). Put the **site** key in
`VITE_TURNSTILE_SITE_KEY` (public, build-time) and the **secret** key in
`TURNSTILE_SECRET_KEY` (a Cloudflare Secret — never `VITE_`).

---

## 🔑 Admin API (server-side auth)

The portal password only gates the UI — it ships in the JS bundle. Attendee data is
protected separately by credentials that never leave the server.

| Endpoint | Purpose |
|---|---|
| `POST /api/admin/login` | Verifies credentials against the `admin_users` table, returns a signed session token (8h) |
| `GET /api/rsvps` | Lists RSVPs. Requires `Authorization: Bearer <token>`. `?format=csv` exports |

**Accounts live in D1** (`admin_users`, `migrations/0003_create_admin_users.sql`), so they can
be added or revoked without a redeploy. Passwords are stored as PBKDF2-SHA256 digests
(`pbkdf2$<iterations>$<salt>$<hash>`, see `functions/_shared/password.ts`) — never in
plain text. `ADMIN_EMAIL` / `ADMIN_PASSWORD` remain only as a bootstrap fallback, used
when the database holds no matching account.

Add or rotate an admin by writing a hashed row — never insert a plain password:

```bash
# Generate the hash, then apply it (keeps the password out of shell history)
SEED_EMAIL="you@example.com" SEED_PASSWORD="…" npx tsx scripts/seed-admin.ts
npx wrangler d1 execute kosua-ne-meko-rsvps --remote --file seed-admin.sql
```

> **No session revocation.** Tokens are stateless, so they stay valid for their full 8h
> even after a password change. Shorten `SESSION_TTL_SECONDS` in
> `functions/_shared/auth.ts` if that matters, or move to a session table.

Tokens are stateless HMAC-SHA256 (`functions/_shared/auth.ts`) — signed, not encrypted,
carrying only an email and an expiry. Comparisons are constant-time, and the login
response never reveals which half of the credential was wrong.

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as Cloudflare **Secrets**
(and in `.dev.vars` locally). Generate the signing secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The portal's login tries the server first; if the server returns 503 (auth not
configured) or is unreachable, it falls back to the local UI-only gate — in which case
the **RSVPs** tab explains what to set instead of showing data.

---

## 🗄️ Database (Cloudflare D1)

RSVP bookings are stored in D1 — until now a booking existed only in the attendee's own
`localStorage`, so the organiser had no attendee list and a cleared browser lost the pass.

**Schema:** `migrations/0001_create_rsvps.sql` — one `rsvps` table keyed by `ticket_id`,
with indexes on `created_at`, `phone` and `email`. The insert is `INSERT OR REPLACE`, so
a retried submission updates its row instead of duplicating it.

**First-time setup:**

```bash
npx wrangler d1 create kosua-ne-mekodb   # paste the returned id into wrangler.jsonc
npm run db:migrate:local                 # apply schema to the local dev database
npm run db:migrate                       # apply schema to production
```

The binding is `DB`, declared in `wrangler.jsonc`. Until a real `database_id` is pasted
in, the Function logs a warning and skips persistence — confirmations still send, and
`stored: false` comes back in the response.

**Querying what came in:**

```bash
npx wrangler d1 execute kosua-ne-mekodb --remote \
  --command "SELECT created_at, customer_name, phone, pass_name, quantity FROM rsvps ORDER BY created_at DESC LIMIT 50"
```

**Reading it:** the Admin Portal's **RSVPs** tab lists bookings and exports CSV, via
`GET /api/rsvps` (see the Admin API section above). `migrations/0002_create_rate_limits.sql`
adds the rate-limit ledger used by `/api/rsvp`.

---

## 📄 License

This project is created for **Kosua Ne Meko Hangout** by **Ekow Sam Farms**. All rights reserved.

