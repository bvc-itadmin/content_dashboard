'use strict';
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');

module.exports = route({
  GET: async (req, res, s) => pass(await wp('GET', '/overview', { as: s.uid })),
});
