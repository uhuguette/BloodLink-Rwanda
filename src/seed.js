// 30 sample donors for testing and the demo (Sprint 0).
//
// The names and numbers are invented. They use the real Rwandan mobile prefixes
// (078 / 079 for MTN, 072 / 073 for Airtel) so the demo looks like the real
// thing, which means a number here could by chance belong to a real subscriber.
// Nothing dials automatically: a number is only called if a person taps it.
// The Help page says these are sample entries, and SEED_DEMO=false starts the
// site with an empty donor list.
const db = require('./db');

const SAMPLE = [
  ['Aline Uwimana', 'O+', 'Gasabo', 2, '0788412903'],
  ['Eric Habimana', 'O+', 'Gasabo', 10, '0782650174'],
  ['Claudine Mukamana', 'A+', 'Gasabo', 5, '0791338527'],
  ['Jean Bosco Niyonzima', 'B+', 'Gasabo', 30, '0783907241'],
  ['Diane Ingabire', 'AB-', 'Gasabo', 12, '0722581630'],
  ['Patrick Nshimiyimana', 'O-', 'Kicukiro', 3, '0788174592'],
  ['Grace Uwase', 'A-', 'Kicukiro', 40, '0795203846'],
  ['Olivier Mugisha', 'O+', 'Kicukiro', 1, '0733629015'],
  ['Sandrine Umutoni', 'B-', 'Kicukiro', 20, '0781456738'],
  ['Emmanuel Hakizimana', 'AB+', 'Nyarugenge', 8, '0729318604'],
  ['Josiane Mukeshimana', 'O+', 'Nyarugenge', 15, '0786022491'],
  ['Fabrice Iradukunda', 'A+', 'Nyarugenge', 60, '0794735160'],
  ['Chantal Nyirahabimana', 'O-', 'Nyarugenge', 25, '0723847290'],
  ['Kevin Ishimwe', 'O+', 'Huye', 4, '0789561374'],
  ['Divine Uwamariya', 'A+', 'Huye', 18, '0738204916'],
  ['Yves Manzi', 'B+', 'Musanze', 6, '0787390582'],
  ['Solange Uwera', 'O+', 'Musanze', 33, '0792148657'],
  ['Thierry Ndayishimiye', 'A-', 'Rubavu', 9, '0725973408'],
  ['Alice Umuhoza', 'O+', 'Rubavu', 45, '0784615029'],
  ['Samuel Nkurunziza', 'AB+', 'Rwamagana', 11, '0731580743'],
  ['Vanessa Keza', 'O+', 'Rwamagana', 7, '0796427185'],
  ['Didier Twagirayezu', 'B+', 'Muhanga', 14, '0788903265'],
  ['Ange Uwamahoro', 'O-', 'Bugesera', 2, '0727164839'],
  ['Pacifique Niyigena', 'A+', 'Karongi', 21, '0785742310'],
  ['Esther Mutoni', 'O+', 'Nyagatare', 16, '0793058621'],
  ['Jean Paul Bizimana', 'A+', 'Gasabo', 50, '0734296507'],
  ['Clarisse Umurerwa', 'B-', 'Kicukiro', 13, '0780635182'],
  // These two are older than 90 days, so they are hidden from search
  // and show up as "not reconfirmed" for the admin.
  ['Gilbert Rukundo', 'O+', 'Gasabo', 120, '0790417263'],
  ['Nadine Ishimwe', 'AB-', 'Kicukiro', 95, '0726058394'],
  ['Moses Gatete', 'A+', 'Huye', 3, '0783269415'],
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
    SAMPLE.forEach(([name, type, district, daysAgo, phone]) => {
      const when = `-${daysAgo} days`;
      insert.run(name, type, district, phone, when, when);
    });
  })();
  return SAMPLE.length;
}

module.exports = { seedDemoDonors };
