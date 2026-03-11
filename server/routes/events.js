const express = require('express');
const router = express.Router();
const SeasonalEvent = require('../models/SeasonalEvent');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/v1/events/seasonal/active
 * Fetch all currently active seasonal events
 * Public endpoint (no auth required)
 */
router.get('/seasonal/active', async (req, res, next) => {
  try {
    const now = new Date();
    const events = await SeasonalEvent.find({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now }
    })
      .select('title description theme bonusMultiplier endsAt eligibleActivityTypes emoji')
      .lean();

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (err) {
    logger.error('[EventsRoute] Error fetching active events:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active events',
      error: err.message
    });
  }
});

/**
 * GET /api/v1/events/seasonal
 * Fetch all seasonal events (admin only)
 */
router.get('/seasonal', protect, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'school_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const events = await SeasonalEvent.find({})
      .sort({ startsAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (err) {
    logger.error('[EventsRoute] Error fetching events:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: err.message
    });
  }
});

/**
 * POST /api/v1/events/seasonal
 * Create a new seasonal event (admin only)
 */
router.post('/seasonal', protect, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create seasonal events'
      });
    }

    const { title, description, theme, startsAt, endsAt, bonusMultiplier, eligibleActivityTypes, specialBadgeId } = req.body;

    // Validation
    if (!title || !description || !theme || !startsAt || !endsAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (new Date(startsAt) >= new Date(endsAt)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const event = await SeasonalEvent.create({
      title,
      description,
      theme,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      bonusMultiplier: bonusMultiplier || 2.0,
      eligibleActivityTypes: eligibleActivityTypes || [],
      specialBadgeId: specialBadgeId || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Seasonal event created successfully',
      data: event
    });
  } catch (err) {
    logger.error('[EventsRoute] Error creating event:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create seasonal event',
      error: err.message
    });
  }
});

module.exports = router;
