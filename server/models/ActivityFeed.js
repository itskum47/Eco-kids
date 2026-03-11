const mongoose = require("mongoose");

const ActivityFeedSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        required: true
    },
    pointsEarned: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ActivityFeedSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityFeed", ActivityFeedSchema);
