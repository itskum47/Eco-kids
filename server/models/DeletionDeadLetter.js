const mongoose = require("mongoose");

const DeletionDeadLetterSchema = new mongoose.Schema({
    storageKey: {
        type: String,
        required: true
    },
    failedAt: {
        type: Date,
        required: true
    },
    retryCount: {
        type: Number,
        required: true
    },
    lastError: {
        type: String
    }
});

module.exports = mongoose.model(
    "DeletionDeadLetter",
    DeletionDeadLetterSchema
);
