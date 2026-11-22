const express = require('express');
const { BLOOD_TYPES, DISTRICTS } = require('../constants');
const { searchDonors, centresFor } = require('../services/searchService');

const router = express.Router();

// GET /api/search?bloodType=O-&district=Gasabo
router.get('/search', (req, res) => {
  const bloodType = String(req.query.bloodType || '').toUpperCase();
  const district = String(req.query.district || '');

  const errors = {};
  if (!BLOOD_TYPES.includes(bloodType)) errors.bloodType = 'err_blood_type';
  if (!DISTRICTS.includes(district)) errors.district = 'err_district';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const donors = searchDonors(bloodType, district);

  // FR 3.2: never leave the seeker with an empty screen.
  res.json({
    bloodType,
    district,
    donors,
    centres: donors.length === 0 ? centresFor(district) : [],
  });
});

// GET /api/rcbt?district=Huye
router.get('/rcbt', (req, res) => {
  res.json({ centres: centresFor(String(req.query.district || '')) });
});

module.exports = router;
