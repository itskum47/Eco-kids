const mongoose = require("mongoose");

const OutboxEventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    processed: {
        type: Boolean,
        default: false
    },
    processing: {
        type: Boolean,
        default: false
    },
    processingAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

OutboxEventSchema.index({
    processed: 1,
    processing: 1,
    createdAt: 1
});

module.exports = mongoose.model("OutboxEvent", OutboxEventSchema);
