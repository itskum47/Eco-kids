const mongoose = require('mongoose');

const planLimits = {
    free: { students: 30, teachers: 2, features: ['basic_lessons', 'quizzes'] },
    pilot: { students: 100, teachers: 5, features: ['basic_lessons', 'quizzes', 'leaderboard', 'badges'] },
    standard: { students: 500, teachers: 20, features: ['basic_lessons', 'quizzes', 'leaderboard', 'badges', 'competitions', 'analytics', 'cms'] },
    premium: { students: 5000, teachers: 100, features: ['basic_lessons', 'quizzes', 'leaderboard', 'badges', 'competitions', 'analytics', 'cms', 'api_access', 'white_label', 'video_streaming'] },
    government: { students: 50000, teachers: 1000, features: ['all'] },
};

const schoolSubscriptionSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
    plan: { type: String, enum: ['free', 'pilot', 'standard', 'premium', 'government'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled', 'past_due'], default: 'active' },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'annual' },
    amountPaise: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },

    razorpay: {
        customerId: String,
        subscriptionId: String,
        lastOrderId: String,
        lastPaymentId: String,
    },

    currentPeriod: {
        start: Date,
        end: Date,
    },

    limits: {
        students: { type: Number, default: 30 },
        teachers: { type: Number, default: 2 },
        features: [String],
    },

    usage: {
        currentStudents: { type: Number, default: 0 },
        currentTeachers: { type: Number, default: 0 },
    },

    history: [{
        plan: String,
        amountPaise: Number,
        startDate: Date,
        endDate: Date,
        razorpayPaymentId: String,
    }],
}, { timestamps: true });

schoolSubscriptionSchema.statics.PLAN_LIMITS = planLimits;

schoolSubscriptionSchema.statics.PRICING = {
    standard: { monthly: 199900, annual: 179900 },  // ₹1999/mo or ₹1799/mo annual
    premium: { monthly: 499900, annual: 449900 },    // ₹4999/mo or ₹4499/mo annual
};

schoolSubscriptionSchema.methods.isFeatureEnabled = function (feature) {
    if (this.limits.features.includes('all')) return true;
    return this.limits.features.includes(feature);
};

schoolSubscriptionSchema.methods.canAddStudent = function () {
    return this.usage.currentStudents < this.limits.students;
};

schoolSubscriptionSchema.methods.canAddTeacher = function () {
    return this.usage.currentTeachers < this.limits.teachers;
};

schoolSubscriptionSchema.index({ school: 1 }, { unique: true });
schoolSubscriptionSchema.index({ status: 1, 'currentPeriod.end': 1 });

module.exports = mongoose.model('SchoolSubscription', schoolSubscriptionSchema);
