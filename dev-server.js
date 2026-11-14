'use strict';
/**
 * Run the dashboard on your own computer for testing:  node dev-server.js
 * Reads settings from .env.local (never committed). Serves the pages and runs the /api routes,
 * the same way Vercel does when it is live.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
} catch (e) { console.error('No .env.local found - create it from .env.example'); }

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8' };
const ROOT = __dirname;
const BLOCKED = /^\/(lib|api\/_|\.|node_modules|dev-server|package|README|\.env)/i;

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(u.pathname);

  if (p.startsWith('/api/')) {
    const name = p.slice(5).replace(/[^a-z0-9_-]/gi, '');
    let handler;
    try { handler = require(path.join(ROOT, 'api', name + '.js')); } catch (e) { res.statusCode = 404; return res.end('Not found'); }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
    return handler(req, res);
  }

  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (BLOCKED.test(p) || !file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404; return res.end('Not found');
  }
  res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log('Dashboard running at http://localhost:' + port + '  (website: ' + (process.env.WP_URL || 'not set') + ')'));
