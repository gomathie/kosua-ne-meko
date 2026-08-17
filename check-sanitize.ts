import {
  sanitizeText,
  sanitizePasscode,
  sanitizeEmail,
  sanitizePhone,
  isValidPhone,
  sanitizeUrl,
  sanitizeImageUrl,
  sanitizeEnum,
  sanitizeInt,
  sanitizeIsoDate,
} from './src/utils/sanitize';

const ZWSP = String.fromCharCode(0x200b);
const BOM = String.fromCharCode(0xfeff);
const RLO = String.fromCharCode(0x202e);
const NUL = String.fromCharCode(0x00);

const cases: [string, unknown, unknown][] = [
  ['text: strips newlines/tabs', sanitizeText('Kwame\n\tMensah'), 'Kwame Mensah'],
  ['text: strips zero-width + BOM', sanitizeText('Kwa' + ZWSP + 'me' + BOM), 'Kwame'],
  ['text: neutralizes bidi override', sanitizeText('abc' + RLO + 'def'), 'abc def'],
  ['text: caps length', sanitizeText('x'.repeat(500), 10), 'x'.repeat(10)],
  ['text: non-string', sanitizeText(null), ''],
  ['text: trims after slice', sanitizeText('abcde fghij', 6), 'abcde'],

  ['passcode: keeps case+symbols', sanitizePasscode('  Ab!n_kwan123  '), 'Ab!n_kwan123'],
  ['passcode: strips embedded NUL', sanitizePasscode('admin' + NUL + '123'), 'admin123'],
  ['passcode: keeps inner space', sanitizePasscode(' my pass '), 'my pass'],

  ['email: normalizes', sanitizeEmail('  KWAME@Example.COM '), 'kwame@example.com'],
  ['email: rejects junk', sanitizeEmail('not-an-email'), ''],
  ['email: rejects no tld', sanitizeEmail('a@b'), ''],

  ['phone: normalizes intl', sanitizePhone('+233 (24) 123-4567'), '+233241234567'],
  ['phone: local', sanitizePhone('024 123 4567'), '0241234567'],
  ['phone valid', isValidPhone('+233 24 123 4567'), true],
  ['phone invalid short', isValidPhone('12345'), false],

  ['url: blocks javascript:', sanitizeUrl('javascript:alert(1)'), ''],
  ['url: blocks obfuscated case', sanitizeUrl('  jAvAsCrIpT:alert(1)'), ''],
  ['url: blocks NUL-split scheme', sanitizeUrl('java' + NUL + 'script:alert(1)'), ''],
  ['url: blocks data:text/html', sanitizeUrl('data:text/html,<script>x</script>'), ''],
  ['url: blocks vbscript', sanitizeUrl('vbscript:msgbox(1)'), ''],
  ['url: allows https', sanitizeUrl('https://trypebble.com'), 'https://trypebble.com/'],
  ['url: upgrades bare domain', sanitizeUrl('trypebble.com'), 'https://trypebble.com/'],
  ['url: keeps root-relative', sanitizeUrl('/assets/logo.png'), '/assets/logo.png'],
  ['url: uses fallback', sanitizeUrl('javascript:x', 'https://fallback.test'), 'https://fallback.test'],
  ['url: allows mailto', sanitizeUrl('mailto:hi@example.com'), 'mailto:hi@example.com'],

  ['img: blocks javascript:', sanitizeImageUrl('javascript:alert(1)'), ''],
  ['img: blocks svg data uri', sanitizeImageUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), ''],
  ['img: allows png data uri', sanitizeImageUrl('data:image/png;base64,iVBORw0KGgo='), 'data:image/png;base64,iVBORw0KGgo='],
  ['img: blocks mailto', sanitizeImageUrl('mailto:a@b.com'), ''],
  ['img: allows https', sanitizeImageUrl('https://images.unsplash.com/x.jpg'), 'https://images.unsplash.com/x.jpg'],

  ['enum: pins bad value', sanitizeEnum('DROP TABLE', ['Gold', 'Silver'] as const, 'Gold'), 'Gold'],
  ['enum: keeps good value', sanitizeEnum('Silver', ['Gold', 'Silver'] as const, 'Gold'), 'Silver'],

  ['int: clamps high', sanitizeInt(9999, 1, 10, 1), 10],
  ['int: clamps junk', sanitizeInt('abc', 1, 10, 1), 1],
  ['int: parses string', sanitizeInt('7', 1, 10, 1), 7],

  ['iso: keeps local-time string', sanitizeIsoDate('2026-09-05T10:00:00'), '2026-09-05T10:00:00'],
  ['iso: rejects junk', sanitizeIsoDate('not a date', 'FB'), 'FB'],
];

let failed = 0;
for (const [label, actual, expected] of cases) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failed++;
    console.log(`FAIL  ${label}\n      got:      ${JSON.stringify(actual)}\n      expected: ${JSON.stringify(expected)}`);
  }
}
console.log(failed === 0 ? `\nAll ${cases.length} sanitizer checks passed.` : `\n${failed} of ${cases.length} checks FAILED.`);
process.exit(failed === 0 ? 0 : 1);
