// FR 5.0: the first administrator creates their own account on the sign-up page.
// No admin is pre-created here, so the server starts with an empty admins table.
process.env.ADMIN_USERNAME = '';
process.env.ADMIN_PASSWORD = '';

const test = require('node:test');
const assert = require('node:assert');
const { startServer, json } = require('./helpers');
const db = require('../src/db');

let ctx;
let cookie;

test.before(async () => { ctx = await startServer(); });
test.after(() => ctx.server.close());

test('no admin is created automatically, so the site asks for sign-up', async () => {
  assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM admins').get().n, 0);
  const r = await json(ctx.base, '/api/admin/setup');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.needsSetup, true);
});

test('sign-up rejects a short password and a mismatched confirmation', async () => {
  const short = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    body: { username: 'huguette', password: 'short', confirm: 'short' },
  });
  assert.strictEqual(short.status, 400);
  assert.strictEqual(short.body.error, 'signup_err_password');

  const mismatch = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    body: { username: 'huguette', password: 'StrongPass1!', confirm: 'StrongPass2!' },
  });
  assert.strictEqual(mismatch.status, 400);
  assert.strictEqual(mismatch.body.error, 'signup_err_match');

  const badName = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    body: { username: 'a b', password: 'StrongPass1!', confirm: 'StrongPass1!' },
  });
  assert.strictEqual(badName.status, 400);
  assert.strictEqual(badName.body.error, 'signup_err_username');

  assert.strictEqual(db.prepare('SELECT COUNT(*) AS n FROM admins').get().n, 0);
});

test('the first sign-up creates the admin, hashes the password and signs them in', async () => {
  const r = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    body: { username: 'huguette', password: 'StrongPass1!', confirm: 'StrongPass1!' },
  });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.body.username, 'huguette');
  assert.strictEqual(r.body.signedIn, true);

  cookie = r.headers.get('set-cookie').split(';')[0];

  // NFR 2: never stored as plain text.
  const row = db.prepare('SELECT password_hash FROM admins WHERE username = ?').get('huguette');
  assert.ok(row.password_hash.startsWith('$2'));
  assert.notStrictEqual(row.password_hash, 'StrongPass1!');

  // The session from sign-up already opens the admin pages.
  const me = await json(ctx.base, '/api/admin/me', { headers: { cookie } });
  assert.strictEqual(me.status, 200);
  assert.strictEqual(me.body.username, 'huguette');
});

test('the credentials chosen at sign-up are the ones that log in', async () => {
  const good = await json(ctx.base, '/api/admin/login', {
    method: 'POST',
    body: { username: 'huguette', password: 'StrongPass1!' },
  });
  assert.strictEqual(good.status, 200);

  const bad = await json(ctx.base, '/api/admin/login', {
    method: 'POST',
    body: { username: 'admin', password: 'BloodLink2026!' },
  });
  assert.strictEqual(bad.status, 401);
});

test('sign-up closes once an admin exists', async () => {
  const r = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    body: { username: 'intruder', password: 'StrongPass1!', confirm: 'StrongPass1!' },
  });
  assert.strictEqual(r.status, 403);
  assert.strictEqual(r.body.error, 'signup_closed');

  const setup = await json(ctx.base, '/api/admin/setup');
  assert.strictEqual(setup.body.needsSetup, false);
});

test('a signed-in admin can add a colleague, but not reuse a username', async () => {
  const added = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    headers: { cookie },
    body: { username: 'colleague', password: 'AnotherPass1!', confirm: 'AnotherPass1!' },
  });
  assert.strictEqual(added.status, 201);
  assert.strictEqual(added.body.signedIn, false);

  const taken = await json(ctx.base, '/api/admin/signup', {
    method: 'POST',
    headers: { cookie },
    body: { username: 'colleague', password: 'AnotherPass1!', confirm: 'AnotherPass1!' },
  });
  assert.strictEqual(taken.status, 409);
  assert.strictEqual(taken.body.error, 'signup_err_taken');

  const login = await json(ctx.base, '/api/admin/login', {
    method: 'POST',
    body: { username: 'colleague', password: 'AnotherPass1!' },
  });
  assert.strictEqual(login.status, 200);
});
