/**
 * Emits dist/adm/index.html as a real file.
 *
 * The portal cannot be a `_redirects` rewrite: Cloudflare Pages normalises any
 * rewrite targeting /index.html into a 308 back to /, which silently sent /adm
 * to the home page. Shipping the shell as an actual file at that path avoids
 * the rewrite entirely, so unmatched URLs can still fall through to a real 404.
 */
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';

const shell = 'dist/index.html';
if (!existsSync(shell)) {
  console.error('postbuild: dist/index.html missing — did vite build run?');
  process.exit(1);
}
mkdirSync('dist/adm', { recursive: true });
copyFileSync(shell, 'dist/adm/index.html');
console.log('postbuild: wrote dist/adm/index.html');
