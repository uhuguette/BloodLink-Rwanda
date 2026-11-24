// Builds a large, realistic donor list for the NFR 7 and NFR 8 performance
// checks. It is used by test/performance.test.js and by scripts/benchmark.js,
// so the automated test and the figures quoted in the README come from exactly
// the same data.
//
// Nothing here runs during normal use: the rows are only created when a test or
// the benchmark asks for them.
const db = require('./db');
const { BLOOD_TYPES, DISTRICTS, PROVINCES } = require('./constants');

// 0700 numbers are not issued by any Rwandan network, so no real person can be
// called from test data. The 30 sample donors use 070000xxxx; the load test
// starts at 0700100000 and counts up, so the two never collide.
const PHONE_PREFIX = '0700';
const FIRST_LOAD_TEST_PHONE = 100000;

// Rough real-world blood group frequencies, so the common types are crowded and
// the rare ones are not. A search for AB- then does what it does in real life:
// finds nobody and falls back to the RCBT contacts (FR 3.2).
const BLOOD_TYPE_WEIGHTS = {
  'O+': 37, 'A+': 28, 'B+': 20, 'AB+': 5, 'O-': 4, 'A-': 3, 'B-': 2, 'AB-': 1,
};

// Kigali holds far more people than any other district, so donors cluster there.
const DISTRICT_WEIGHTS = { Gasabo: 12, Kicukiro: 10, Nyarugenge: 8 };
const OTHER_DISTRICT_WEIGHT = 70 / (DISTRICTS.length - 3);

const FIRST_NAMES = [
  'Aline', 'Eric', 'Claudine', 'Jean', 'Grace', 'Emmanuel', 'Diane', 'Patrick',
  'Sandrine', 'Olivier', 'Chantal', 'Fabrice', 'Josiane', 'Thierry', 'Esther',
  'Gilbert', 'Nadine', 'Innocent', 'Clarisse', 'Herve', 'Solange', 'Pacifique',
];
const LAST_NAMES = [
  'Uwase', 'Mugisha', 'Ingabire', 'Habimana', 'Mukamana', 'Niyonzima',
  'Umutoni', 'Rukundo', 'Iradukunda', 'Nshimiyimana', 'Mutesi', 'Bizimana',
];

// A small seeded random number generator, so the same seed always builds the
// same donor list and a failing performance run can be reproduced exactly.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPicker(weights, random) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  return function pick() {
    let n = random() * total;
    for (const [value, weight] of entries) {
      n -= weight;
      if (n <= 0) return value;
    }
    return entries[entries.length - 1][0];
  };
}

function districtWeights() {
  const weights = {};
  DISTRICTS.forEach((d) => { weights[d] = DISTRICT_WEIGHTS[d] || OTHER_DISTRICT_WEIGHT; });
  return weights;
}

// Inserts the donors in one transaction. `daysAgo` becomes the registration and
// last-confirmed date, worked out by SQLite so it is correct whenever this runs.
const insertDonors = db.transaction((rows) => {
  const stmt = db.prepare(`
    INSERT INTO donors (full_name, blood_type, district, phone, consent, registered_at, last_confirmed_at, status)
    VALUES (@fullName, @bloodType, @district, @phone, 1,
            datetime('now', '-' || @daysAgo || ' days'),
            datetime('now', '-' || @daysAgo || ' days'),
            'active')
  `);
  rows.forEach((row) => stmt.run(row));
  return rows.length;
});

function seedLoadTestDonors(count = 1000, seed = 20260924) {
  const random = mulberry32(seed);
  const pickBloodType = weightedPicker(BLOOD_TYPE_WEIGHTS, random);
  const pickDistrict = weightedPicker(districtWeights(), random);

  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    rows.push({
      fullName: `${first} ${last}`,
      bloodType: pickBloodType(),
      district: pickDistrict(),
      phone: PHONE_PREFIX + String(FIRST_LOAD_TEST_PHONE + i).padStart(6, '0'),
      // Every donor reconfirmed within the last 85 days, so all of them are
      // searchable and the 90-day rule does not quietly shrink the data set.
      daysAgo: Math.floor(random() * 85),
    });
  }

  return insertDonors(rows);
}

// Checks BLOOD_TYPES is still the list the weights were written for, so adding
// a blood group later cannot silently leave it out of the load test.
function unweightedBloodTypes() {
  return BLOOD_TYPES.filter((t) => !(t in BLOOD_TYPE_WEIGHTS));
}

module.exports = {
  seedLoadTestDonors,
  unweightedBloodTypes,
  PHONE_PREFIX,
  BLOOD_TYPE_WEIGHTS,
  PROVINCES,
};
