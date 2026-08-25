import puppeteer from 'puppeteer-core';
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await B.newPage();

// --- Schedule on the public page ---
await page.goto('https://kosuanemeko.com/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3500));
const sched = await page.evaluate(() => {
  const sec = document.querySelector('#schedule');
  const t = sec ? sec.innerText : '';
  return {
    heading: t.includes('FLEXIBLE EVENT') && t.includes('LINE-UP'),
    hasFirst: t.includes('Arrival, exhibitor setup'),
    hasLast: t.includes('Music, dance and free hangout'),
    hasOldItem: t.includes('Asanka Meko Grinding') || t.includes('Gates Open'),
    rows: (t.match(/PM|AM/g) || []).length,
  };
});
console.log('SCHEDULE ->', JSON.stringify(sched));

// --- Login: eye toggle + remember me ---
await page.goto('https://kosuanemeko.com/adm/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));
console.log('type before toggle:', await page.$eval('#admin-password', el => el.type));
await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label')?.includes('Show password'))?.click());
await new Promise(r => setTimeout(r, 300));
console.log('type after  toggle:', await page.$eval('#admin-password', el => el.type));
console.log('remember-me checkbox present:', await page.evaluate(() => !!document.querySelector('input[type=checkbox]')));

await page.type('#admin-email', process.env.PROBE_EMAIL);
await page.type('#admin-password', process.env.PROBE_PASS);
await page.click('button[type=submit]');
await new Promise(r => setTimeout(r, 5000));
const signedIn = await page.evaluate(() => document.body.innerText.includes('Current Event Details'));
const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('kosua_admin_session');
  if (!raw) return null;
  const o = JSON.parse(raw);
  return { hasToken: !!o.token, storesPassword: JSON.stringify(o).includes(window.__pw || 'zzz'), hoursValid: Math.round((o.expiresAt - Date.now())/3600000) };
});
console.log('signed in:', signedIn, '| remembered session:', JSON.stringify(stored));

// --- Reload: does the session persist? ---
await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 3000));
console.log('still signed in after reload:', await page.evaluate(() => document.body.innerText.includes('Current Event Details')));

// --- Sign out clears it ---
await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.includes('Sign out'))?.click());
await new Promise(r => setTimeout(r, 1500));
console.log('session cleared after sign out:', await page.evaluate(() => localStorage.getItem('kosua_admin_session') === null));
await B.close();
