const express = require('express');
const School = require('../models/School');
const { protect, authorize } = require('../middleware/auth');

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

// GET /api/v1/schools/:schoolId/settings
// Returns school-level privacy settings for admin surfaces.
router.get('/:schoolId/settings', protect, authorize('school_admin', 'district_admin', 'state_admin', 'admin'), async (req, res) => {
  try {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId).select('name public_leaderboard_enabled max_sensitivity_level').lean();
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    // School admins may only read settings for their own school.
    if (req.user.role === 'school_admin') {
      const adminSchoolId = req.user?.profile?.schoolId;
      if (!adminSchoolId || String(adminSchoolId) !== String(schoolId)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this school' });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        schoolId: school._id,
        schoolName: school.name,
        public_leaderboard_enabled: school.public_leaderboard_enabled !== false,
        max_sensitivity_level: school.max_sensitivity_level || 'distressing'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch school settings' });
  }
});

// PATCH /api/v1/schools/:schoolId/settings
// Admin-only school settings update (extensible for future settings).
router.patch('/:schoolId/settings', protect, authorize('school_admin', 'district_admin', 'state_admin', 'admin'), async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Allow both flat payload and nested `settings` payload for future compatibility.
    const payload = req.body?.settings && typeof req.body.settings === 'object' ? req.body.settings : req.body;
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'public_leaderboard_enabled')) {
      updates.public_leaderboard_enabled = Boolean(payload.public_leaderboard_enabled);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'max_sensitivity_level')) {
      const allowed = ['standard', 'sensitive', 'distressing'];
      if (!allowed.includes(payload.max_sensitivity_level)) {
        return res.status(400).json({ success: false, message: 'max_sensitivity_level must be standard, sensitive, or distressing' });
      }
      updates.max_sensitivity_level = payload.max_sensitivity_level;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid settings provided' });
    }

    // School admins may only update their own school.
    if (req.user.role === 'school_admin') {
      const adminSchoolId = req.user?.profile?.schoolId;
      if (!adminSchoolId || String(adminSchoolId) !== String(schoolId)) {
        return res.status(403).json({ success: false, message: 'Not authorized for this school' });
      }
    }

    const school = await School.findByIdAndUpdate(schoolId, { $set: updates }, { new: true, runValidators: true })
      .select('name public_leaderboard_enabled max_sensitivity_level');

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'School settings updated',
      data: {
        schoolId: school._id,
        schoolName: school.name,
        public_leaderboard_enabled: school.public_leaderboard_enabled !== false,
        max_sensitivity_level: school.max_sensitivity_level || 'distressing'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update school settings' });
  }
});

module.exports = router;
