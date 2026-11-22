const db = require('../db');
const { REPORTS_TO_HIDE, RECONFIRM_DAYS } = require('../constants');

const donorExists = db.prepare("SELECT id FROM donors WHERE id = ? AND status = 'active'");
const addReport = db.prepare('INSERT INTO reports (donor_id) VALUES (?)');
const countReports = db.prepare('SELECT COUNT(*) AS n FROM reports WHERE donor_id = ?');
const hideDonor = db.prepare("UPDATE donors SET status = 'hidden' WHERE id = ?");

// FR 3.3: a seeker reports a number that does not work.
const reportDonor = db.transaction((donorId) => {
  if (!donorExists.get(donorId)) return { found: false };
  addReport.run(donorId);
  const reports = countReports.get(donorId).n;
  const hidden = reports >= REPORTS_TO_HIDE;
  if (hidden) hideDonor.run(donorId);
  return { found: true, reports, hidden };
});

// Applies both flagging rules at once (admin review activity diagram):
// not reconfirmed in 90 days, or reported two or more times.
const hideFlagged = db.prepare(`
  UPDATE donors SET status = 'hidden'
   WHERE status = 'active'
     AND (last_confirmed_at < datetime('now', @window)
          OR (SELECT COUNT(*) FROM reports r WHERE r.donor_id = donors.id) >= @limit)
`);

function refreshStatuses() {
  return hideFlagged.run({ window: `-${RECONFIRM_DAYS} days`, limit: REPORTS_TO_HIDE }).changes;
}

module.exports = { reportDonor, refreshStatuses };
