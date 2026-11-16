'use strict';
/** Photo library: GET to list, POST {name, data(base64), title?, alt?} to add one (the browser shrinks it to 1920px first). */
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');

module.exports = route({
  GET: async (req, res, s) => {
    const q = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    return pass(await wp('GET', '/media', { as: s.uid, query: { page: q.page, q: q.q } }));
  },
  POST: async (req, res, s) => {
    const b = req.body || {};
    const data = String(b.data || '');
    if (!data || data.length > 7 * 1024 * 1024) return { status: 400, body: { message: 'That photo is missing or too large.' } };
    const body = { name: String(b.name || 'photo.jpg').slice(0, 120), data, title: String(b.title || '').slice(0, 200), alt: String(b.alt || '').slice(0, 300) };
    return pass(await wp('POST', '/media', { as: s.uid, body }));
  },
});
