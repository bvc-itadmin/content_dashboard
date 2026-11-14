'use strict';
const { route } = require('../lib/route');

module.exports = route({
  GET: async (req, res, s) => ({ status: 200, body: { name: s.name, email: s.email, role: s.role } }),
});
