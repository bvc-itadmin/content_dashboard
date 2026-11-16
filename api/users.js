'use strict';
/** Logins. Admin only (the website refuses anyone else, whatever this server sends). */
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');

module.exports = route({
  GET: async (req, res, s) => pass(await wp('GET', '/users', { as: s.uid })),
  POST: async (req, res, s) => {
    const b = req.body || {};
    // ?remove=ID removes a login; otherwise this creates one
    const remove = Number(new URL(req.url, 'http://x').searchParams.get('remove'));
    if (remove) return pass(await wp('POST', '/users/' + remove + '/remove', { as: s.uid }));
    const body = {
      name: String(b.name || '').slice(0, 120),
      email: String(b.email || '').slice(0, 200),
      role: b.role === 'admin' ? 'admin' : 'user',
      password: String(b.password || '').slice(0, 200),
    };
    return pass(await wp('POST', '/users', { as: s.uid, body }));
  },
});
