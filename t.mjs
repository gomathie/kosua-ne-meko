import puppeteer from 'puppeteer-core';
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await B.newPage();
const names = () => page.evaluate(() => {
  const t = document.body.innerText;
  return { wevegotit: t.includes('We’ve Got It') || t.includes("We've Got It"),
           quench: t.includes('Quench Juices'), nellma: t.includes('Nellma Foods'),
           mamaJoe: t.includes('Mama Joe') };
});

// STEP 1 — a returning visitor whose stored blob predates the three new vendors
// AND who deleted a seeded vendor. knownSeedKeys lists what they were offered.
await page.goto('https://kosuanemeko.com/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
await page.evaluate(() => {
  const cur = JSON.parse(localStorage.getItem('kosua_event_data_v11'));
  const vendors = (cur?.vendors ?? []).filter(v => !['v-wevegotit','v-quench','v0'].includes(v.id));
  const deleted = vendors.shift();          // pretend the admin deleted this one
  const known = new Set((cur?.knownSeedKeys ?? []));
  // Old-style record: everything that existed before, including the deleted one.
  vendors.forEach(v => known.add('vendor:' + v.id));
  if (deleted) known.add('vendor:' + deleted.id);
  localStorage.setItem('kosua_event_data_v11', JSON.stringify({ ...cur, vendors, knownSeedKeys: [...known] }));
  return { kept: vendors.length, deleted: deleted?.name };
}).then(r => console.log('planted:', JSON.stringify(r)));

await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 3000));
console.log('after merge      :', JSON.stringify(await names()));

const state = await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('kosua_event_data_v11'));
  return { vendorCount: d.vendors.length, knownKeys: d.knownSeedKeys.length,
           deletedStayedGone: !d.vendors.some(v => v.name.includes('Mama Joe')) };
});
console.log('stored state     :', JSON.stringify(state));

// STEP 2 — reload again: nothing should be added twice.
await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2500));
console.log('second reload    :', JSON.stringify(await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('kosua_event_data_v11'));
  const ids = d.vendors.map(v => v.id);
  return { vendorCount: ids.length, duplicates: ids.length !== new Set(ids).size };
})));
await B.close();
