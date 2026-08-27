/**
 * Emits dist/adm/index.html as a real file.
 *
 * The portal cannot be a `_redirects` rewrite: Cloudflare Pages normalises any
 * rewrite targeting /index.html into a 308 back to /, which silently sent /adm
 * to the home page. Shipping the shell as an actual file at that path avoids
 * the rewrite entirely, so unmatched URLs can still fall through to a real 404.
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const shell = 'dist/index.html';
if (!existsSync(shell)) {
  console.error('postbuild: dist/index.html missing — did vite build run?');
  process.exit(1);
}
mkdirSync('dist/adm', { recursive: true });

// The portal is the same shell, but it must never be indexed and must not
// carry the home page's structured data — a sign-in screen described as a
// festival is exactly the mismatch that gets rich results revoked.
const portal = readFileSync(shell, 'utf8')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow" />')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Portal | Kosua Ne Meko Hangout</title>');

writeFileSync('dist/adm/index.html', portal);
console.log('postbuild: wrote dist/adm/index.html (noindex)');
