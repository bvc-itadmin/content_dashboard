'use strict';
/** One item: GET ?id=12 to open it, POST ?id=12 with {status:"publish"|"draft"|"trash"} to publish, take offline or delete. */
const { route, pass } = require('../lib/route');
const { wp } = require('../lib/wp');

function idOf(req) {
  const id = Number(new URL(req.url, 'http://x').searchParams.get('id'));
  return Number.isInteger(id) && id > 0 ? id : 0;
}

module.exports = route({
  GET: async (req, res, s) => {
    const id = idOf(req);
    if (!id) return { status: 400, body: { message: 'Missing item.' } };
    return pass(await wp('GET', '/items/' + id, { as: s.uid }));
  },
  POST: async (req, res, s) => {
    const id = idOf(req);
    const status = (req.body || {}).status;
    if (!id || !['publish', 'draft', 'trash'].includes(status)) return { status: 400, body: { message: 'Unknown action.' } };
    return pass(await wp('POST', '/items/' + id + '/status', { as: s.uid, body: { status } }));
  },
});
