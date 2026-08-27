import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#ea580c"/>
  <text x="256" y="180" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-weight="900" font-size="118" fill="#ffffff">KOSUA</text>
  <text x="256" y="300" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-weight="900" font-size="118" fill="#ffffff">NE</text>
  <text x="256" y="420" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"
        font-weight="900" font-size="118" fill="#1c1917">MEKO</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('.tmp-svg-icon.png');
console.log('rendered');
