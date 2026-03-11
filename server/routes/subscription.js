const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getSubscription, createOrder, verifyPayment, razorpayWebhook } = require('../controllers/subscriptionController');

router.get('/:schoolId', protect, authorize('school_admin', 'admin'), getSubscription);
router.post('/create-order', protect, authorize('school_admin', 'admin'), createOrder);
router.post('/verify-payment', protect, authorize('school_admin', 'admin'), verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

module.exports = router;
