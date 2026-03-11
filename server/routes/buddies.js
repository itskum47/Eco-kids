const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/v1/buddies (requires auth)
// Get user's buddy list
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');

    const user = await User.findById(userId).populate('buddies', 'firstName lastName email ecoPoints');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      buddies: user.buddies || [],
    });
  } catch (error) {
    logger.error('Error fetching buddies', error);
    res.status(500).json({ error: 'Failed to fetch buddies' });
  }
});

// POST /api/v1/buddies/add/:buddyId (requires auth)
// Add a buddy
router.post('/add/:buddyId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { buddyId } = req.params;
    const User = require('../models/User');

    const user = await User.findById(userId);
    const buddy = await User.findById(buddyId);

    if (!buddy) {
      return res.status(404).json({ error: 'Buddy not found' });
    }

    if (!user.buddies) user.buddies = [];
    if (!user.buddies.includes(buddyId)) {
      user.buddies.push(buddyId);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Buddy added successfully',
    });
  } catch (error) {
    logger.error('Error adding buddy', error);
    res.status(500).json({ error: 'Failed to add buddy' });
  }
});

// DELETE /api/v1/buddies/:buddyId (requires auth)
// Remove a buddy
router.delete('/:buddyId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { buddyId } = req.params;
    const User = require('../models/User');

    const user = await User.findById(userId);
    if (!user.buddies) user.buddies = [];

    user.buddies = user.buddies.filter(id => !id.equals(buddyId));
    await user.save();

    res.json({
      success: true,
      message: 'Buddy removed',
    });
  } catch (error) {
    logger.error('Error removing buddy', error);
    res.status(500).json({ error: 'Failed to remove buddy' });
  }
});

module.exports = router;
