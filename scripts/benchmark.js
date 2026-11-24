#!/usr/bin/env node
// Measures the two performance requirements from the SRS and prints the result
// as a table you can read out or screenshot.
//
//   NFR 7  Search results load in 2 seconds with as many as 1,000 donor records.
//          Test: 20 searches, 19 of which were completed in less than 2 seconds.
//   NFR 8  At least 50 users can use the system at the same time and get the
//          results within 3 seconds.
//
// Run it with:  npm run benchmark
// Nothing touches your real database: it runs against a throwaway in-memory
// copy on a free port, so your own donors and admin account are untouched.

process.env.DB_PATH = ':memory:';
process.env.SEED_DEMO = 'false';
process.env.NODE_ENV = process.env.NODE_ENV || 'benchmark';

const app = require('../src/app');
const { BLOOD_TYPES, DISTRICTS } = require('../src/constants');
const { seedLoadTestDonors, unweightedBloodTypes } = require('../src/loadTestData');

const DONOR_COUNT = Number(process.env.BENCHMARK_DONORS || 1000);
const NFR7_SEARCHES = 20;
const NFR7_BUDGET_MS = 2000;
const NFR7_MUST_PASS = 19;
const NFR8_USERS = 50;
const NFR8_BUDGET_MS = 3000;

const ms = (n) => `${n.toFixed(1)} ms`;
const pad = (s, n) => String(s).padEnd(n);

function stats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    fastest: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    slowest: sorted[sorted.length - 1],
    average: sum / sorted.length,
  };
}

// Twenty different blood type + district pairs, so no query is ever repeated.
function searchPairs(n) {
  return Array.from({ length: n }, (_, i) => ({
    bloodType: BLOOD_TYPES[i % BLOOD_TYPES.length],
    district: DISTRICTS[(i * 7) % DISTRICTS.length],
  }));
}

async function timedSearch(base, pair) {
  const started = process.hrtime.bigint();
  const res = await fetch(`${base}/api/search?bloodType=${encodeURIComponent(pair.bloodType)}&district=${encodeURIComponent(pair.district)}`);
  const body = await res.json();
  return {
    ...pair,
    ms: Number(process.hrtime.bigint() - started) / 1e6,
    status: res.status,
    donors: body.donors ? body.donors.length : 0,
    centres: body.centres ? body.centres.length : 0,
  };
}

function line(char = '-') {
  console.log(char.repeat(62));
}

async function main() {
  const missing = unweightedBloodTypes();
  if (missing.length) {
    console.error(`Blood types with no load-test weight: ${missing.join(', ')}. Add them to src/loadTestData.js.`);
    process.exitCode = 1;
    return;
  }

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  console.log('');
  console.log('BloodLink Rwanda - performance check (NFR 7 and NFR 8)');
  line('=');

  const seedStarted = process.hrtime.bigint();
  const added = seedLoadTestDonors(DONOR_COUNT);
  const seedMs = Number(process.hrtime.bigint() - seedStarted) / 1e6;
  console.log(`Donor records in the database: ${added}   (built in ${ms(seedMs)})`);
  console.log('');

  // ---- NFR 7: one seeker, twenty searches, one after another ----------------
  console.log(`NFR 7  ${NFR7_SEARCHES} searches, one after another, with ${added} donors`);
  line();
  console.log(`${pad('#', 4)}${pad('Blood type', 12)}${pad('District', 14)}${pad('Found', 14)}${pad('Time', 12)}Budget`);

  const sequential = [];
  for (const [i, pair] of searchPairs(NFR7_SEARCHES).entries()) {
    const r = await timedSearch(base, pair);
    sequential.push(r);
    const found = r.donors > 0 ? `${r.donors}` : `0 (+${r.centres} RCBT)`;
    console.log(
      `${pad(i + 1, 4)}${pad(r.bloodType, 12)}${pad(r.district, 14)}${pad(found, 14)}${pad(ms(r.ms), 12)}${r.ms < NFR7_BUDGET_MS ? 'OK' : 'OVER'}`,
    );
  }

  const seqTimes = sequential.map((r) => r.ms);
  const seqStats = stats(seqTimes);
  const withinBudget = seqTimes.filter((t) => t < NFR7_BUDGET_MS).length;
  const nfr7Pass = withinBudget >= NFR7_MUST_PASS;

  line();
  console.log(`fastest ${ms(seqStats.fastest)} | median ${ms(seqStats.median)} | average ${ms(seqStats.average)} | slowest ${ms(seqStats.slowest)}`);
  console.log(`${withinBudget} of ${NFR7_SEARCHES} under ${NFR7_BUDGET_MS} ms (need ${NFR7_MUST_PASS})  ->  ${nfr7Pass ? 'PASS' : 'FAIL'}`);
  console.log('');

  // ---- NFR 8: fifty seekers searching at the same moment --------------------
  console.log(`NFR 8  ${NFR8_USERS} people searching at the same moment`);
  line();

  const wallStarted = process.hrtime.bigint();
  const concurrent = await Promise.all(searchPairs(NFR8_USERS).map((p) => timedSearch(base, p)));
  const wallClock = Number(process.hrtime.bigint() - wallStarted) / 1e6;

  const conStats = stats(concurrent.map((r) => r.ms));
  const overBudget = concurrent.filter((r) => r.ms >= NFR8_BUDGET_MS);
  const failed = concurrent.filter((r) => r.status !== 200);
  const nfr8Pass = overBudget.length === 0 && failed.length === 0 && wallClock < NFR8_BUDGET_MS;

  console.log(`all ${NFR8_USERS} answered in ${ms(wallClock)} of wall-clock time`);
  console.log(`fastest ${ms(conStats.fastest)} | median ${ms(conStats.median)} | average ${ms(conStats.average)} | slowest ${ms(conStats.slowest)}`);
  console.log(`requests that failed: ${failed.length} | over ${NFR8_BUDGET_MS} ms: ${overBudget.length}`);
  console.log(`-> ${nfr8Pass ? 'PASS' : 'FAIL'}`);
  console.log('');

  line('=');
  console.log(`NFR 7  search under ${NFR7_BUDGET_MS} ms with ${added} donors .......... ${nfr7Pass ? 'PASS' : 'FAIL'}`);
  console.log(`NFR 8  ${NFR8_USERS} at once, each under ${NFR8_BUDGET_MS} ms ................ ${nfr8Pass ? 'PASS' : 'FAIL'}`);
  line('=');
  console.log('');

  server.close();
  if (!nfr7Pass || !nfr8Pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
