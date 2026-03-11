const mongoose = require('mongoose');

const GamificationLogSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivitySubmission',
        required: true,
        unique: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GamificationLog', GamificationLogSchema);
