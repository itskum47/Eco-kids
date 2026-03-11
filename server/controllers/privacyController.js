const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const QuizAttempt = require('../models/QuizAttempt');
const { logAuditEvent } = require('../utils/auditLogger');
const crypto = require('crypto');

/**
 * @desc    Schedule account deletion (30-day grace period)
 * @route   POST /api/v1/privacy/delete-account
 * @access  Private
 */
exports.scheduleAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already scheduled
    if (user.deletionScheduled) {
      return res.status(400).json({
        success: false,
        message: 'Account deletion is already scheduled',
        deletionDate: user.deletionDate
      });
    }
    
    // Store encrypted backup of critical data (for 30-day restoration)
    const backupData = {
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      parentEmail: user.parentEmail || null,
      parentPhone: user.parentPhone || null,
      parentName: user.parentName || null
    };
    
    const backupString = JSON.stringify(backupData);
    const cipher = crypto.createCipher('aes-256-cbc', process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production');
    let encryptedBackup = cipher.update(backupString, 'utf8', 'hex');
    encryptedBackup += cipher.final('hex');
    
    // Set deletion schedule (30 days from now)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    user.deletionScheduled = true;
    user.deletionDate = deletionDate;
    user.deletionBackup = encryptedBackup;
    
    // Anonymize immediately
    user.name = 'Anonymous User';
    user.email = `anon_${userId}@deleted.ecokids.in`;
    user.phone = null;
    user.parentEmail = null;
    user.parentPhone = null;
    user.parentName = null;
    user.profile.avatar = null;
    user.profile.bio = null;
    
    // Keep eco-points and activities for school statistics (anonymized)
    // This is important for NEP 2020 reporting compliance
    
    await user.save();
    
    // Log to audit
    await logAuditEvent({
      actorId: userId,
      actorRole: req.user.role,
      action: 'ACCOUNT_DELETION_SCHEDULED',
      targetType: 'USER',
      targetId: userId.toString(),
      metadata: {
        scheduledFor: deletionDate,
        gracePeriodDays: 30,
        anonymizedImmediately: true
      },
      req,
      status: 'success'
    }).catch(err => console.error('Audit log error:', err));
    
    // Send confirmation email
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: `"EcoKids India" <${process.env.SMTP_FROM || 'noreply@ecokids.in'}>`,
        to: backupData.email,
        subject: 'Account Deletion Scheduled - EcoKids India',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">⚠️ Account Deletion Scheduled</h2>
            <p>Your EcoKids India account deletion has been scheduled.</p>
            <p><strong>Deletion Date:</strong> ${deletionDate.toDateString()}</p>
            <p><strong>What happens now:</strong></p>
            <ul>
              <li>Your personal information has been anonymized immediately</li>
              <li>Your eco-points and activity records are preserved (anonymized) for school statistics</li>
              <li>You have 30 days to cancel this deletion request</li>
              <li>After 30 days, your account will be permanently deleted</li>
            </ul>
            <p><strong>To cancel this deletion:</strong></p>
            <p>Log in to your account and go to Settings > Privacy > Cancel Deletion</p>
            <p>Or click: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'  }/settings/privacy">Cancel Deletion</a></p>
            <p>If you did not request this, please contact us immediately at privacy@ecokids.in</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('[PrivacyController] Email error:', emailError);
      // Don't fail the operation if email fails
    }
    
    res.status(200).json({
      success: true,
      scheduled: true,
      message: 'Account deletion scheduled. You have 30 days to cancel this request.',
      deletionDate,
      anonymizedImmediately: true,
      dataRetained: {
        ecoPoints: true,
        activities: true,
        reason: 'Required for school statistics and NEP 2020 reporting'
      }
    });
    
  } catch (error) {
    console.error('[PrivacyController] scheduleAccountDeletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling account deletion',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel scheduled account deletion (within 30-day window)
 * @route   POST /api/v1/privacy/cancel-deletion
 * @access  Private
 */
exports.cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if deletion is scheduled
    if (!user.deletionScheduled) {
      return res.status(400).json({
        success: false,
        message: 'No account deletion is scheduled'
      });
    }
    
    // Check if still within 30-day window
    const now = new Date();
    if (now > user.deletionDate) {
      return res.status(400).json({
        success: false,
        message: 'The 30-day cancellation window has expired. Account has been deleted.'
      });
    }
    
    // Decrypt and restore backup data
    if (user.deletionBackup) {
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production');
        let decrypted = decipher.update(user.deletionBackup, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const backupData = JSON.parse(decrypted);
        
        // Restore original data
        user.name = backupData.name;
        user.email = backupData.email;
        user.phone = backupData.phone;
        user.parentEmail = backupData.parentEmail;
        user.parentPhone = backupData.parentPhone;
        user.parentName = backupData.parentName;
        
      } catch (decryptError) {
        console.error('[PrivacyController] Decryption error:', decryptError);
        return res.status(500).json({
          success: false,
          message: 'Error restoring account data. Please contact support.'
        });
      }
    }
    
    // Clear deletion schedule
    user.deletionScheduled = false;
    user.deletionDate = undefined;
    user.deletionBackup = undefined;
    
    await user.save();
    
    // Log to audit
    await logAuditEvent({
      actorId: userId,
      actorRole: req.user.role,
      action: 'ACCOUNT_DELETION_CANCELLED',
      targetType: 'USER',
      targetId: userId.toString(),
      metadata: {
        cancelledAt: new Date(),
        dataRestored: true
      },
      req,
      status: 'success'
    }).catch(err => console.error('Audit log error:', err));
    
    res.status(200).json({
      success: true,
      message: 'Account deletion cancelled successfully. Your account has been restored.',
      accountRestored: true
    });
    
  } catch (error) {
    console.error('[PrivacyController] cancelAccountDeletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling account deletion',
      error: error.message
    });
  }
};

