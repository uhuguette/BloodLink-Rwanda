const db = require('../db');

const findByPhone = db.prepare('SELECT * FROM donors WHERE phone = ?');

const insertDonor = db.prepare(`
  INSERT INTO donors (full_name, blood_type, district, phone, consent)
  VALUES (@fullName, @bloodType, @district, @phone, 1)
`);

// Re-registering with the same phone number counts as a reconfirmation (FR 1.2).
const updateDonor = db.prepare(`
  UPDATE donors
     SET full_name = @fullName,
         blood_type = @bloodType,
         district = @district,
         consent = 1,
         last_confirmed_at = datetime('now'),
         status = 'active'
   WHERE phone = @phone
`);

// FR 1.3: create a new record, or update the existing one for this phone.
const registerDonor = db.transaction((donor) => {
  const existing = findByPhone.get(donor.phone);
  if (existing) {
    updateDonor.run(donor);
    return { status: 'updated', id: existing.id };
  }
  const info = insertDonor.run(donor);
  return { status: 'created', id: Number(info.lastInsertRowid) };
});

module.exports = { registerDonor, findByPhone };
