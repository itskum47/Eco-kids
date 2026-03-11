const express = require('express');
const { protect } = require('../middleware/auth');
const {
  logHabit,
  getMyHabits,
  getMyStreak
} = require('../controllers/habitController');

const router = express.Router();

router.post('/log', protect, logHabit);
router.get('/me', protect, getMyHabits);
router.get('/streak', protect, getMyStreak);

module.exports = router;
