# Agent Tasks & Requests Log

> [!IMPORTANT]
> **To any AI Agent working in this repository:** You must continue to log and document all tasks, requests, and questions asked by the user in this file. Append new completed tasks to the list below.

This document serves as a record of all tasks requested and completed during our sessions, along with any relevant context or questions addressed.

## Completed Tasks

1. **Update DJ Info**
   - *Task:* Update the DJ information to feature DJ Vigos.
   - *Resolution:* Updated `src/components/EventHighlights.tsx` and the `TICKET_PASSES` / `SCHEDULE_ITEMS` arrays in `src/data/eventData.ts`.

2. **Add Savory Delight Vendor**
   - *Task:* Add a new vendor called "Savory Delight" selling freshly smoked catfish and smoked tilapia.
   - *Resolution:* Converted uploaded image to WebP (`savory-delight.webp`) and added to the `VENDORS` array in `eventData.ts`.

3. **Check Events Data**
   - *Task:* Verify the `eventData.ts` file after the user manually deleted `Auntie Muni Street Bites`, `Akwaaba Palm Wine & Juice Bar`, and `Dzorwulu Suya & Tilapia Grill`.
   - *Resolution:* Confirmed the array syntax was valid and deletions were successful.

4. **"Do the Sequence" (Resequence Vendors)**
   - *Task:* Fix the `id` sequencing of the vendors after the manual deletions.
   - *Resolution:* Resequenced all vendors from `v1` through `v10` and cleaned up a momentary duplication glitch caused by crossing edits.

5. **Fix Nellma Foods Image**
   - *Task:* "Render nelma food image well. They are not showing."
   - *Resolution:* Initially switched the code to point to `nellma-foods.webp`, then per user instruction ("use the kelewele and render it well"), reverted it back to `kelewele-dish.webp`. 

6. **Sync Local Vendors with DB**
   - *Task:* Figure out why the newly set Nellma Foods image wasn't appearing locally.
   - *Resolution:* Identified that `src/utils/eventStore.ts` aggressively caches seed data in `localStorage` to preserve Admin portal edits. Documented the fix for the user (run `localStorage.removeItem('kosua_event_data_v11')` in DevTools, or click "Reset Event Data" in the Admin portal).

7. **Add "R & M Vibes" Vendor**
   - *Task:* Add a new vendor selling fried yam, kelewele, sweet potatoes with proteins (chicken wings, tsofi, gizzard, sausage, pork).
   - *Resolution:* Converted their uploaded neon sign image to `r-and-m-vibes.webp` and added them as `v11` in `eventData.ts`.

8. **Update Ekow Sam Eggs Image (Cache Bypass)**
   - *Task:* Use a newly uploaded image of the deviled eggs (with a Robb sweet) for the "Ekow Sam Eggs & Meko Hub" vendor. "replace rather. remove the olde one".
   - *Resolution:* Bypassed browser caching entirely by deleting the old image, converting the new upload to a completely new filename (`ekow-sam-eggs.webp`), and updating `eventData.ts` to force the browser to fetch the new file.

9. **Create Agent Reminder Document**
   - *Task:* Add `agent-reminder.md` and document all asked questions and tasks.
   - *Resolution:* Created this file.
