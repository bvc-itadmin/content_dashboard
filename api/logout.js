'use strict';
const { route } = require('../lib/route');
const { clearSession } = require('../lib/session');

module.exports = route({
  POST: async (req, res) => {
    clearSession(req, res);
    return { status: 200, body: { ok: true } };
  },
}, { open: true });
