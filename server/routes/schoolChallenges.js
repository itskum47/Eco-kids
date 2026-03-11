const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// POST /api/v1/school-challenges (requires auth, school_admin)
// Create a new school challenge
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'school_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, ecoPointsReward, endDate, targetCategory } = req.body;
    const SchoolChallenge = require('../models/SchoolChallenge');

    const challenge = await SchoolChallenge.create({
      schoolId: req.user.schoolId,
      title,
      description,
      ecoPointsReward,
      endDate,
      targetCategory,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      challenge,
    });
  } catch (error) {
    logger.error('Error creating school challenge', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// GET /api/v1/school-challenges/school/:schoolId
// Get all challenges for a school
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const SchoolChallenge = require('../models/SchoolChallenge');

    const challenges = await SchoolChallenge.find({ schoolId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      challenges,
    });
  } catch (error) {
    logger.error('Error fetching school challenges', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// GET /api/v1/school-challenges/:challengeId
// Get single challenge details
router.get('/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const SchoolChallenge = require('../models/SchoolChallenge');

    const challenge = await SchoolChallenge.findById(challengeId)
      .populate('participants', 'firstName lastName ecoPoints');
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    logger.error('Error fetching school challenge', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// POST /api/v1/school-challenges/:challengeId/join (requires auth)
// Student joins a challenge
router.post('/:challengeId/join', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;
    const SchoolChallenge = require('../models/SchoolChallenge');

    const challenge = await SchoolChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      await challenge.save();
    }

    res.json({
      success: true,
      message: 'Joined challenge',
    });
  } catch (error) {
    logger.error('Error joining challenge', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

// POST /api/v1/school-challenges/:challengeId/submit (requires auth)
// Submit attempt for challenge
router.post('/:challengeId/submit', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { description, photoUrl } = req.body;
    const userId = req.user.id;
    
    const SchoolChallenge = require('../models/SchoolChallenge');
    const Gamification = require('../models/Gamification');

    const challenge = await SchoolChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Award eco-points for submission
    let gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      gamification = await Gamification.create({ userId, ecoPoints: 0 });
    }

    gamification.ecoPoints += challenge.ecoPointsReward;
    await gamification.save();

    // Record submission
    challenge.submissions = challenge.submissions || [];
    challenge.submissions.push({
      userId,
      description,
      photoUrl,
      submittedAt: new Date(),
    });
    await challenge.save();

    res.json({
      success: true,
      message: `Awarded ${challenge.ecoPointsReward} eco-points`,
    });
  } catch (error) {
    logger.error('Error submitting challenge', error);
    res.status(500).json({ error: 'Failed to submit challenge' });
  }
});

// PATCH /api/v1/school-challenges/:challengeId (requires auth, school_admin)
// Update challenge
router.patch('/:challengeId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'school_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { challengeId } = req.params;
    const updates = req.body;
    const SchoolChallenge = require('../models/SchoolChallenge');

    const challenge = await SchoolChallenge.findByIdAndUpdate(challengeId, updates, { new: true });
    res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    logger.error('Error updating challenge', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// DELETE /api/v1/school-challenges/:challengeId (requires auth, school_admin)
// Delete challenge
router.delete('/:challengeId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'school_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { challengeId } = req.params;
    const SchoolChallenge = require('../models/SchoolChallenge');

    await SchoolChallenge.findByIdAndDelete(challengeId);
    res.json({
      success: true,
      message: 'Challenge deleted',
    });
  } catch (error) {
    logger.error('Error deleting challenge', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

module.exports = router;
