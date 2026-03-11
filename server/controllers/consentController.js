const crypto = require('crypto');
const ParentalConsent = require('../models/ParentalConsent');
const { logAuditEvent } = require('../utils/auditLogger');

// Generate secure 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * @desc    Verify parental consent using token from email link (DPDP Act 2023)
 * @route   POST /api/v1/consent/parent/verify
 * @access  Public
 */
exports.verifyParentConsentToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Consent token is required'
      });
    }
    
    const parentalConsentService = require('../services/parentalConsentService');
    const result = await parentalConsentService.verifyParentalConsent(token);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('[ConsentController] verifyParentConsentToken error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request parental consent
// @route   POST /api/consent/request
// @access  Public
exports.requestConsent = async (req, res, next) => {
  try {
    const { studentId, parentName, parentPhone } = req.body;

    // Validate required fields
    if (!studentId || !parentName || !parentPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, parentName, and parentPhone'
      });
    }

    // Check if consent already exists
    const existingConsent = await ParentalConsent.findOne({ studentId });

    if (existingConsent) {
      // If already approved, don't allow re-request
      if (existingConsent.consentStatus === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Consent already approved for this student'
        });
      }

      // If pending with OTP, check cooldown (prevent spam)
      // Skip cooldown for auto-created PENDING records (no OTP yet)
      if (existingConsent.otpExpiresAt) {
        const timeSinceLastOTP = Date.now() - existingConsent.updatedAt.getTime();
        if (timeSinceLastOTP < 60000) { // 1 minute cooldown
          return res.status(429).json({
            success: false,
            message: 'Please wait before requesting another OTP',
            retryAfter: Math.ceil((60000 - timeSinceLastOTP) / 1000)
          });
        }
      }
    }

    // Generate secure OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Extract request metadata
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      verificationAttempts: 0
    };

    let consent;

    if (existingConsent) {
      // Update existing pending consent
      existingConsent.parentName = parentName;
      existingConsent.parentPhone = parentPhone;
      existingConsent.otpCode = otpCode;
      existingConsent.otpExpiresAt = otpExpiresAt;
      existingConsent.consentStatus = 'pending';
      existingConsent.metadata = metadata;
      consent = await existingConsent.save();
    } else {
      // Create new consent record
      consent = await ParentalConsent.create({
        studentId,
        parentName,
        parentPhone,
        otpCode,
        otpExpiresAt,
        consentStatus: 'pending',
        metadata
      });
    }

    // Log audit event
    await logAuditEvent({
      actorId: studentId,
      actorRole: 'student',
      action: 'CONSENT_REQUESTED',
      targetType: 'CONSENT',
      targetId: consent._id.toString(),
      metadata: {
        parentPhone: parentPhone.slice(-4), // Only last 4 digits for privacy
        parentName,
        method: 'otp'
      },
      req,
      status: 'success'
    }).catch(err => console.error('Audit log error:', err));

    // Return success (OTP would be sent via SMS in production)
    res.status(200).json({
      success: true,
      message: 'OTP sent to parent phone number',
      data: {
        consentId: consent._id,
        expiresAt: otpExpiresAt,
        expiresIn: 600 // seconds
      },
      // DEV ONLY: Return OTP in response (remove in production)
      ...(process.env.NODE_ENV === 'development' && { devOtp: otpCode })
    });

  } catch (error) {
    // Log failed audit event
    await logAuditEvent({
      actorId: req.body.studentId || 'unknown',
      actorRole: 'student',
      action: 'CONSENT_REQUESTED',
      targetType: 'parental_consent',
      targetId: null,
      metadata: { error: error.message },
      req,
      status: 'failure',
      errorMessage: error.message
    }).catch(err => console.error('Audit log error:', err));

    next(error);
  }
};