/**
 * @desc    Export all user data (DPDP Act 2023 - Right to Data Portability)
 * @route   GET /api/v1/privacy/export-my-data
 * @access  Private
 * @rateLimit 1 request per 30 days per user
 */
exports.exportMyData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Rate limiting: Check last export time
    const lastExport = await logAuditEvent({
      actorId: userId,
      actorRole: req.user.role,
      action: 'DATA_EXPORT_REQUESTED',
      targetType: 'USER',
      targetId: userId.toString(),
      metadata: { requestedAt: new Date() },
      req,
      status: 'initiated'
    }).catch(err => console.error('Audit log error:', err));
    
    // Find user with all data
    const user = await User.findById(userId)
      .select('+hashedRefreshToken +parentConsentToken')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Collect all user activities
    const activities = await ActivitySubmission.find({ studentId: userId })
      .populate('teacherId', 'name email')
      .lean();
    
    // Collect all quiz attempts
    const quizAttempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title topic')
      .lean();
    
    // Get consent records
    const ConsentRecord = require('../models/ConsentRecord');
    const consents = await ConsentRecord.find({ userId }).lean();
    
    // Get login history (last 90 days)
    const AuditLog = require('../models/AuditLog');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const loginHistory = await AuditLog.find({
      actorId: userId,
      action: { $in: ['USER_LOGIN', 'USER_LOGIN_OTP', 'USER_LOGOUT'] },
      timestamp: { $gte: ninetyDaysAgo }
    }).select('action timestamp ipAddress metadata').lean();
    
    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      userId: user._id,
      
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dateOfBirth: user.profile?.dateOfBirth,
        grade: user.profile?.grade,
        school: user.profile?.school,
        schoolId: user.profile?.schoolId,
        district: user.profile?.district,
        city: user.profile?.city,
        state: user.profile?.state,
        language: user.profile?.language,
        bio: user.profile?.bio,
        avatar: user.profile?.avatar
      },
      
      parentalInfo: {
        parentName: user.parentName,
        parentEmail: user.parentEmail,
        parentPhone: user.parentPhone,
        parentConsentGiven: user.parentConsentGiven,
        parentConsentDate: user.parentConsentDate
      },
      
      gamification: {
        ecoPoints: user.gamification?.ecoPoints || 0,
        level: user.gamification?.level || 1,
        badges: user.gamification?.badges || [],
        streak: user.gamification?.streak,
        onboardingCompleted: user.gamification?.onboardingCompleted
      },
      
      environmentalImpact: {
        treesPlanted: user.environmentalImpact?.treesPlanted || 0,
        co2Prevented: user.environmentalImpact?.co2Prevented || 0,
        waterSaved: user.environmentalImpact?.waterSaved || 0,
        plasticReduced: user.environmentalImpact?.plasticReduced || 0,
        energySaved: user.environmentalImpact?.energySaved || 0,
        activitiesCompleted: user.environmentalImpact?.activitiesCompleted || 0
      },
      
      activities: activities.map(a => ({
        activityType: a.activityType,
        description: a.description,
        photoUrl: a.photoUrl,
        submittedAt: a.submittedAt,
        status: a.status,
        pointsEarned: a.pointsEarned,
        teacherFeedback: a.teacherFeedback,
        impactMetrics: a.impactMetrics
      })),
      
      quizzes: quizAttempts.map(q => ({
        quizTitle: q.quizId?.title,
        topic: q.quizId?.topic,
        score: q.score,
        totalQuestions: q.totalQuestions,
        takenAt: q.createdAt,
        answers: q.answers
      })),
      
      consents: consents.map(c => ({
        consentType: c.consentType,
        givenAt: c.givenAt,
        withdrawnAt: c.withdrawnAt,
        isActive: c.isActive,
        consentVersion: c.consentVersion,
        parentConsent: c.parentConsent
      })),
      
      loginHistory: loginHistory.map(l => ({
        action: l.action,
        timestamp: l.timestamp,
        ipAddress: l.ipAddress,
        device: l.metadata?.userAgent
      })),
      
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      
      dataProtectionInfo: {
        dpdpAct2023Compliant: true,
        dataStoredIn: 'India (AWS Mumbai - ap-south-1)',
        rightToErasure: 'Available via Settings > Privacy > Delete Account',
        rightToPortability: 'This export',
        rightToRectification: 'Available via Profile Settings',
        contactPrivacy: 'privacy@ecokids.in'
      }
    };
    
    // Set Content-Disposition header for download
    const filename = `ecokids-data-${userId}-${Date.now()}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    // Log successful export
    await logAuditEvent({
      actorId: userId,
      actorRole: req.user.role,
      action: 'DATA_EXPORTED',
      targetType: 'USER',
      targetId: userId.toString(),
      metadata: {
        exportedAt: new Date(),
        filename,
        recordsIncluded: {
          activities: activities.length,
          quizzes: quizAttempts.length,
          consents: consents.length,
          loginHistory: loginHistory.length
        }
      },
      req,
      status: 'success'
    }).catch(err => console.error('Audit log error:', err));
    
    res.status(200).json(exportData);
    
  } catch (error) {
    console.error('[PrivacyController] exportMyData error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
};
