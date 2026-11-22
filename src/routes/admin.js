const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const { checkLogin, listDonors, removeDonor, keepDonor, removalLog } = require('../services/adminService');

const router = express.Router();

// Slow down password guessing: 5 wrong tries per IP, then wait 10 minutes.
const attempts = new Map();
const MAX_TRIES = 5;
const LOCK_MS = 10 * 60 * 1000;

function tooManyTries(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > LOCK_MS) { attempts.delete(ip); return false; }
  return entry.count >= MAX_TRIES;
}

function recordFailure(ip) {
  const entry = attempts.get(ip) || { count: 0, first: Date.now() };
  entry.count += 1;
  attempts.set(ip, entry);
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  if (tooManyTries(req.ip)) return res.status(429).json({ error: 'too_many_tries' });

  const admin = checkLogin(req.body.username, req.body.password);
  if (!admin) {
    recordFailure(req.ip);
    return res.status(401).json({ error: 'access_denied' });
  }

  attempts.delete(req.ip);
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'session' });
    req.session.admin = admin;
    res.json({ ok: true, username: admin.username });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('bloodlink.sid');
    res.json({ ok: true });
  });
});

router.get('/me', requireAdmin, (req, res) => res.json({ username: req.session.admin.username }));

router.get('/donors', requireAdmin, (req, res) => res.json({ donors: listDonors() }));

router.delete('/donors/:id', requireAdmin, (req, res) => {
  const removed = removeDonor(Number(req.params.id), req.session.admin.username, String(req.body?.reason || '').slice(0, 200));
  if (!removed) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

router.post('/donors/:id/keep', requireAdmin, (req, res) => {
  if (!keepDonor(Number(req.params.id))) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

router.get('/log', requireAdmin, (req, res) => res.json({ log: removalLog() }));

module.exports = router;
