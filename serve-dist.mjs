import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
createServer((req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { p = 'dist/404.html'; res.statusCode = 404; }
  res.setHeader('Content-Type', types[extname(p)] ?? 'application/octet-stream');
  res.end(readFileSync(p));
}).listen(4178, () => console.log('ready'));
