'use strict';
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');

module.exports = route({
  GET: async (req, res, s) => {
    const q = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    return pass(await wp('GET', '/items', { as: s.uid, query: { type: q.type, status: q.status, q: q.q, page: q.page } }));
  },
  POST: async (req, res, s) => {
    const b = req.body || {};
    const body = {
      id: b.id ? Number(b.id) : undefined,
      type: String(b.type || 'post'),
      title: String(b.title || '').slice(0, 300),
      content: String(b.content || '').slice(0, 400000),
      summary: String(b.summary || '').slice(0, 1000),
      status: b.status === 'publish' ? 'publish' : 'draft',
      image_id: b.image_id ? Number(b.image_id) : (b.image_id === 0 ? 0 : undefined),
      meta: b.meta && typeof b.meta === 'object' ? b.meta : undefined,
    };
    return pass(await wp('POST', '/items', { as: s.uid, body }));
  },
});
