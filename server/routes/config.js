const express = require('express');
const router = express.Router();
const { featureFlags } = require('../config/featureFlags');

/**
 * @desc    Get all feature flags (public endpoint)
 * @route   GET /api/v1/config/features
 * @access  Public (safe to expose — only booleans, no secrets)
 */
router.get('/features', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      featureFlags: { ...featureFlags },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature flags',
      error: error.message
    });
  }
});

module.exports = router;
