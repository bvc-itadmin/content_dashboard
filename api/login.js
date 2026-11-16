'use strict';
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');
const { setSession } = require('../lib/session');

module.exports = route({
  POST: async (req, res) => {
    const b = req.body || {};
    const email = String(b.email || '').slice(0, 200);
    const password = String(b.password || '').slice(0, 200);
    if (!email || !password) return { status: 401, body: { message: 'The email or password is not right.' } };

    const r = await wp('POST', '/login', { body: { email, password } });
    if (r.status !== 200) return pass(r);
    setSession(req, res, r.data, !!b.remember);
    return { status: 200, body: { name: r.data.name, role: r.data.role } };
  },
}, { open: true });
