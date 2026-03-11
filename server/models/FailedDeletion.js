const mongoose = require("mongoose");

const FailedDeletionSchema = new mongoose.Schema({
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 10
    },
    failedAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("FailedDeletion", FailedDeletionSchema);
