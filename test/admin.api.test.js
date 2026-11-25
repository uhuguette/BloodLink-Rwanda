const test = require('node:test');
const assert = require('node:assert');
const { startServer, json } = require('./helpers');
const db = require('../src/db');

let ctx;
let cookie;
let donorId;

test.before(async () => {
  ctx = await startServer();
  donorId = Number(db.prepare(`INSERT INTO donors (full_name, blood_type, district, phone, consent)
                               VALUES ('Test Donor', 'B+', 'Ngoma', '0788776990', 1)`).run().lastInsertRowid);
});
test.after(() => ctx.server.close());

test('NFR 1: admin API and page are blocked without login', async () => {
  const api = await json(ctx.base, '/api/admin/donors');
  assert.strictEqual(api.status, 401);
  assert.strictEqual(api.body.error, 'access_denied');

  const page = await fetch(ctx.base + '/admin', { redirect: 'manual' });
  assert.strictEqual(page.status, 302);
  assert.match(page.headers.get('location'), /\/login\?denied=1/);
});

test('NFR 2: admin password is stored as a hash', () => {
  const row = db.prepare('SELECT password_hash FROM admins LIMIT 1').get();
  assert.ok(row.password_hash.startsWith('$2'));
  assert.notStrictEqual(row.password_hash, 'BloodLink2026!');
});

test('wrong password gives access denied', async () => {
  const r = await json(ctx.base, '/api/admin/login', { method: 'POST', body: { username: 'admin', password: 'wrong-password' } });
  assert.strictEqual(r.status, 401);
});

test('two reports from different visitors hide a donor', async () => {
  const a = await json(ctx.base, `/api/donors/${donorId}/report`, { method: 'POST' });
  const b = await json(ctx.base, `/api/donors/${donorId}/report`, { method: 'POST' });
  assert.strictEqual(a.body.hidden, false);
  assert.strictEqual(b.body.hidden, true);
  const search = await json(ctx.base, '/api/search?bloodType=B%2B&district=Ngoma');
  assert.strictEqual(search.body.donors.length, 0);
});

test('admin logs in and sees the flagged donor', async () => {
  const r = await json(ctx.base, '/api/admin/login', { method: 'POST', body: { username: 'admin', password: 'BloodLink2026!' } });
  assert.strictEqual(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];

  const list = await json(ctx.base, '/api/admin/donors', { headers: { cookie } });
  const donor = list.body.donors.find((d) => d.id === donorId);
  assert.strictEqual(donor.status, 'hidden');
  assert.deepStrictEqual(donor.flags, ['reported']);
});

test('NFR 3: removing a donor writes a log entry with admin, donor ID and time', async () => {
  const del = await json(ctx.base, `/api/admin/donors/${donorId}`, { method: 'DELETE', headers: { cookie }, body: { reason: 'reported' } });
  assert.strictEqual(del.status, 200);

  const log = await json(ctx.base, '/api/admin/log', { headers: { cookie } });
  const entry = log.body.log[0];
  assert.strictEqual(entry.adminUsername, 'admin');
  assert.strictEqual(entry.donorId, donorId);
  assert.ok(entry.removedAt);
});
