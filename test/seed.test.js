// The sample donors must follow src/seed.js even in a database that already
// has rows, and must never disturb people who registered themselves.
//
// This is the bug these tests exist for: seeding used to stop as soon as the
// donors table had anything in it, so a local database kept whatever it was
// first filled with. Editing the sample list changed nothing on a machine that
// had already run the app once.
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const db = require('../src/db');
const { seedDemoDonors, SAMPLE } = require('../src/seed');
const { isValidRwandanPhone } = require('../src/validators');

const phoneOf = (name) => db.prepare('SELECT phone FROM donors WHERE full_name = ?').get(name)?.phone;
const countDonors = () => db.prepare('SELECT COUNT(*) AS n FROM donors').get().n;

// Pretend src/seed.js was edited: the stored fingerprint no longer matches.
const forgetFingerprint = () => db.prepare("DELETE FROM meta WHERE key = 'sample_donors_fingerprint'").run();

test('an empty database gets the full sample list', () => {
  const r = seedDemoDonors();
  assert.strictEqual(r.inserted, SAMPLE.length);
  assert.strictEqual(r.updated, 0);
  assert.strictEqual(countDonors(), SAMPLE.length);
});

test('running again does nothing at all', () => {
  const r = seedDemoDonors();
  assert.strictEqual(r.upToDate, true);
  assert.strictEqual(r.inserted, 0);
  assert.strictEqual(r.updated, 0);
});

test('every sample donor has a valid Rwandan number', () => {
  const bad = db.prepare('SELECT full_name, phone FROM donors WHERE is_sample = 1').all()
    .filter((d) => !isValidRwandanPhone(d.phone) || d.phone.startsWith('0700'));
  assert.deepStrictEqual(bad, [], 'sample numbers must look like real Rwandan mobile numbers');
});

test('THE BUG: a stale database is brought back into line', () => {
  const [firstName] = SAMPLE[0];
  const correct = phoneOf(firstName);

  // The state a machine was left in: an old number sitting in a table that is
  // not empty, so the old code would never touch it again.
  db.prepare('UPDATE donors SET phone = ? WHERE full_name = ?').run('0700000126', firstName);
  db.prepare("UPDATE donors SET district = 'Huye' WHERE full_name = ?").run(firstName);
  forgetFingerprint();
  assert.strictEqual(phoneOf(firstName), '0700000126');

  const r = seedDemoDonors();

  assert.strictEqual(phoneOf(firstName), correct, 'the stale number should have been rewritten');
  assert.strictEqual(r.updated, SAMPLE.length);
  assert.strictEqual(r.inserted, 0);
  assert.strictEqual(countDonors(), SAMPLE.length, 'no duplicates created');
});

test('a donor who registered themselves is never touched by a re-sync', () => {
  db.prepare(`INSERT INTO donors (full_name, blood_type, district, phone, consent, is_sample)
              VALUES ('Real Person', 'O-', 'Musanze', '0788504834', 1, 0)`).run();
  const before = db.prepare("SELECT * FROM donors WHERE full_name = 'Real Person'").get();

  forgetFingerprint();
  seedDemoDonors();

  const after = db.prepare("SELECT * FROM donors WHERE full_name = 'Real Person'").get();
  assert.deepStrictEqual(after, before, 'a real registration must survive a re-sync untouched');
  assert.strictEqual(countDonors(), SAMPLE.length + 1);
});

test('a sample donor dropped from the list is removed, real donors are not', () => {
  db.prepare(`INSERT INTO donors (full_name, blood_type, district, phone, consent, is_sample)
              VALUES ('Retired Sample', 'A+', 'Huye', '0795550001', 1, 1)`).run();
  assert.strictEqual(countDonors(), SAMPLE.length + 2);

  forgetFingerprint();
  const r = seedDemoDonors();

  assert.strictEqual(r.removed, 1);
  assert.strictEqual(phoneOf('Retired Sample'), undefined);
  assert.ok(phoneOf('Real Person'), 'the real registration is still there');
});

test('rows from before the upgrade are recognised by name', () => {
  // Simulate an old database: no is_sample marker on anything.
  db.prepare('UPDATE donors SET is_sample = 0').run();
  const [firstName] = SAMPLE[0];
  db.prepare('UPDATE donors SET phone = ? WHERE full_name = ?').run('0700000126', firstName);
  forgetFingerprint();

  seedDemoDonors();

  assert.notStrictEqual(phoneOf(firstName), '0700000126', 'an unmarked sample row should still be fixed');
  const real = db.prepare("SELECT is_sample FROM donors WHERE full_name = 'Real Person'").get();
  assert.strictEqual(real.is_sample, 0, 'a real registration must not be mistaken for sample data');
});

test('a sample number clashing with a real donor is skipped, not fatal', () => {
  const [firstName] = SAMPLE[0];
  const sampleNumber = phoneOf(firstName);

  db.prepare('DELETE FROM donors WHERE full_name = ?').run(firstName);
  db.prepare(`INSERT INTO donors (full_name, blood_type, district, phone, consent, is_sample)
              VALUES ('Clash Person', 'B+', 'Ngoma', ?, 1, 0)`).run(sampleNumber);
  forgetFingerprint();

  const r = seedDemoDonors(); // must not throw
  assert.strictEqual(r.skipped.length, 1);
  assert.match(r.skipped[0], new RegExp(firstName));
  assert.strictEqual(phoneOf('Clash Person'), sampleNumber, 'the real donor keeps the number');
});

test('--reset clears everything and starts over', () => {
  const r = seedDemoDonors({ reset: true });
  assert.strictEqual(r.inserted, SAMPLE.length);
  assert.strictEqual(countDonors(), SAMPLE.length);
  assert.strictEqual(phoneOf('Real Person'), undefined, 'reset is the one path that drops real donors');
});
