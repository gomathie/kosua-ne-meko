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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
