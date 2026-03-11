const SchoolSubscription = require('../models/SchoolSubscription');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc    Get subscription for school
// @route   GET /api/subscriptions/:schoolId
exports.getSubscription = asyncHandler(async (req, res) => {
    let sub = await SchoolSubscription.findOne({ school: req.params.schoolId }).lean();
    if (!sub) {
        sub = await SchoolSubscription.create({
            school: req.params.schoolId,
            plan: 'free',
            limits: SchoolSubscription.PLAN_LIMITS.free,
            currentPeriod: { start: new Date(), end: new Date(Date.now() + 365 * 86400000) },
        });
    }
    res.json({ success: true, data: sub });
});

// @desc    Create Razorpay order
// @route   POST /api/subscriptions/create-order
exports.createOrder = asyncHandler(async (req, res) => {
    const { schoolId, plan, billingCycle } = req.body;

    const pricing = SchoolSubscription.PRICING;
    if (!pricing[plan]) {
        return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const amountPaise = pricing[plan][billingCycle] || pricing[plan].monthly;

    // Razorpay integration placeholder — replace with actual Razorpay SDK
    const orderId = `order_${crypto.randomBytes(12).toString('hex')}`;

    let sub = await SchoolSubscription.findOne({ school: schoolId });
    if (!sub) {
        sub = await SchoolSubscription.create({ school: schoolId, plan: 'free', limits: SchoolSubscription.PLAN_LIMITS.free });
    }

    sub.razorpay.lastOrderId = orderId;
    await sub.save();

    res.json({
        success: true,
        data: {
            orderId,
            amountPaise,
            currency: 'INR',
            plan,
            billingCycle,
        },
    });
});

// @desc    Verify Razorpay payment (webhook or client callback)
// @route   POST /api/subscriptions/verify-payment
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, schoolId, plan, billingCycle } = req.body;

    // Signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generated = crypto.createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generated !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const limits = SchoolSubscription.PLAN_LIMITS[plan];
    const now = new Date();
    const duration = billingCycle === 'annual' ? 365 : 30;
    const end = new Date(now.getTime() + duration * 86400000);

    const sub = await SchoolSubscription.findOneAndUpdate(
        { school: schoolId },
        {
            $set: {
                plan,
                status: 'active',
                billingCycle,
                amountPaise: SchoolSubscription.PRICING[plan]?.[billingCycle] || 0,
                limits,
                'razorpay.lastPaymentId': razorpay_payment_id,
                currentPeriod: { start: now, end },
            },
            $push: {
                history: {
                    plan,
                    amountPaise: SchoolSubscription.PRICING[plan]?.[billingCycle] || 0,
                    startDate: now,
                    endDate: end,
                    razorpayPaymentId: razorpay_payment_id,
                },
            },
        },
        { new: true, upsert: true }
    );

    res.json({ success: true, data: sub });
});

// @desc    Razorpay webhook handler
// @route   POST /api/subscriptions/webhook
exports.razorpayWebhook = asyncHandler(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
        // Already handled by verify-payment
    } else if (event === 'subscription.cancelled') {
        const subId = payload.subscription?.entity?.id;
        if (subId) {
            await SchoolSubscription.findOneAndUpdate(
                { 'razorpay.subscriptionId': subId },
                { status: 'cancelled' }
            );
        }
    }

    res.json({ success: true });
});
