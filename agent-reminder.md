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

10. **Add "Bite Mogul" Vendor**
    - *Task:* Add a new vendor called "Bite Mogul" selling Delicious Jollof Rice.
    - *Resolution:* Added them as `v12` in `eventData.ts`.

11. **Add "Waakye On The Go" Vendor**
    - *Task:* Add a new vendor called "Waakye On The Go" selling Classic Waakye.
    - *Resolution:* Added them as `v13` in `eventData.ts`.

12. **Convert Uploaded Logos**
    - *Task:* Convert the uploaded logos for Bite Mogul and Waakye On The Go to WebP format.
    - *Resolution:* Located the user-uploaded images in the local artifact storage (`.user_uploaded`), created `scripts/convert-logos.mjs` to convert them to WebP via `sharp`, saved them to `public/logos/`, and updated the extensions in `eventData.ts`.

13. **Update Photo Gallery & Process Images**
    - *Task:* Create gallery folders ("Takoradi edition" and "First edition"), convert uploaded photos to WebP format, and update the event photo gallery section while removing old placeholder content.
    - *Resolution:* Created folders `public/gallery/takoradi-edition` and `public/gallery/first-edition`. Batch converted 79 images to WebP. Overhauled `GallerySection.tsx` and updated `eventData.ts` to include the new real images while pruning the `gal-1` through `gal-6` placeholders.

14. **Update Event Highlights and Remove Meko Scale**
    - *Task:* Update event highlights and agent reminder. Remove "Meko Scale" from nav or menu.
    - *Resolution:* Made `EventHighlights.tsx` dynamic by passing `EVENT_DETAILS` to render the correct city and event title. Removed "Meko Scale" (PepperMeter) from `Navbar.tsx` (desktop and mobile) and `Footer.tsx`, and removed the `<PepperMeter />` component from `App.tsx`. Updated `agent-reminder.md` with these changes.

15. **Change Favicon and Implement Mobile Gallery Pagination**
    - *Task:* Change the favicon to a befitting Kosua Ne Meko related image. On mobile, the gallery should show about 6-8 photos with an option to view more.
    - *Resolution:* Generated a custom favicon (a sliced boiled egg topped with red chili pepper salsa) using `generate_image`, saved it as `favicon.jpg`, and updated `index.html` to reference it instead of the inline egg emoji. Updated `GallerySection.tsx` to dynamically set the initial `visibleCount` to 6 on mobile screens (< 768px) and 18 on desktop screens. The "Load More" button adds more photos based on this dynamic page size.
