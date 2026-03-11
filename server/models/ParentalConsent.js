const mongoose = require('mongoose');

const parentalConsentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  parentName: {
    type: String,
    required: [true, 'Parent name is required'],
    trim: true,
    minlength: [2, 'Parent name must be at least 2 characters'],
    maxlength: [100, 'Parent name must not exceed 100 characters']
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone number is required'],
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^(\+91)?[6-9]\d{9}$/.test(v);
      },
      message: 'Please provide a valid Indian phone number'
    }
  },
  consentStatus: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Consent status must be pending, approved, or rejected'
    },
    default: 'pending',
    index: true
  },
  consentMethod: {
    type: String,
    enum: {
      values: ['otp', 'paper', 'admin'],
      message: 'Consent method must be otp, paper, or admin'
    },
    default: 'otp'
  },
  // Phase 6: DPDP 2023 Compliance - Consent Versioning
  consentVersion: {
    type: Number,
    default: 1,
    description: 'Version of privacy policy under which consent was given'
  },
  policyVersion: {
    type: String,
    default: '1.0',
    description: 'Privacy policy version (MAJOR.MINOR format)'
  },
  consentHistory: [{
    version: Number,
    policyVersion: String,
    status: String,
    timestamp: Date,
    method: String,
    ipAddress: String
  }],
  policyAcceptanceTimestamp: {
    type: Date,
    description: 'When parent explicitly accepted current policy version'
  },
  requiresReconsent: {
    type: Boolean,
    default: false,
    description: 'True if policy has changed and reconseñt is needed'
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  consentTimestamp: {
    type: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    verificationAttempts: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound indexes for optimized queries
parentalConsentSchema.index({ studentId: 1, consentStatus: 1 });
parentalConsentSchema.index({ parentPhone: 1, consentStatus: 1 });
parentalConsentSchema.index({ createdAt: -1 });

// Prevent duplicate consent records for same student
parentalConsentSchema.index({ studentId: 1 }, { unique: true });

// Virtual to check if consent is valid
parentalConsentSchema.virtual('isValid').get(function() {
  return this.consentStatus === 'approved' && this.consentTimestamp;
});

// Method to check if OTP is expired
parentalConsentSchema.methods.isOtpExpired = function() {
  if (!this.otpExpiresAt) return true;
  return Date.now() > this.otpExpiresAt.getTime();
};

// Method to increment verification attempts
parentalConsentSchema.methods.incrementAttempts = function() {
  this.metadata.verificationAttempts += 1;
  return this.save();
};

// Static method to find active consent by student
parentalConsentSchema.statics.findActiveConsentByStudent = function(studentId) {
  return this.findOne({
    studentId,
    consentStatus: 'approved'
  });
};

// Static method to check if student has valid consent
parentalConsentSchema.statics.hasValidConsent = async function(studentId) {
  const consent = await this.findOne({
    studentId,
    consentStatus: 'approved',
    consentTimestamp: { $exists: true }
  });
  return !!consent;
};

// Pre-save middleware to normalize phone number
parentalConsentSchema.pre('save', function(next) {
  if (this.isModified('parentPhone')) {
    // Remove +91 prefix for storage consistency
    this.parentPhone = this.parentPhone.replace(/^\+91/, '');
  }
  next();
});

// Pre-save middleware to validate OTP expiry logic
parentalConsentSchema.pre('save', function(next) {
  if (this.isModified('otpCode') && this.otpCode) {
    if (!this.otpExpiresAt) {
      return next(new Error('OTP expiry time must be set when OTP is generated'));
    }
  }
  next();
});

// Instance method to sanitize for response
parentalConsentSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.otpCode;
  delete obj.otpExpiresAt;
  return obj;
};

// Static method to clean expired pending consents (cleanup job)
parentalConsentSchema.statics.cleanExpiredPendingConsents = async function() {
  const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.deleteMany({
    consentStatus: 'pending',
    createdAt: { $lt: expiredDate }
  });
};

const ParentalConsent = mongoose.model('ParentalConsent', parentalConsentSchema);

module.exports = ParentalConsent;
