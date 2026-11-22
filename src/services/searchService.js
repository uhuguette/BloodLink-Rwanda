const db = require('../db');
const { MAX_RESULTS, RECONFIRM_DAYS, provinceOf } = require('../constants');

// FR 2.3: only active donors who reconfirmed in the last 90 days are searchable.
const searchStmt = db.prepare(`
  SELECT id, full_name, blood_type, district, phone, last_confirmed_at
    FROM donors
   WHERE blood_type = @bloodType
     AND district = @district
     AND status = 'active'
     AND last_confirmed_at >= datetime('now', @window)
   ORDER BY last_confirmed_at DESC
   LIMIT @limit
`);

const centresStmt = db.prepare('SELECT id, name, city, province, phone FROM rcbt_centres ORDER BY id');

// NFR 5: only the first name leaves the server.
function firstName(fullName) {
  return String(fullName).trim().split(/\s+/)[0];
}

function searchDonors(bloodType, district) {
  return searchStmt
    .all({ bloodType, district, window: `-${RECONFIRM_DAYS} days`, limit: MAX_RESULTS })
    .map((d) => ({
      id: d.id,
      firstName: firstName(d.full_name),
      bloodType: d.blood_type,
      district: d.district,
      phone: d.phone,
      lastConfirmed: d.last_confirmed_at,
    }));
}

// FR 4.1: all centres, with the one serving the seeker's province first.
function centresFor(district) {
  const province = provinceOf(district);
  return centresStmt
    .all()
    .map((c) => ({ ...c, nearest: c.province === province }))
    .sort((a, b) => Number(b.nearest) - Number(a.nearest));
}

module.exports = { searchDonors, centresFor, firstName };
