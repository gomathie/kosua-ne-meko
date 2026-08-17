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
2. Sign in with the **email and password** of an account in the admin list
   (`INITIAL_ADMIN_USERS` in `src/data/eventData.ts`). Both must match the same account.

The admin list is the only authority — there are no hardcoded fallbacks, so removing
an admin in the portal revokes their access immediately. The last remaining admin
cannot be deleted, to prevent locking yourself out.

> **Security note:** this is a convenience gate, not a security boundary. Passwords
> live in client-side code and `localStorage` in plain text, so anyone can read them
> from the JS bundle or devtools. Changing a password requires a redeploy **and** a
> `STORAGE_KEY` bump in `src/utils/eventStore.ts` (otherwise browsers keep
> authenticating against the admin list already saved in their storage). Move auth
> to a server before treating the portal as protected.

---

## 📄 License

This project is created for **Kosua Ne Meko Hangout** by **Ekow Sam Farms**. All rights reserved.

