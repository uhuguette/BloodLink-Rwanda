const bcrypt = require('bcryptjs');
const db = require('../db');
const { RECONFIRM_DAYS, REPORTS_TO_HIDE } = require('../constants');
const { refreshStatuses } = require('./reportService');

const MIN_PASSWORD = 8; // NFR 2

// Creates the first admin from ADMIN_USERNAME / ADMIN_PASSWORD when none exists.
function ensureAdmin() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM admins').get().n;
  if (count > 0) return null;

  const username = process.env.ADMIN_USERNAME || 'admin';
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = 'BloodLink2026!';
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`No ADMIN_PASSWORD set. Created admin "${username}" with the default password from the README. Change it before going live.`);
    }
  }
  createAdmin(username, password);
  return username;
}

function createAdmin(username, password) {
  if (String(password).length < MIN_PASSWORD) {
    throw new Error(`Admin password must be at least ${MIN_PASSWORD} characters.`);
  }
  const hash = bcrypt.hashSync(password, 12); // stored as a hash, never as plain text
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
}

// Compares against a dummy hash for unknown users so the response time does not reveal usernames.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
function checkLogin(username, password) {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(username || ''));
  const ok = bcrypt.compareSync(String(password || ''), admin ? admin.password_hash : DUMMY_HASH);
  return ok && admin ? { id: admin.id, username: admin.username } : null;
}

// FR 5.2: full list with flags so the admin can see why a donor is hidden.
function listDonors() {
  refreshStatuses();
  return db.prepare(`
    SELECT d.id, d.full_name AS fullName, d.blood_type AS bloodType, d.district, d.phone,
           d.registered_at AS registeredAt, d.last_confirmed_at AS lastConfirmed, d.status,
           (SELECT COUNT(*) FROM reports r WHERE r.donor_id = d.id) AS reports,
           d.last_confirmed_at < datetime('now', @window) AS stale
      FROM donors d
     ORDER BY (d.status = 'hidden') DESC, reports DESC, d.last_confirmed_at ASC
  `).all({ window: `-${RECONFIRM_DAYS} days` }).map((d) => ({
    ...d,
    stale: Boolean(d.stale),
    flags: [
      ...(d.stale ? ['stale'] : []),
      ...(d.reports >= REPORTS_TO_HIDE ? ['reported'] : []),
    ],
  }));
}

// FR 5.3 + NFR 3: delete the donor and write the log entry in one step.
const removeDonor = db.transaction((donorId, adminUsername, reason) => {
  const donor = db.prepare('SELECT * FROM donors WHERE id = ?').get(donorId);
  if (!donor) return null;
  db.prepare('DELETE FROM donors WHERE id = ?').run(donorId);
  db.prepare(`INSERT INTO removal_log (admin_username, donor_id, donor_summary, reason) VALUES (?, ?, ?, ?)`)
    .run(adminUsername, donorId, `${donor.full_name} (${donor.blood_type}, ${donor.district})`, reason || null);
  return donor;
});

// "Keep" decision: clear the reports and make the donor visible again.
// A donor older than 90 days stays hidden until they reconfirm.
const keepDonor = db.transaction((donorId) => {
  const info = db.prepare("UPDATE donors SET status = 'active' WHERE id = ?").run(donorId);
  if (!info.changes) return false;
  db.prepare('DELETE FROM reports WHERE donor_id = ?').run(donorId);
  refreshStatuses();
  return true;
});

function removalLog() {
  return db.prepare(`
    SELECT id, admin_username AS adminUsername, donor_id AS donorId, donor_summary AS donor, reason, removed_at AS removedAt
      FROM removal_log ORDER BY id DESC LIMIT 200
  `).all();
}

module.exports = { ensureAdmin, createAdmin, checkLogin, listDonors, removeDonor, keepDonor, removalLog, MIN_PASSWORD };
