const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        data: notifications
    });
}));

router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { read: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
}));

router.patch('/read-all', protect, asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user.id, read: false },
        { read: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