// @desc    Verify parental consent with OTP
// @route   POST /api/consent/verify
// @access  Public
exports.verifyConsent = async (req, res, next) => {
  try {
    const { studentId, otp } = req.body;

    // Validate required fields
    if (!studentId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId and otp'
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits'
      });
    }

    // Find consent record with OTP details (explicitly select)
    const consent = await ParentalConsent.findOne({ studentId })
      .select('+otpCode +otpExpiresAt');

    if (!consent) {
      await logAuditEvent({
        actorId: studentId,
        actorRole: 'parent',
        action: 'CONSENT_VERIFICATION_FAILED',
        targetType: 'parental_consent',
        targetId: null,
        metadata: { reason: 'consent_not_found' },
        req,
        status: 'failure'
      }).catch(err => console.error('Audit log error:', err));

      return res.status(404).json({
        success: false,
        message: 'No consent request found for this student'
      });
    }

    // Check if already approved
    if (consent.consentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Consent already approved'
      });
    }

    // Rate limiting: Check verification attempts
    if (consent.metadata.verificationAttempts >= 5) {
      await logAuditEvent({
        actorId: studentId,
        actorRole: 'parent',
        action: 'CONSENT_VERIFICATION_FAILED',
        targetType: 'parental_consent',
        targetId: consent._id.toString(),
        metadata: { reason: 'max_attempts_exceeded' },
        req,
        status: 'failure'
      }).catch(err => console.error('Audit log error:', err));

      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP'
      });
    }

    // Check OTP expiry
    if (consent.isOtpExpired()) {
      await consent.incrementAttempts();

      await logAuditEvent({
        actorId: studentId,
        actorRole: 'parent',
        action: 'CONSENT_VERIFICATION_FAILED',
        targetType: 'parental_consent',
        targetId: consent._id.toString(),
        metadata: { reason: 'otp_expired' },
        req,
        status: 'failure'
      }).catch(err => console.error('Audit log error:', err));

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one'
      });
    }

    // Verify OTP
    if (consent.otpCode !== otp) {
      await consent.incrementAttempts();

      await logAuditEvent({
        actorId: studentId,
        actorRole: 'parent',
        action: 'CONSENT_VERIFICATION_FAILED',
        targetType: 'parental_consent',
        targetId: consent._id.toString(),
        metadata: { 
          reason: 'invalid_otp',
          attempts: consent.metadata.verificationAttempts
        },
        req,
        status: 'failure'
      }).catch(err => console.error('Audit log error:', err));

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: 5 - consent.metadata.verificationAttempts
      });
    }

    // OTP verified successfully - Update consent
    consent.consentStatus = 'approved';
    consent.consentTimestamp = new Date();
    consent.otpCode = undefined; // Remove OTP
    consent.otpExpiresAt = undefined; // Remove expiry
    consent.metadata.ipAddress = req.ip || req.connection.remoteAddress;
    consent.metadata.userAgent = req.headers['user-agent'];

    await consent.save();

    // Log successful audit event
    await logAuditEvent({
      actorId: studentId,
      actorRole: 'parent',
      action: 'CONSENT_GRANTED',
      targetType: 'parental_consent',
      targetId: consent._id.toString(),
      metadata: {
        parentName: consent.parentName,
        parentPhone: consent.parentPhone.slice(-4),
        method: consent.consentMethod,
        timestamp: consent.consentTimestamp
      },
      req,
      status: 'success',
      dataClassification: 'confidential',
      complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023']
    }).catch(err => console.error('Audit log error:', err));

    res.status(200).json({
      success: true,
      message: 'Parental consent verified successfully',
      data: {
        consentId: consent._id,
        studentId: consent.studentId,
        consentStatus: consent.consentStatus,
        consentTimestamp: consent.consentTimestamp,
        parentName: consent.parentName
      }
    });

  } catch (error) {
    // Log failed audit event
    await logAuditEvent({
      actorId: req.body.studentId || 'unknown',
      actorRole: 'parent',
      action: 'CONSENT_VERIFICATION_FAILED',
      targetType: 'parental_consent',
      targetId: null,
      metadata: { error: error.message },
      req,
      status: 'failure',
      errorMessage: error.message
    }).catch(err => console.error('Audit log error:', err));

    next(error);
  }
};

