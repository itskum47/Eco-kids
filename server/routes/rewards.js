const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { listRewards, redeemReward, updateRedemption, myRedemptions } = require('../controllers/rewardController');

router.get('/', listRewards);
router.post('/redeem', protect, redeemReward);
router.get('/my-redemptions', protect, myRedemptions);
router.put('/redemptions/:id', protect, authorize('admin'), updateRedemption);

module.exports = router;
