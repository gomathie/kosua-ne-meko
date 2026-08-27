/**
 * Vendor (and sibling seed-list) lifecycle guard.
 *
 * Runs the real eventStore against a localStorage shim, so every path here is
 * the one the browser takes. Also asserts statically that no delete path can be
 * added later without recording a tombstone — the omission that let deleted
 * entries come back.
 *
 *   npx tsx scripts/check-vendor-lifecycle.ts
 */
import { readFileSync } from 'node:fs';

class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
const store = new MemStorage();
(globalThis as any).localStorage = store;
(globalThis as any).window = { dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };
(globalThis as any).Event = class { constructor(public type: string) {} };

const { getStoredEventData, saveStoredEventData, restoreMissingSeedItems, resetEventDataToDefault } =
  await import('../src/utils/eventStore');
const { VENDORS } = await import('../src/data/eventData');

const KEY = 'kosua_event_data_v11';
const ids = () => getStoredEventData().vendors.map((v) => v.id);
const raw = () => JSON.parse(localStorage.getItem(KEY) || '{}');
const rebuildRecord = () => { const b = raw(); b.seedRecordVersion = 1; localStorage.setItem(KEY, JSON.stringify(b)); };

let pass = 0, fail = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// --- Static guard: every delete path records a tombstone -------------------
const src = readFileSync(new URL('../src/utils/eventStore.ts', import.meta.url), 'utf8');
const END_OF_FN = String.fromCharCode(10) + '  };';
for (const fn of ['deleteVendor', 'deleteSponsor', 'deleteCollaborator', 'deleteGalleryItem',
                  'deleteEventItem', 'deleteScheduleItem', 'deleteFaq']) {
  const start = src.indexOf(`const ${fn} = `);
  const body = src.slice(start, src.indexOf('\n  };', start));
  check(`${fn} records a tombstone`, /deletedSeedKeys/.test(body), true);
}

// --- Lifecycle -------------------------------------------------------------
store.clear();
check('initial vendors match the seed', ids().length, VENDORS.length);
saveStoredEventData(getStoredEventData());

const victim = VENDORS[2];
const before = getStoredEventData();
saveStoredEventData({
  ...before,
  vendors: before.vendors.filter((v) => v.id !== victim.id),
  deletedSeedKeys: [...(before.deletedSeedKeys ?? []), 'vendor:' + victim.id],
});
check('deleted vendor gone', ids().includes(victim.id), false);
check('deleted vendor gone after reload', ids().includes(victim.id), false);

rebuildRecord();
check('stays deleted through a record rebuild', ids().includes(victim.id), false);

const legacy = raw(); delete legacy.knownSeedKeys; delete legacy.seedRecordVersion;
localStorage.setItem(KEY, JSON.stringify(legacy));
check('stays deleted with no record at all', ids().includes(victim.id), false);

// New code-defined vendor still reaches an existing browser.
const b = raw();
b.knownSeedKeys = (b.knownSeedKeys ?? []).filter((k: string) => k !== 'vendor:' + VENDORS[0].id);
b.vendors = b.vendors.filter((v: any) => v.id !== VENDORS[0].id);
localStorage.setItem(KEY, JSON.stringify(b));
check('unseen seed vendor still merges in', ids().includes(VENDORS[0].id), true);

for (let i = 0; i < 4; i++) { rebuildRecord(); getStoredEventData(); }
check('no duplicates after repeated rebuilds', ids().length, new Set(ids()).size);

restoreMissingSeedItems();
check('Restore Missing undoes the deletion', ids().includes(victim.id), true);

resetEventDataToDefault();
check('Reset Defaults returns to the seed', ids().length, VENDORS.length);


// --- Seed refresh ----------------------------------------------------------
// A change to a seed entry (an image, typically) has to reach browsers that
// already hold that entry — the merge used to only ever append, so it could
// not. Edits made in the portal must survive that refresh.

const imageOf = (id: string) => getStoredEventData().vendors.find((v) => v.id === id)?.imageUrl;

// Every update path marks the entry admin-owned, or the next seed change undoes it.
for (const fn of ['updateVendor', 'updateSponsor', 'updateCollaborator', 'updateEventItem',
                  'updateScheduleItem', 'updateFaq', 'setActiveEvent', 'updateEventDetails']) {
  const start = src.indexOf(`const ${fn} = `);
  const body = src.slice(start, src.indexOf(END_OF_FN, start));
  check(`${fn} marks the entry admin-owned`, /withSeedEdit/.test(body), true);
}

store.clear();
saveStoredEventData(getStoredEventData());
const refreshed = VENDORS[1];
const original = refreshed.imageUrl;

// Stand in for a deploy that changed the image in eventData.ts.
(refreshed as { imageUrl: string }).imageUrl = '/logos/updated-by-the-seed.webp';
check('changed seed image reaches an existing browser', imageOf(refreshed.id), '/logos/updated-by-the-seed.webp');
check('refresh introduces no duplicates', ids().length, new Set(ids()).size);

// An entry the admin edited is theirs; a later seed change must not overwrite it.
const owned = getStoredEventData();
saveStoredEventData({
  ...owned,
  vendors: owned.vendors.map((v) => (v.id === refreshed.id ? { ...v, imageUrl: '/logos/admin-choice.webp' } : v)),
  seedFingerprints: { ...(owned.seedFingerprints ?? {}), ['vendor:' + refreshed.id]: 'admin-edited' },
});
(refreshed as { imageUrl: string }).imageUrl = '/logos/seed-moved-again.webp';
check('admin-edited image survives a later seed change', imageOf(refreshed.id), '/logos/admin-choice.webp');

// A deleted entry stays deleted even though its seed content changed.
const gone = getStoredEventData();
saveStoredEventData({
  ...gone,
  vendors: gone.vendors.filter((v) => v.id !== VENDORS[3].id),
  deletedSeedKeys: [...(gone.deletedSeedKeys ?? []), 'vendor:' + VENDORS[3].id],
});
(VENDORS[3] as { imageUrl: string }).imageUrl = '/logos/changed-while-deleted.webp';
check('a changed seed entry is not resurrected by the refresh', ids().includes(VENDORS[3].id), false);

// A blob written before fingerprints existed picks up the current seed once.
const preFingerprint = raw();
delete preFingerprint.seedFingerprints;
preFingerprint.vendors = preFingerprint.vendors.map((v: any) =>
  v.id === refreshed.id ? { ...v, imageUrl: '/logos/stale.webp' } : v);
localStorage.setItem(KEY, JSON.stringify(preFingerprint));
check('a pre-fingerprint blob is brought up to date', imageOf(refreshed.id), '/logos/seed-moved-again.webp');

getStoredEventData();
check('still no duplicates after the refresh', ids().length, new Set(ids()).size);
(refreshed as { imageUrl: string }).imageUrl = original;

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