// @desc    Get consent status for a student
// @route   GET /api/consent/status/:studentId
// @access  Public (or protected based on requirements)
exports.getConsentStatus = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const consent = await ParentalConsent.findOne({ studentId });

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'No consent record found for this student',
        data: {
          hasConsent: false,
          consentStatus: null
        }
      });
    }

    // Log audit event for consent status check
    await logAuditEvent({
      actorId: req.user ? req.user.id : studentId,
      actorRole: req.user ? req.user.role : 'student',
      action: 'CONSENT_STATUS_CHECKED',
      targetType: 'parental_consent',
      targetId: consent._id.toString(),
      metadata: {
        studentId,
        status: consent.consentStatus
      },
      req,
      status: 'success'
    }).catch(err => console.error('Audit log error:', err));

    res.status(200).json({
      success: true,
      data: {
        hasConsent: consent.consentStatus === 'approved',
        consentId: consent._id,
        studentId: consent.studentId,
        parentName: consent.parentName,
        consentStatus: consent.consentStatus,
        consentMethod: consent.consentMethod,
        consentTimestamp: consent.consentTimestamp,
        createdAt: consent.createdAt,
        isValid: consent.consentStatus === 'approved' && consent.consentTimestamp
      }
    });

  } catch (error) {
    next(error);
  }
  };

  // ============================================================================
  // DPDP ACT 2023 CONSENT MANAGEMENT
  // ============================================================================

  const ConsentRecord = require('../models/ConsentRecord');

  /**
   * @desc    Give consent for one or more consent types (DPDP Act 2023)
   * @route   POST /api/v1/consent/give
   * @access  Private
   */
  exports.giveConsent = async (req, res) => {
    try {
      const { consentTypes } = req.body;
      const userId = req.user._id;
    
      // Validation
      if (!consentTypes || !Array.isArray(consentTypes) || consentTypes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'consentTypes array is required'
        });
      }
    
      const validTypes = ['platform_usage', 'data_collection', 'marketing', 'third_party_sharing', 'ai_processing'];
      const invalidTypes = consentTypes.filter(type => !validTypes.includes(type));
    
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid consent types: ${invalidTypes.join(', ')}`
        });
      }
    
      // Get IP and user agent for DPDP compliance
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
    
      // Check if user is under 18 (student) for parent consent flag
      const isStudent = req.user.role === 'student';
      const parentConsent = isStudent && req.user.parentConsentGiven;
    
      const createdConsents = [];
      const errors = [];
    
      // Create consent record for each type
      for (const consentType of consentTypes) {
        try {
          // Check if active consent already exists
          const existing = await ConsentRecord.findOne({
            userId,
            consentType,
            isActive: true,
            withdrawnAt: null
          });
        
          if (existing) {
            createdConsents.push(existing);
            continue;
          }
        
          // Create new consent record
          const consent = await ConsentRecord.create({
            userId,
            consentType,
            givenAt: new Date(),
            ipAddress,
            userAgent,
            consentVersion: 'v1.0',
            isActive: true,
            parentConsent
          });
        
          createdConsents.push(consent);
        
          // Log to audit
          await logAuditEvent({
            actorId: userId,
            actorRole: req.user.role,
            action: 'CONSENT_GIVEN',
            targetType: 'CONSENT',
            targetId: consent._id.toString(),
            metadata: { consentType, consentVersion: 'v1.0', parentConsent },
            req,
            status: 'success'
          }).catch(err => console.error('Audit log error:', err));
        
        } catch (error) {
          errors.push({
            consentType,
            error: error.message
          });
        }
      }
    
      // Check if all required consents are given
      const requiredTypes = ['platform_usage', 'data_collection'];
      const userConsents = await ConsentRecord.findActiveConsents(userId);
      const givenTypes = userConsents.map(c => c.consentType);
      const hasAllRequired = requiredTypes.every(type => givenTypes.includes(type));
    
      res.status(201).json({
        success: true,
        message: `Consent given for ${createdConsents.length} type(s)`,
        consents: createdConsents,
        allRequired: hasAllRequired,
        errors: errors.length > 0 ? errors : undefined
      });
    
    } catch (error) {
      console.error('[ConsentController] giveConsent error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording consent',
        error: error.message
      });
    }
  };

  /**
   * @desc    Get DPDP consent status for logged-in user
   * @route   GET /api/v1/consent/dpdp-status
   * @access  Private
   */
  exports.getDPDPConsentStatus = async (req, res) => {
    try {
      const userId = req.user._id;
    
      // Get all active consents
      const activeConsents = await ConsentRecord.findActiveConsents(userId);
    
      // Get consent summary
      const summary = await ConsentRecord.getConsentSummary(userId);
    
      // Define required consents
      const requiredTypes = ['platform_usage', 'data_collection'];
      const givenTypes = activeConsents.map(c => c.consentType);
      const missingConsents = requiredTypes.filter(type => !givenTypes.includes(type));
    
      const hasAllRequired = missingConsents.length === 0;
    
      // Format response
      const consentStatus = {
        platform_usage: givenTypes.includes('platform_usage'),
        data_collection: givenTypes.includes('data_collection'),
        marketing: givenTypes.includes('marketing'),
        third_party_sharing: givenTypes.includes('third_party_sharing'),
        ai_processing: givenTypes.includes('ai_processing')
      };
    
      res.status(200).json({
        success: true,
        userId,
        activeConsents: activeConsents.length,
        hasAllRequired,
        missingConsents,
        consentStatus,
        summary,
        consents: activeConsents.map(c => ({
          consentType: c.consentType,
          givenAt: c.givenAt,
          consentVersion: c.consentVersion,
          daysSinceGiven: c.daysSinceGiven,
          parentConsent: c.parentConsent
        }))
      });
    
    } catch (error) {
      console.error('[ConsentController] getDPDPConsentStatus error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving consent status',
        error: error.message
      });
    }
  };

  /**
   * @desc    Withdraw consent for a specific type (DPDP Act 2023)
   * @route   POST /api/v1/consent/withdraw
   * @access  Private
   */
  exports.withdrawConsent = async (req, res) => {
    try {
      const { consentType, reason } = req.body;
      const userId = req.user._id;
    
      // Validation
      if (!consentType) {
        return res.status(400).json({
          success: false,
          message: 'consentType is required'
        });
      }
    
      const validTypes = ['platform_usage', 'data_collection', 'marketing', 'third_party_sharing', 'ai_processing'];
      if (!validTypes.includes(consentType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid consent type: ${consentType}`
        });
      }
    
      // Cannot withdraw platform_usage consent
      if (consentType === 'platform_usage') {
        return res.status(400).json({
          success: false,
          message: 'Platform usage consent cannot be withdrawn. To stop using the platform, please delete your account via Settings > Privacy > Delete Account.'
        });
      }
    
      // Find active consent of this type
      const consent = await ConsentRecord.findOne({
        userId,
        consentType,
        isActive: true,
        withdrawnAt: null
      });
    
      if (!consent) {
        return res.status(404).json({
          success: false,
          message: `No active consent found for type: ${consentType}`
        });
      }
    
      // Withdraw the consent
      await consent.withdraw(reason, userId);
    
      // Log to audit
      await logAuditEvent({
        actorId: userId,
        actorRole: req.user.role,
        action: 'CONSENT_WITHDRAWN',
        targetType: 'CONSENT',
        targetId: consent._id.toString(),
        metadata: { consentType, reason: reason || 'No reason provided', withdrawnAt: new Date() },
        req,
        status: 'success'
      }).catch(err => console.error('Audit log error:', err));
    
      res.status(200).json({
        success: true,
        withdrawn: true,
        consentType,
        message: `Consent for ${consentType} has been withdrawn successfully`,
        withdrawnAt: consent.withdrawnAt
      });
    
    } catch (error) {
      console.error('[ConsentController] withdrawConsent error:', error);
    
      // Handle the pre-save hook error for platform_usage
      if (error.message.includes('Platform usage consent cannot be withdrawn')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    
      res.status(500).json({
        success: false,
        message: 'Error withdrawing consent',
        error: error.message
      });
    }
  };

