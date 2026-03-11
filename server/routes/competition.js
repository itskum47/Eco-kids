const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getSchoolLeaderboard,
  getDistrictLeaderboard,
  getStateLeaderboard,
  getStudentLeaderboard
} = require('../controllers/competitionController');

const router = express.Router();

router.get('/schools', getSchoolLeaderboard);
router.get('/districts', getDistrictLeaderboard);
router.get('/states', getStateLeaderboard);
router.get('/students', getStudentLeaderboard);

module.exports = router;
