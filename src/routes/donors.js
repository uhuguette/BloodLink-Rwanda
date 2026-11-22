const express = require('express');
const { validateDonor } = require('../validators');
const { registerDonor } = require('../services/donorService');
const { reportDonor } = require('../services/reportService');

const router = express.Router();

// POST /api/donors - register or reconfirm a donor
router.post('/', (req, res) => {
  const { ok, errors, value } = validateDonor(req.body);
  if (!ok) return res.status(400).json({ errors });

  const result = registerDonor(value);
  res.status(result.status === 'created' ? 201 : 200).json(result);
});

// POST /api/donors/:id/report - "this number does not work"
// One browser can report the same donor only once, so one person cannot hide a donor alone.
router.post('/:id/report', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'bad_id' });

  req.session.reported = req.session.reported || [];
  if (req.session.reported.includes(id)) return res.status(409).json({ error: 'already_reported' });

  const result = reportDonor(id);
  if (!result.found) return res.status(404).json({ error: 'not_found' });

  req.session.reported.push(id);
  res.json({ ok: true, hidden: result.hidden });
});

module.exports = router;
