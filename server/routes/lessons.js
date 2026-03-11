const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/v1/lessons
// Get all environmental lessons
router.get('/', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const { grade, topic, search } = req.query;

    const filter = {};
    if (grade) filter.gradeLevel = parseInt(grade);
    if (topic) filter.topic = topic;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const lessons = await Lesson.find(filter)
      .select('title description gradeLevel topic duration coverImage')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    logger.error('Error fetching lessons', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /api/v1/lessons/:lessonId
// Get single lesson details
router.get('/:lessonId', async (req, res) => {
  try {
    const Lesson = require('../models/Lesson');
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({
      success: true,
      lesson,
    });
  } catch (error) {
    logger.error('Error fetching lesson', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// POST /api/v1/lessons/:lessonId/complete
// Mark lesson as completed (requires auth)
router.post('/:lessonId/complete', protect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const Lesson = require('../models/Lesson');
    const User = require('../models/User');

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add lesson to user's completed lessons
    if (!user.lessonsCompleted) user.lessonsCompleted = [];
    if (!user.lessonsCompleted.includes(lessonId)) {
      user.lessonsCompleted.push(lessonId);
      user.ecoPoints = (user.ecoPoints || 0) + (lesson.ecoPointsReward || 10);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      ecoPointsEarned: lesson.ecoPointsReward || 10,
    });
  } catch (error) {
    logger.error('Error completing lesson', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

module.exports = router;
