// 30 sample donors for testing and the demo (Sprint 0).
//
// The names and numbers are invented. They use the real Rwandan mobile prefixes
// (078 / 079 for MTN, 072 / 073 for Airtel) so the demo looks like the real
// thing, which means a number here could by chance belong to a real subscriber.
// Nothing dials automatically: a number is only called if a person taps it.
// The Help page says these are sample entries, and SEED_DEMO=false starts the
// site with an empty donor list.
const crypto = require('crypto');
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

const FINGERPRINT_KEY = 'sample_donors_fingerprint';

// A short hash of the sample list. When anything in SAMPLE changes - a phone
// number, a district, a whole donor - the hash changes, which is how an
// existing database knows its demo data is out of date.
function fingerprint() {
  return crypto.createHash('sha256').update(JSON.stringify(SAMPLE)).digest('hex').slice(0, 16);
}

const readFingerprint = () => {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(FINGERPRINT_KEY);
  return row ? row.value : null;
};

const writeFingerprint = (value) => db
  .prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
  .run(FINGERPRINT_KEY, value);

// Rows written before is_sample existed carry no marker. The first run after
// the upgrade marks the ones whose name is in the sample list; everybody else
// is treated as a real registration and is never touched again.
function markOldSampleRows() {
  const mark = db.prepare('UPDATE donors SET is_sample = 1 WHERE full_name = ? AND is_sample = 0');
  return SAMPLE.reduce((n, [name]) => n + mark.run(name).changes, 0);
}

// Brings the sample donors in the database into line with SAMPLE: updates the
// ones already there, adds the missing ones, drops sample rows that have been
// taken out of the list. Donors who registered themselves (is_sample = 0) are
// never read, changed or deleted here.
const syncSampleDonors = db.transaction(() => {
  const existing = new Map(
    db.prepare('SELECT id, full_name FROM donors WHERE is_sample = 1').all().map((r) => [r.full_name, r.id]),
  );

  const update = db.prepare(`
    UPDATE donors
       SET blood_type = @bloodType, district = @district, phone = @phone,
           registered_at = datetime('now', @when), last_confirmed_at = datetime('now', @when),
           status = 'active'
     WHERE id = @id
  `);
  const insert = db.prepare(`
    INSERT INTO donors (full_name, blood_type, district, phone, consent, registered_at, last_confirmed_at, is_sample)
    VALUES (@fullName, @bloodType, @district, @phone, 1, datetime('now', @when), datetime('now', @when), 1)
  `);

  const result = { inserted: 0, updated: 0, removed: 0, skipped: [] };
  const wanted = new Set();

  SAMPLE.forEach(([fullName, bloodType, district, daysAgo, phone]) => {
    wanted.add(fullName);
    const when = `-${daysAgo} days`;
    const id = existing.get(fullName);
    try {
      if (id) {
        update.run({ id, bloodType, district, phone, when });
        result.updated += 1;
      } else {
        insert.run({ fullName, bloodType, district, phone, when });
        result.inserted += 1;
      }
    } catch (e) {
      // Almost always a real donor already using that number. Leave both rows
      // alone rather than fail at start-up.
      result.skipped.push(`${fullName} (${e.message})`);
    }
  });

  const remove = db.prepare('DELETE FROM donors WHERE is_sample = 1 AND full_name = ?');
  existing.forEach((id, name) => {
    if (!wanted.has(name)) result.removed += remove.run(name).changes;
  });

  return result;
});

// Called at every start-up. It does nothing at all once the database already
// matches the sample list, so the normal case costs one small SELECT.
//
//   reset: true  delete every donor, including real registrations, and start over
//   force: true  re-sync the sample donors even if the fingerprint matches
function seedDemoDonors({ reset = false, force = false } = {}) {
  if (reset) {
    db.exec('DELETE FROM donors');
    db.prepare('DELETE FROM meta WHERE key = ?').run(FINGERPRINT_KEY);
  }

  const current = fingerprint();
  if (!reset && !force && readFingerprint() === current) {
    return { inserted: 0, updated: 0, removed: 0, skipped: [], upToDate: true };
  }

  if (!reset) markOldSampleRows();
  const result = syncSampleDonors();
  writeFingerprint(current);

  if (result.skipped.length) {
    console.warn(`Sample donors skipped: ${result.skipped.join(', ')}`);
  }
  return { ...result, upToDate: false };
}

// "3 added, 2 updated" for the start-up log; null when there was nothing to do.
function describeSeed(result) {
  const parts = [];
  if (result.inserted) parts.push(`${result.inserted} added`);
  if (result.updated) parts.push(`${result.updated} updated`);
  if (result.removed) parts.push(`${result.removed} removed`);
  return parts.length ? parts.join(', ') : null;
}

module.exports = { seedDemoDonors, describeSeed, SAMPLE };
