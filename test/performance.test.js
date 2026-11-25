// NFR 7 and NFR 8: the two performance requirements from the SRS, run exactly
// as the SRS describes the test.
//
//   NFR 7  Search results load in 2 seconds with as many as 1,000 donor records.
//          Test: 20 searches, 19 of which were completed in less than 2 seconds.
//   NFR 8  At least 50 users can use the system at the same time and get the
//          results within 3 seconds.
const test = require('node:test');
const assert = require('node:assert');
const { startServer, json } = require('./helpers');
const db = require('../src/db');
const { BLOOD_TYPES, DISTRICTS, MAX_RESULTS } = require('../src/constants');
const { seedLoadTestDonors, PHONE_PREFIX } = require('../src/loadTestData');

const DONOR_COUNT = 1000;
const NFR7_SEARCHES = 20;
const NFR7_BUDGET_MS = 2000;
const NFR7_MUST_PASS = 19;
const NFR8_USERS = 50;
const NFR8_BUDGET_MS = 3000;

let ctx;

test.before(async () => {
  ctx = await startServer();
  seedLoadTestDonors(DONOR_COUNT);
});
test.after(() => ctx.server.close());

// Twenty different blood type + district pairs, so the same query is never
// repeated and SQLite cannot simply answer from a warm cache every time.
function searchPairs(n) {
  const pairs = [];
  for (let i = 0; i < n; i += 1) {
    pairs.push({
      bloodType: BLOOD_TYPES[i % BLOOD_TYPES.length],
      district: DISTRICTS[(i * 7) % DISTRICTS.length],
    });
  }
  return pairs;
}

async function timedSearch(pair) {
  const started = process.hrtime.bigint();
  const res = await json(ctx.base, `/api/search?bloodType=${encodeURIComponent(pair.bloodType)}&district=${encodeURIComponent(pair.district)}`);
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  return { ...pair, ms, status: res.status, body: res.body };
}

test(`the database really holds ${DONOR_COUNT} searchable donors`, () => {
  const n = db.prepare("SELECT COUNT(*) AS n FROM donors WHERE status = 'active'").get().n;
  assert.ok(n >= DONOR_COUNT, `expected at least ${DONOR_COUNT} active donors, found ${n}`);
});

test(`NFR 7: ${NFR7_MUST_PASS} of ${NFR7_SEARCHES} searches finish under ${NFR7_BUDGET_MS} ms with ${DONOR_COUNT} donors`, async () => {
  const results = [];
  for (const pair of searchPairs(NFR7_SEARCHES)) {
    results.push(await timedSearch(pair)); // one after another, like one seeker searching
  }

  results.forEach((r) => assert.strictEqual(r.status, 200, `${r.bloodType} in ${r.district} returned ${r.status}`));

  const withinBudget = results.filter((r) => r.ms < NFR7_BUDGET_MS).length;
  const slowest = Math.max(...results.map((r) => r.ms));

  assert.ok(
    withinBudget >= NFR7_MUST_PASS,
    `only ${withinBudget} of ${NFR7_SEARCHES} searches finished under ${NFR7_BUDGET_MS} ms (slowest ${slowest.toFixed(1)} ms)`,
  );
});

test('NFR 5 still holds at 1,000 donors: never more than 20 results, first names only', async () => {
  // Blood type and district chosen so that far more than 20 donors match.
  const crowded = await timedSearch({ bloodType: 'O+', district: 'Gasabo' });
  assert.strictEqual(crowded.status, 200);
  assert.ok(crowded.body.donors.length > 0, 'expected the crowded search to match donors');
  assert.ok(
    crowded.body.donors.length <= MAX_RESULTS,
    `expected at most ${MAX_RESULTS} results, got ${crowded.body.donors.length}`,
  );
  crowded.body.donors.forEach((d) => {
    assert.ok(!d.fullName, 'a full name must never leave the server');
    assert.ok(!/\s/.test(d.firstName), `"${d.firstName}" is not a single first name`);
  });
});

test(`NFR 8: ${NFR8_USERS} people searching at the same time all get an answer under ${NFR8_BUDGET_MS} ms`, async () => {
  const pairs = searchPairs(NFR8_USERS);

  const started = process.hrtime.bigint();
  const results = await Promise.all(pairs.map(timedSearch)); // all at once, not one by one
  const wallClock = Number(process.hrtime.bigint() - started) / 1e6;

  results.forEach((r) => assert.strictEqual(r.status, 200, `${r.bloodType} in ${r.district} returned ${r.status}`));

  const tooSlow = results.filter((r) => r.ms >= NFR8_BUDGET_MS);
  assert.deepStrictEqual(
    tooSlow.map((r) => `${r.bloodType}/${r.district} ${r.ms.toFixed(1)} ms`),
    [],
    `every one of the ${NFR8_USERS} concurrent searches must answer under ${NFR8_BUDGET_MS} ms`,
  );
  assert.ok(
    wallClock < NFR8_BUDGET_MS,
    `all ${NFR8_USERS} searches together took ${wallClock.toFixed(1)} ms, over the ${NFR8_BUDGET_MS} ms budget`,
  );
});

test('the load-test donors use reserved phone numbers, so nobody real is called', () => {
  const stray = db.prepare(`SELECT phone FROM donors WHERE phone NOT LIKE '${PHONE_PREFIX}%' LIMIT 1`).get();
  assert.strictEqual(stray, undefined, `load-test donor phone numbers must all start with ${PHONE_PREFIX}`);
});
