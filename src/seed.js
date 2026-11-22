// 30 sample donors for testing and the demo (Sprint 0).
// Phone numbers start with 0700, which no Rwandan network gives out,
// so nobody real is ever called by mistake.
const db = require('./db');

const SAMPLE = [
  ['Aline Uwimana', 'O+', 'Gasabo', 2],
  ['Eric Habimana', 'O+', 'Gasabo', 10],
  ['Claudine Mukamana', 'A+', 'Gasabo', 5],
  ['Jean Bosco Niyonzima', 'B+', 'Gasabo', 30],
  ['Diane Ingabire', 'AB-', 'Gasabo', 12],
  ['Patrick Nshimiyimana', 'O-', 'Kicukiro', 3],
  ['Grace Uwase', 'A-', 'Kicukiro', 40],
  ['Olivier Mugisha', 'O+', 'Kicukiro', 1],
  ['Sandrine Umutoni', 'B-', 'Kicukiro', 20],
  ['Emmanuel Hakizimana', 'AB+', 'Nyarugenge', 8],
  ['Josiane Mukeshimana', 'O+', 'Nyarugenge', 15],
  ['Fabrice Iradukunda', 'A+', 'Nyarugenge', 60],
  ['Chantal Nyirahabimana', 'O-', 'Nyarugenge', 25],
  ['Kevin Ishimwe', 'O+', 'Huye', 4],
  ['Divine Uwamariya', 'A+', 'Huye', 18],
  ['Yves Manzi', 'B+', 'Musanze', 6],
  ['Solange Uwera', 'O+', 'Musanze', 33],
  ['Thierry Ndayishimiye', 'A-', 'Rubavu', 9],
  ['Alice Umuhoza', 'O+', 'Rubavu', 45],
  ['Samuel Nkurunziza', 'AB+', 'Rwamagana', 11],
  ['Vanessa Keza', 'O+', 'Rwamagana', 7],
  ['Didier Twagirayezu', 'B+', 'Muhanga', 14],
  ['Ange Uwamahoro', 'O-', 'Bugesera', 2],
  ['Pacifique Niyigena', 'A+', 'Karongi', 21],
  ['Esther Mutoni', 'O+', 'Nyagatare', 16],
  ['Jean Paul Bizimana', 'A+', 'Gasabo', 50],
  ['Clarisse Umurerwa', 'B-', 'Kicukiro', 13],
  // These two are older than 90 days, so they are hidden from search
  // and show up as "not reconfirmed" for the admin.
  ['Gilbert Rukundo', 'O+', 'Gasabo', 120],
  ['Nadine Ishimwe', 'AB-', 'Kicukiro', 95],
  ['Moses Gatete', 'A+', 'Huye', 3],
];

function seedDemoDonors({ reset = false } = {}) {
  if (reset) db.exec('DELETE FROM donors');
  const count = db.prepare('SELECT COUNT(*) AS n FROM donors').get().n;
  if (count > 0) return 0;

  const insert = db.prepare(`
    INSERT INTO donors (full_name, blood_type, district, phone, consent, registered_at, last_confirmed_at)
    VALUES (?, ?, ?, ?, 1, datetime('now', ?), datetime('now', ?))
  `);
  db.transaction(() => {
    SAMPLE.forEach(([name, type, district, daysAgo], i) => {
      const phone = '0700000' + String(101 + i).padStart(3, '0');
      const when = `-${daysAgo} days`;
      insert.run(name, type, district, phone, when, when);
    });
  })();
  return SAMPLE.length;
}

module.exports = { seedDemoDonors };
