const express = require('express');
const { validateDonor } = require('../validators');
const { registerDonor } = require('../services/donorService');

const router = express.Router();

// POST /api/donors - register or reconfirm a donor
router.post('/', (req, res) => {
  const { ok, errors, value } = validateDonor(req.body);
  if (!ok) return res.status(400).json({ errors });

  const result = registerDonor(value);
  res.status(result.status === 'created' ? 201 : 200).json(result);
});

module.exports = router;
