'use strict';
/** One wrapper for every /api route: method check, sign-in check, same-site check, tidy errors. */
const { getSession, clearSession } = require('./session');

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

function sameSite(req) {
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return false; } catch (e) { return false; }
  }
  return req.headers['x-requested-with'] === 'bvc-dashboard';
}

/** methods: { GET: fn, POST: fn }. Each fn gets (req, res, session) and returns {status, body}. */
function route(methods, options) {
  const open = !!(options && options.open); // sign-in itself needs no session
  return async function handler(req, res) {
    try {
      const fn = methods[req.method];
      if (!fn) return send(res, 405, { message: 'Not allowed.' });
      if (req.method !== 'GET' && !sameSite(req)) return send(res, 403, { message: 'Not allowed.' });

      let session = null;
      if (!open) {
        session = getSession(req);
        if (!session) return send(res, 401, { message: 'Please sign in.' });
      }
      const out = await fn(req, res, session);
      if (out && out.status === 401 && session) clearSession(req, res); // login was removed or changed
      return send(res, out.status, out.body);
    } catch (e) {
      console.error('[dashboard]', e && e.message);
      return send(res, 500, { message: 'Something went wrong. Please try again.' });
    }
  };
}

/** The website's answer, passed on without extra detail. */
function pass(r) {
  const d = r.data || {};
  if (r.status >= 200 && r.status < 300) return { status: r.status, body: d };
  return { status: r.status === 0 ? 502 : r.status, body: { message: d.message || 'Something went wrong.' } };
}

module.exports = { route, pass, send };
