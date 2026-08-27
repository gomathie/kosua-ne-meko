import { readFileSync, writeFileSync } from 'node:fs';
const p = 'src/utils/eventStore.ts';
const lines = readFileSync(p, 'utf8').split('\n');

// 1. updateEventDetails: only the active event was rewritten.
const i = lines.findIndex((l) => l.includes('Every status changed here'));
if (i === -1) { console.error('comment line not found'); process.exit(1); }
lines.splice(i, 2,
  '      // The active event was rewritten from these details, so it belongs to',
  '      // the admin now and must not be refreshed from the seed.',
  "      seedFingerprints: withSeedEdits(",
  '        data,',
  "        'event',",
  "        updatedList.filter((e) => e.status === 'active').map((e) => e.id),",
  '      ),',
);

// 2. setActiveEvent: every status just changed, so no event should be refreshed.
const start = lines.findIndex((l) => l.includes('const setActiveEvent = '));
if (start === -1) { console.error('setActiveEvent not found'); process.exit(1); }
const at = lines.findIndex((l, n) => n > start && l === '      eventsList: updatedList,');
if (at === -1) { console.error('setActiveEvent assignment not found'); process.exit(1); }
lines.splice(at + 1, 0,
  '      // Every status just changed, so none of these are the seed\'s any more.',
  "      seedFingerprints: withSeedEdits(data, 'event', updatedList.map((e) => e.id)),",
);

writeFileSync(p, lines.join('\n'));
console.log('both event paths patched');
