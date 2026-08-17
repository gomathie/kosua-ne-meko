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

> **⚠️ The endpoint is unauthenticated and costs money per call.** Anyone can POST to
> `/api/rsvp` and make it send an SMS, which is how SMS-pumping fraud drains prepaid
> credit. Mitigations already in place: one recipient per request, a fixed message
> template (no client text is echoed), strict length caps, and Ghana-number validation.
> Before promoting real traffic you should add **Cloudflare Turnstile** on the RSVP
> form plus a **KV- or Durable-Object-backed rate limit** per IP and per phone number.

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

> **Read path not built yet.** Nothing in the Admin Portal reads this table — the portal
> still lists only the passes held in that browser. A `GET /api/rsvps` for the portal
> needs a server-side credential check first, since the current admin password is
> client-side only and cannot protect an endpoint.

---

## 📄 License

This project is created for **Kosua Ne Meko Hangout** by **Ekow Sam Farms**. All rights reserved.

