/**
 * Home-screen and PWA icons.
 *
 * The site's only icon was an emoji data URI. iOS ignores that when a visitor
 * adds the site to their home screen, and a manifest cannot reference it. The
 * flyer itself is too detailed to read at icon sizes, so these render the
 * wordmark instead. The emoji stays as the browser-tab favicon, where three
 * lines of text would be unreadable.
 *
 *   node scripts/make-icons.mjs
 */
import sharp from 'sharp';

const ORANGE = '#ea580c';
const FONT = 'Arial Black, Arial Bold, Arial, sans-serif';

/** @param radius corner rounding; 0 for maskable, which is cropped by the OS. */
const wordmark = (radius, scale) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="${radius}" fill="${ORANGE}"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <text x="256" y="180" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="118" fill="#ffffff">KOSUA</text>
    <text x="256" y="300" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="118" fill="#ffffff">NE</text>
    <text x="256" y="420" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="118" fill="#1c1917">MEKO</text>
  </g>
</svg>`;

const targets = [
  ['public/apple-touch-icon.png', 180, 96, 1],
  ['public/icon-192.png', 192, 96, 1],
  ['public/icon-512.png', 512, 96, 1],
  // Maskable art must survive a circular crop, so it sits in the inner 70%
  // of a full-bleed square.
  ['public/icon-maskable-512.png', 512, 0, 0.7],
];

for (const [out, px, radius, scale] of targets) {
  await sharp(Buffer.from(wordmark(radius, scale))).resize(px, px).png().toFile(out);
  console.log('wrote', out);
}
