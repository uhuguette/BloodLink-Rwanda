const test = require('node:test');
const assert = require('node:assert');
const { startServer, json } = require('./helpers');
const db = require('../src/db');

let ctx;
test.before(async () => {
  ctx = await startServer();
  const add = db.prepare(`INSERT INTO donors (full_name, blood_type, district, phone, consent, last_confirmed_at)
                          VALUES (?, ?, ?, ?, 1, datetime('now', ?))`);
  add.run('Ange Uwamahoro', 'O-', 'Bugesera', '0785330801', '-2 days');
  add.run('Old Donor', 'O-', 'Bugesera', '0785330802', '-100 days');
  for (let i = 0; i < 25; i++) add.run(`Donor ${i} Test`, 'A+', 'Huye', `0792${String(100000 + i).padStart(6, '0')}`, '-1 days');
});
test.after(() => ctx.server.close());

test('finds a matching donor and shows only the first name', async () => {
  const r = await json(ctx.base, '/api/search?bloodType=O-&district=Bugesera');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.donors.length, 1);
  assert.strictEqual(r.body.donors[0].firstName, 'Ange');
  assert.ok(!('full_name' in r.body.donors[0]));
});

test('donors not reconfirmed in 90 days are hidden', async () => {
  const r = await json(ctx.base, '/api/search?bloodType=O-&district=Bugesera');
  assert.ok(r.body.donors.every((d) => d.phone !== '0785330802'));
});

test('never returns more than 20 donors', async () => {
  const r = await json(ctx.base, '/api/search?bloodType=A%2B&district=Huye');
  assert.strictEqual(r.body.donors.length, 20);
});

test('no match returns RCBT contacts with the nearest centre first', async () => {
  const r = await json(ctx.base, '/api/search?bloodType=AB-&district=Rusizi');
  assert.strictEqual(r.body.donors.length, 0);
  assert.ok(r.body.centres.length >= 5);
  assert.strictEqual(r.body.centres[0].city, 'Karongi');
  assert.strictEqual(r.body.centres[0].nearest, true);
});

test('rejects a search without blood type or district', async () => {
  const r = await json(ctx.base, '/api/search?bloodType=Z&district=');
  assert.strictEqual(r.status, 400);
});
