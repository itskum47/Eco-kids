const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true
    },
    type: {
        type: String,
        enum: ["points", "badge", "level", "streak", "system"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Auto-delete notifications older than 30 days
    }
});

// High-performance compound index for reading unread notifications quickly
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
