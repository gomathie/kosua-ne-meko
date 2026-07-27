# Admin Management Dashboard & Dynamic Event System

This plan introduces a full-featured **Admin Portal** to allow site administrators to log in and dynamically manage event details (e.g., creating "Kosua Ne Meko 3.0"), manage vendors, add collaborators & sponsors, and schedule daily event activities with local persistence.

---

## User Review Required

> [!IMPORTANT]
> **Admin Authentication**: By default, admin access will use a simple, secure PIN/passcode mechanism (`admin123`) persisted in session memory for client-side administration.
> 
> **Data Persistence**: All admin changes (Event 3.0 details, new vendors, sponsors, collaborators, activities) will be saved in `localStorage` so they persist across page refreshes. A "Reset to Defaults" button will be provided in the admin panel to restore original dummy data at any time.

---

## Proposed Changes

### Data Layer & Types

#### [MODIFY] [types.ts](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/types.ts)
- Add `Sponsor` interface (`id`, `name`, `tier`, `logoUrl`, `websiteUrl`).
- Add `Collaborator` interface (`id`, `name`, `url`, `tagline`, `logoUrl`).
- Expand `EventDetails` interface to allow dynamic updates for event title, date, venue, city, address, coordinates, collaborators, and sponsors.

#### [NEW] [eventStore.ts](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/utils/eventStore.ts)
- Create a reactive state manager / custom hook to load, update, and save event data in `localStorage`.
- Provide default initial seed data (current Kosua Ne Meko 2.0 data with dummy vendors and collaborators) and helper functions (`updateEvent`, `addVendor`, `deleteVendor`, `addSponsor`, `deleteSponsor`, `addScheduleItem`, `deleteScheduleItem`, `resetToDefaults`).

---

### Admin Portal Component

#### [NEW] [AdminModal.tsx](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/components/AdminModal.tsx)
- **Login View**: Passcode input screen (`admin123`) with error handling.
- **Tab 1: Event & Venue Details** (Create Event 3.0, set date, time, venue address, city, tagline).
- **Tab 2: Vendors Management** (Form to add new vendors with name, category, specialty, description, image URL, and badge; list of current dummy vendors with delete/edit options).
- **Tab 3: Collaborators & Sponsors** (Forms to add collaborators like Pebble, and sponsors with tier badges like Headline/Gold/Silver).
- **Tab 4: Day Activities & Schedule** (Form to add new schedule items with time, title, description, location, category).

---

### Main UI Integration & Sponsors Display

#### [NEW] [SponsorsSection.tsx](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/components/SponsorsSection.tsx)
- Create a dynamic Sponsors & Partners showcase component displaying Headline, Gold, Silver, and Collaboration partners on the landing page.

#### [MODIFY] [App.tsx](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/App.tsx)
- Connect dynamic event state from `eventStore`.
- Add `isAdminModalOpen` state and trigger.
- Add `<SponsorsSection />` to the main landing page flow.
- Render `<AdminModal />`.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/components/Navbar.tsx) & [Footer.tsx](file:///c:/Users/gomat/Downloads/DEV%20PROJECTS/kosua-ne-meko/src/components/Footer.tsx)
- Add discreet "Admin Portal" lock icon / button in Navbar and Footer so the admin can open the login modal.
- Connect dynamic event details (title, dates, collaborator info).

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify clean TypeScript compilation and bundling.

### Manual Verification
1. Open Admin Portal via Footer/Navbar link.
2. Log in with passcode `admin123`.
3. Create a new event (e.g. "Kosua Ne Meko 3.0", date "SAT. 12TH DEC. 2026", venue "Independence Square, Accra").
4. Add a new vendor and verify it appears in the Street Market grid.
5. Add a new collaborator (e.g. Pebble) and new sponsors, verifying they appear in the new Sponsors Section and Hero badges.
6. Add a new schedule activity and verify it appears in the Timeline.
7. Refresh the browser to ensure `localStorage` persistence holds all changes.
8. Click "Reset Defaults" in Admin Panel to confirm original data can be restored.
