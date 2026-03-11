const express = require('express');
const School = require('../models/School');

const router = express.Router();

router.get('/verify-code/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) {
      return res.json({ valid: false });
    }

    const school = await School.findOne({ $or: [{ schoolCode: code }, { code }] }).select('name');
    if (!school) {
      return res.json({ valid: false });
    }

    return res.json({ valid: true, schoolName: school.name });
  } catch (error) {
    return res.status(500).json({ valid: false });
  }
});

module.exports = router;
