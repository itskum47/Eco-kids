const crypto = require('crypto');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const ConsentRecord = require('../models/ConsentRecord');
const DataProcessingNotice = require('../models/DataProcessingNotice');
const DeletionDeadLetter = require('../models/DeletionDeadLetter');
const RewardLedger = require('../models/RewardLedger');
const ActivitySubmission = require('../models/ActivitySubmission');
const ParentalConsent = require('../models/ParentalConsent');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all data processing notices
// @route   GET /api/compliance/notices
// @access  Public
exports.getDataProcessingNotices = async (req, res, next) => {
    try {
        const notices = await DataProcessingNotice.getActiveNotices();

        res.status(200).json({
            success: true,
            count: notices.length,
            data: notices
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept data processing notices (record consent)
// @route   POST /api/compliance/consent
// @access  Private
exports.recordConsent = async (req, res, next) => {
    try {
        const { purposes } = req.body;

        if (!purposes || !Array.isArray(purposes) || purposes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please specify processing purposes to consent to'
            });
        }

        const validPurposes = [
            'core_platform', 'gamification', 'analytics',
            'notifications', 'environmental_impact', 'content_personalization'
        ];
        const invalidPurposes = purposes.filter(p => !validPurposes.includes(p));
        if (invalidPurposes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid purposes: ${invalidPurposes.join(', ')}`
            });
        }

        // Get active notices for the requested purposes
        const notices = await DataProcessingNotice.find({
            purpose: { $in: purposes },
            isActive: true
        });

        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || '';

        const records = notices.map(notice => ({
            userId: req.user._id,
            noticeId: notice._id,
            purpose: notice.purpose,
            legalBasis: notice.legalBasis,
            status: 'granted',
            givenAt: new Date(),
            ipAddress,
            userAgent,
            method: 'explicit_click',
            noticeVersion: notice.version
        }));

        // Upsert: revoke old, insert new
        for (const record of records) {
            await ConsentRecord.updateMany(
                { userId: req.user._id, purpose: record.purpose, status: 'granted' },
                { $set: { status: 'revoked', revokedAt: new Date() } }
            );
        }

        const inserted = await ConsentRecord.insertMany(records);

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'CONSENT_RECORDED',
            targetType: 'CONSENT_RECORD',
            targetId: req.user._id.toString(),
            metadata: { purposes, noticeCount: notices.length },
            req,
            status: 'success',
            complianceFlags: ['DPDP_ACT_2023']
        }).catch(() => { });

        res.status(201).json({
            success: true,
            message: 'Consent recorded successfully',
            data: {
                consentsRecorded: inserted.length,
                purposes
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Revoke consent for specific purposes
// @route   POST /api/compliance/consent/revoke
// @access  Private
exports.revokeConsent = async (req, res, next) => {
    try {
        const { purposes } = req.body;

        if (!purposes || !Array.isArray(purposes) || purposes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please specify purposes to revoke'
            });
        }

        // Prevent revoking mandatory consents
        const mandatoryPurposes = ['core_platform'];
        const blockingPurposes = purposes.filter(p => mandatoryPurposes.includes(p));
        if (blockingPurposes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot revoke mandatory consents: ${blockingPurposes.join(', ')}. To fully withdraw, delete your account.`
            });
        }

        const result = await ConsentRecord.updateMany(
            { userId: req.user._id, purpose: { $in: purposes }, status: 'granted' },
            { $set: { status: 'revoked', revokedAt: new Date() } }
        );

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'CONSENT_REVOKED',
            targetType: 'CONSENT_RECORD',
            targetId: req.user._id.toString(),
            metadata: { purposes, revokedCount: result.modifiedCount },
            req,
            status: 'success',
            complianceFlags: ['DPDP_ACT_2023']
        }).catch(() => { });

        res.status(200).json({
            success: true,
            message: 'Consent revoked',
            data: { revokedCount: result.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's consent status
// @route   GET /api/compliance/consent/status
// @access  Private
exports.getConsentStatus = async (req, res, next) => {
    try {
        const consents = await ConsentRecord.getActiveConsents(req.user._id);

        const allPurposes = [
            'core_platform', 'gamification', 'analytics',
            'notifications', 'environmental_impact', 'content_personalization'
        ];

        const consentedPurposes = consents.map(c => c.purpose);
        const statusMap = allPurposes.map(purpose => ({
            purpose,
            consented: consentedPurposes.includes(purpose),
            mandatory: ['core_platform', 'gamification', 'environmental_impact'].includes(purpose)
        }));

        res.status(200).json({
            success: true,
            data: {
                consents: statusMap,
                totalActive: consents.length,
                details: consents
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get data localization compliance status
// @route   GET /api/v1/compliance/data-localization-status
// @access  Private/Admin
exports.getDataLocalizationStatus = async (req, res, next) => {
    try {
        const expectedRegion = process.env.DATA_RESIDENCY_REGION || 'ap-south-1';
        const actualRegion = process.env.AWS_REGION || process.env.STORAGE_REGION || expectedRegion;
        const enforceIndiaOnly = process.env.ENFORCE_INDIA_DATA_RESIDENCY === 'true';

        return res.status(200).json({
            success: true,
            data: {
                compliant: actualRegion === expectedRegion,
                country: 'India',
                expectedRegion,
                actualRegion,
                enforceIndiaOnly,
                storageProviders: {
                    primaryDatabase: 'MongoDB',
                    objectStorage: 'AWS S3',
                    cache: 'Redis'
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export all user data (DPDP right to portability)
// @route   GET /api/compliance/data-export
// @access  Private
exports.exportUserData = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Gather all user data in parallel
        const [user, submissions, rewards, consents, parentalConsent] = await Promise.all([
            User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire').lean(),
            ActivitySubmission.find({ user: userId }).sort({ createdAt: -1 }).lean(),
            RewardLedger.find({ userId }).sort({ createdAt: -1 }).lean(),
            ConsentRecord.find({ userId }).populate('noticeId', 'title purpose version').lean(),
            ParentalConsent.findOne({ studentId: userId }).lean()
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const exportData = {
            exportedAt: new Date().toISOString(),
            exportVersion: '1.0',
            legalBasis: 'DPDP Act 2023 Section 11 — Right to Data Portability',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                gamification: user.gamification,
                environmentalImpact: user.environmentalImpact,
                createdAt: user.createdAt
            },
            activitySubmissions: submissions.map(s => ({
                id: s._id,
                activityType: s.activityType,
                description: s.description,
                status: s.status,
                evidence: s.evidence,
                createdAt: s.createdAt
            })),
            rewardHistory: rewards.map(r => ({
                id: r._id,
                type: r.type,
                amount: r.amount,
                reason: r.reason,
                createdAt: r.createdAt
            })),
            consentRecords: consents.map(c => ({
                purpose: c.purpose,
                status: c.status,
                givenAt: c.givenAt,
                revokedAt: c.revokedAt,
                noticeVersion: c.noticeVersion
            })),
            parentalConsent: parentalConsent ? {
                status: parentalConsent.consentStatus,
                method: parentalConsent.consentMethod,
                consentTimestamp: parentalConsent.consentTimestamp
            } : null
        };

        await logAuditEvent({
            actorId: userId.toString(),
            actorRole: req.user.role,
            action: 'DATA_EXPORT_REQUESTED',
            targetType: 'USER',
            targetId: userId.toString(),
            metadata: {
                submissionCount: submissions.length,
                rewardCount: rewards.length
            },
            req,
            status: 'success',
            complianceFlags: ['DPDP_ACT_2023', 'RIGHT_TO_PORTABILITY']
        }).catch(() => { });

        res.setHeader('Content-Disposition', `attachment; filename=ecokids-data-export-${userId}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(exportData);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user account and anonymize PII (DPDP right to erasure)
// @route   DELETE /api/compliance/account
// @access  Private
exports.deleteAccountDPDP = async (req, res, next) => {
    try {
        const { password, reason } = req.body;
        const userId = req.user._id;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password confirmation required for account deletion'
            });
        }

        // Verify password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Step 1: Anonymize PII but keep aggregate data
        const anonymizedName = `Deleted User ${crypto.randomBytes(4).toString('hex')}`;
        const anonymizedEmail = `deleted_${crypto.randomBytes(8).toString('hex')}@removed.ecokids.in`;

        const aggregateStats = {
            totalEcoPoints: user.gamification?.ecoPointsTotal || 0,
            totalActivities: user.environmentalImpact?.activitiesCompleted || 0,
            treesPlanted: user.environmentalImpact?.treesPlanted || 0,
            co2Prevented: user.environmentalImpact?.co2Prevented || 0,
            waterSaved: user.environmentalImpact?.waterSaved || 0
        };

        // Step 2: Anonymize user record
        user.name = anonymizedName;
        user.email = anonymizedEmail;
        user.password = crypto.randomBytes(32).toString('hex'); // Unrecoverable password
        user.isActive = false;
        user.deletedAt = new Date();
        user.profile = {
            dateOfBirth: null,
            grade: null,
            school: user.profile?.school, // Keep school for aggregate reporting
            district: user.profile?.district,
            state: user.profile?.state,
            city: null,
            bio: null
        };
        await user.save({ validateBeforeSave: false });

        // Step 3: Revoke all consents
        await ConsentRecord.revokeAllForUser(userId);

        // Step 4: Revoke all sessions
        await UserSession.revokeAllForUser(userId);

        // Step 5: Remove parental consent PII
        await ParentalConsent.updateOne(
            { studentId: userId },
            {
                $set: {
                    parentName: 'DELETED',
                    parentPhone: '0000000000',
                    consentStatus: 'rejected',
                    metadata: { deletedAt: new Date() }
                }
            }
        );

        // Step 6: Record in DeletionDeadLetter for audit trail
        await DeletionDeadLetter.create({
            storageKey: `user:${userId}`,
            failedAt: new Date(),
            retryCount: 0,
            lastError: JSON.stringify({
                aggregateStats,
                reason: reason || 'user_requested',
                deletedAt: new Date().toISOString(),
                school: user.profile?.school,
                district: user.profile?.district,
                state: user.profile?.state
            })
        });

        // Step 7: Audit log
        await logAuditEvent({
            actorId: userId.toString(),
            actorRole: user.role,
            action: 'ACCOUNT_DELETED_DPDP',
            targetType: 'USER',
            targetId: userId.toString(),
            metadata: {
                reason: reason || 'user_requested',
                aggregateStatsPreserved: true,
                piiAnonymized: true
            },
            req,
            status: 'success',
            complianceFlags: ['DPDP_ACT_2023', 'RIGHT_TO_ERASURE']
        }).catch(() => { });

        // Clear auth cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Account deleted and data anonymized per DPDP Act 2023',
            data: {
                anonymized: true,
                aggregateStatsPreserved: true,
                sessionsRevoked: true,
                consentsRevoked: true
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout from all devices
// @route   POST /api/compliance/logout-all
// @access  Private
exports.logoutAllSessions = async (req, res, next) => {
    try {
        const result = await UserSession.revokeAllForUser(req.user._id);

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'LOGOUT_ALL_SESSIONS',
            targetType: 'USER_SESSION',
            targetId: req.user._id.toString(),
            metadata: { sessionsRevoked: result.modifiedCount },
            req,
            status: 'success'
        }).catch(() => { });

        // Clear current cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'All sessions revoked',
            data: { sessionsRevoked: result.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get active sessions
// @route   GET /api/compliance/sessions
// @access  Private
exports.getActiveSessions = async (req, res, next) => {
    try {
        const sessions = await UserSession.find({
            userId: req.user._id,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        }).select('device browser ipAddress lastActiveAt createdAt').lean();

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        next(error);
    }
};
