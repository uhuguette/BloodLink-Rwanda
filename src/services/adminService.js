const bcrypt = require('bcryptjs');
const db = require('../db');
const { RECONFIRM_DAYS, REPORTS_TO_HIDE } = require('../constants');
const { refreshStatuses } = require('./reportService');

const MIN_PASSWORD = 8; // NFR 2
const MIN_USERNAME = 3;
const MAX_USERNAME = 32;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

// How many admin accounts exist. Zero means the site still needs its first
// admin, which is created on the sign-up page (FR 5.0).
function adminCount() {
  return db.prepare('SELECT COUNT(*) AS n FROM admins').get().n;
}

const adminExists = () => adminCount() > 0;

// Optional shortcut for servers: when ADMIN_USERNAME and ADMIN_PASSWORD are both
// set and no admin exists yet, create that account at start-up. When they are not
// set, nothing is created and the first admin signs up at /signup instead. No
// default password is ever created, so the only credentials that work are the
// ones the administrator chose.
function ensureAdmin() {
  if (adminExists()) return null;

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;

  const check = validateAdminInput(username, password);
  if (!check.ok) {
    console.warn(`ADMIN_USERNAME / ADMIN_PASSWORD were ignored: ${check.error}. Create the admin at /signup instead.`);
    return null;
  }
  createAdmin(check.value.username, password);
  return check.value.username;
}

// Returns { ok, error, value }. The error is a translation key so the sign-up
// page can show it in English or Kinyarwanda.
function validateAdminInput(username, password, confirm) {
  const name = String(username || '').trim();
  const pass = String(password || '');

  if (name.length < MIN_USERNAME || name.length > MAX_USERNAME) return { ok: false, error: 'signup_err_username' };
  if (!USERNAME_PATTERN.test(name)) return { ok: false, error: 'signup_err_username' };
  if (pass.length < MIN_PASSWORD) return { ok: false, error: 'signup_err_password' };
  if (confirm !== undefined && pass !== String(confirm)) return { ok: false, error: 'signup_err_match' };

  return { ok: true, value: { username: name } };
}

function createAdmin(username, password) {
  const check = validateAdminInput(username, password);
  if (!check.ok) throw new Error(`Invalid admin details (${check.error}).`);

  const name = check.value.username;
  if (db.prepare('SELECT 1 FROM admins WHERE username = ?').get(name)) {
    throw new Error('taken');
  }
  const hash = bcrypt.hashSync(password, 12); // stored as a hash, never as plain text
  const info = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(name, hash);
  return { id: Number(info.lastInsertRowid), username: name };
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

module.exports = {
  ensureAdmin,
  createAdmin,
  validateAdminInput,
  adminCount,
  adminExists,
  checkLogin,
  listDonors,
  removeDonor,
  keepDonor,
  removalLog,
  MIN_PASSWORD,
  MIN_USERNAME,
  MAX_USERNAME,
};
