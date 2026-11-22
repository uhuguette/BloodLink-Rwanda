const express = require('express');
const { BLOOD_TYPES, DISTRICTS, PROVINCES } = require('../constants');

const router = express.Router();

// GET /api/meta - lists used to fill the drop-downs on every page
router.get('/', (req, res) => {
  res.json({ bloodTypes: BLOOD_TYPES, districts: DISTRICTS, provinces: PROVINCES });
});

module.exports = router;
