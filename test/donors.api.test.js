const test = require('node:test');
const assert = require('node:assert');
const { startServer, json } = require('./helpers');

let ctx;
test.before(async () => { ctx = await startServer(); });
test.after(() => ctx.server.close());

const donor = { fullName: 'Eric Habimana', bloodType: 'AB-', district: 'Kicukiro', phone: '0791204901', consent: true };

test('registers a new donor', async () => {
  const r = await json(ctx.base, '/api/donors', { method: 'POST', body: donor });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.body.status, 'created');
});

test('same phone number updates instead of duplicating', async () => {
  const r = await json(ctx.base, '/api/donors', { method: 'POST', body: { ...donor, district: 'Gasabo' } });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.status, 'updated');
});

test('blocks registration without consent', async () => {
  const r = await json(ctx.base, '/api/donors', { method: 'POST', body: { ...donor, phone: '0791204902', consent: false } });
  assert.strictEqual(r.status, 400);
  assert.strictEqual(r.body.errors.consent, 'err_consent');
});
