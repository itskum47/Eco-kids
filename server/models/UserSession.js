const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    device: {
        type: String,
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'unknown'
    },
    ipAddress: {
        type: String,
        required: true
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL: auto-delete expired sessions
    },
    isRevoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSessionSchema.index({ userId: 1, isRevoked: 1 });
userSessionSchema.index({ tokenHash: 1, isRevoked: 1 });

// Revoke all sessions for a user
userSessionSchema.statics.revokeAllForUser = async function (userId, exceptTokenHash = null) {
    const query = { userId, isRevoked: false };
    if (exceptTokenHash) {
        query.tokenHash = { $ne: exceptTokenHash };
    }
    return this.updateMany(query, { $set: { isRevoked: true } });
};

// Check if a session is valid (not revoked and not expired)
userSessionSchema.statics.isSessionValid = async function (tokenHash) {
    const session = await this.findOne({
        tokenHash,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
    return !!session;
};

// Update last active timestamp
userSessionSchema.statics.touchSession = async function (tokenHash) {
    return this.updateOne(
        { tokenHash, isRevoked: false },
        { $set: { lastActiveAt: new Date() } }
    );
};

// Get active sessions count for a user
userSessionSchema.statics.getActiveCount = async function (userId) {
    return this.countDocuments({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
};

module.exports = mongoose.model('UserSession', userSessionSchema);