// @desc    Revoke parental consent (admin only)
// @route   POST /api/consent/revoke/:studentId
// @access  Private/Admin
exports.revokeConsent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    const consent = await ParentalConsent.findOne({ studentId });

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'No consent record found for this student'
      });
    }

    if (consent.consentStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke consent that is not approved'
      });
    }

    consent.consentStatus = 'rejected';
    await consent.save();

    // Log audit event
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CONSENT_REVOKED',
      targetType: 'CONSENT',
      targetId: consent._id.toString(),
      metadata: {
        studentId,
        reason: reason || 'no_reason_provided',
        revokedBy: req.user.id
      },
      req,
      status: 'success',
      complianceFlags: ['PDP_BILL_2023', 'RTE_ACT_2009']
    }).catch(err => console.error('Audit log error:', err));

    res.status(200).json({
      success: true,
      message: 'Parental consent revoked successfully',
      data: {
        consentId: consent._id,
        studentId: consent.studentId,
        consentStatus: consent.consentStatus
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all consent records (admin only)
// @route   GET /api/consent/all
// @access  Private/Admin
exports.getAllConsents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status) {
      filter.consentStatus = status;
    }

    const consents = await ParentalConsent.find(filter)
      .populate('studentId', 'name email profile.grade profile.school')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ParentalConsent.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: consents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: consents
    });

  } catch (error) {
    next(error);
  }
};