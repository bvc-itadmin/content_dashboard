'use strict';
/** Talks to the website's private dashboard API. The key lives only in server settings. */

function config() {
  const url = (process.env.WP_URL || '').replace(/\/+$/, '');
  const key = process.env.DASHBOARD_API_KEY || '';
  if (!url || key.length < 32) throw new Error('WP_URL / DASHBOARD_API_KEY are not set.');
  return { url, key };
}

async function wp(method, path, opts) {
  const { as, query, body } = opts || {};
  const { url, key } = config();
  const u = new URL(url + '/wp-json/bvc-dash/v1' + path);
  if (as) u.searchParams.set('as', String(as));
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  const res = await fetch(u, {
    method,
    headers: { 'X-BVC-Dashboard-Key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* not JSON */ }
  return { status: res.status, data };
}

module.exports = { wp };
