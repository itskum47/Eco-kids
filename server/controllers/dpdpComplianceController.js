const ParentalConsent = require('../models/ParentalConsent');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/async');

/**
 * Service for managing DPDP 2023 compliance through consent versioning
 * Tracks policy version changes and requires reconsentwhith updated policies
 */

const CURRENT_POLICY_VERSION = '1.1';
const CURRENT_CONSENT_VERSION = 1;

/**
 * Get current policy version and check if reconsentis required
 * GET /api/v1/compliance/policy-version
 */
exports.getPolicyVersion = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user.id;

  let consent = await ParentalConsent.findOne({ studentId })
    .select('policyVersion consentVersion requiresReconsent policyAcceptanceTimestamp');

  if (!consent) {
    return res.status(200).json({
      success: true,
      data: {
        currentVersion: CURRENT_POLICY_VERSION,
        userVersion: null,
        requiresReconsent: true,
        reason: 'No consent record found'
      }
    });
  }

  const requiresReconsent = consent.policyVersion !== CURRENT_POLICY_VERSION;

  res.status(200).json({
    success: true,
    data: {
      currentVersion: CURRENT_POLICY_VERSION,
      userVersion: consent.policyVersion,
      requiresReconsent,
      reason: requiresReconsent ? `Policy updated from v${consent.policyVersion} to v${CURRENT_POLICY_VERSION}` : null,
      lastAcceptedAt: consent.policyAcceptanceTimestamp,
      changesSummary: requiresReconsent ? getChangesSummary(consent.policyVersion) : []
    }
  });
});

/**
 * Accept updated privacy policy (for reconsentflow)
 * POST /api/v1/compliance/accept-policy
 * Body: { studentId?, accept: boolean }
 */
exports.acceptUpdatedPolicy = asyncHandler(async (req, res) => {
  const { accept, studentId } = req.body;
  const targetStudentId = studentId || req.user.id;

  if (!accept) {
    return res.status(400).json({
      success: false,
      message: 'Cannot proceed without accepting updated privacy policy'
    });
  }

  const consent = await ParentalConsent.findOne({ studentId: targetStudentId });

  if (!consent) {
    return res.status(404).json({
      success: false,
      message: 'No consent record found. Please complete initial consent first.'
    });
  }

  const oldVersion = consent.policyVersion;

  // Record in consent history
  consent.consentHistory = consent.consentHistory || [];
  consent.consentHistory.push({
    version: CURRENT_CONSENT_VERSION,
    policyVersion: oldVersion,
    status: consent.consentStatus,
    timestamp: new Date(),
    method: 'policy-update-acceptance',
    ipAddress: req.ip
  });

  // Update to new version
  consent.policyVersion = CURRENT_POLICY_VERSION;
  consent.consentVersion = CURRENT_CONSENT_VERSION;
  consent.policyAcceptanceTimestamp = new Date();
  consent.requiresReconsent = false;

  await consent.save();

  // Log compliance event
  await AuditLog.create({
    action: 'POLICY_ACCEPTANCE',
    actor: req.user.id,
    target: targetStudentId,
    metadata: {
      oldVersion,
      newVersion: CURRENT_POLICY_VERSION,
      complianceStandard: 'DPDP_2023'
    },
    ip: req.ip
  }).catch(() => {});

  res.status(200).json({
    success: true,
    message: `Privacy policy v${CURRENT_POLICY_VERSION} accepted`,
    data: {
      policyVersion: CURRENT_POLICY_VERSION,
      acceptedAt: consent.policyAcceptanceTimestamp,
      consentValid: true
    }
  });
});

/**
 * Get students requiring policy update consent
 * GET /api/v1/compliance/students-needing-reconsent?schoolId=XXX
 * Auth: SCHOOL_ADMIN, TEACHER
 */
exports.getStudentsNeedingReconsent = asyncHandler(async (req, res) => {
  const { schoolId } = req.query;
  const userSchoolId = req.user.profile?.school;

  // Verify school access
  if (schoolId && schoolId !== userSchoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this school data'
    });
  }

  const consents = await ParentalConsent.find({
    requiresReconsent: true
  })
    .populate('studentId', 'name email roll grade section profile.school')
    .select('studentId policyVersion requiresReconsent policyAcceptanceTimestamp')
    .lean();

  // Filter by school if needed
  const filtered = schoolId
    ? consents.filter(c => c.studentId?.profile?.school?.toString() === schoolId)
    : consents;

  const summary = {
    total: filtered.length,
    byGrade: {}
  };

  filtered.forEach(c => {
    const grade = c.studentId?.grade || 'unknown';
    summary.byGrade[grade] = (summary.byGrade[grade] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      summary,
      students: filtered.map(c => ({
        studentId: c.studentId._id,
        name: c.studentId.name,
        grade: c.studentId.grade,
        email: c.studentId.email,
        currentVersion: c.policyVersion,
        targetVersion: CURRENT_POLICY_VERSION
      }))
    }
  });
});

/**
 * Get policy change details (for displaying in banner/modal)
 * GET /api/v1/compliance/policy-changes
 */
exports.getPolicyChanges = asyncHandler(async (req, res) => {
  const changes = getDetailedChanges();

  res.status(200).json({
    success: true,
    data: {
      currentVersion: CURRENT_POLICY_VERSION,
      previousVersion: '1.0',
      changes,
      effectiveDate: '2024-06-01',
      description: 'Updated privacy practices to comply with DPDP Act 2023'
    }
  });
});

// Helper: Get summary of changes between versions
function getChangesSummary(oldVersion) {
  if (oldVersion === '1.0') {
    return [
      'Enhanced data protection measures per DPDP Act 2023',
      'Clarified data retention and deletion policies',
      'Added parental data access rights',
      'Included consent withdrawal mechanism'
    ];
  }
  return [];
}

// Helper: Get detailed changes
function getDetailedChanges() {
  return {
    'Data Protection': {
      old: 'Basic privacy protection',
      new: 'Enhanced DPDP 2023 compliant protection',
      impact: 'Stronger safeguards for student data'
    },
    'Consent Withdrawal': {
      old: 'No mechanism provided',
      new: 'Parents can withdraw consent at any time',
      impact: 'Parents have full control over data usage'
    },
    'Data Access': {
      old: 'Limited parental access',
      new: 'Parents can request all personal data held',
      impact: 'Full transparency into data collection'
    },
    'Data Retention': {
      old: 'Indefinite retention',
      new: 'Data deleted 1 year after student leaves school',
      impact: 'Automatic data cleanup'
    },
    'Sensitive Data': {
      old: 'No special handling',
      new: 'Biometric data encrypted, minimal collection',
      impact: 'Enhanced protection for sensitive information'
    }
  };
}

/**
 * Export compliance audit log
 * GET /api/v1/compliance/audit-log?schoolId=XXX
 */
exports.getComplianceAuditLog = asyncHandler(async (req, res) => {
  const { schoolId } = req.query;

  const auditLogs = await AuditLog.find({
    action: { $in: ['POLICY_ACCEPTANCE', 'PARENTAL_CONSENT_GIVEN', 'CONSENT_WITHDRAWAL'] },
    ...(schoolId && { 'metadata.schoolId': schoolId })
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      totalEvents: auditLogs.length,
      logs: auditLogs.map(log => ({
        action: log.action,
        actor: log.actor,
        target: log.target,
        timestamp: log.createdAt,
        ipAddress: log.ip,
        complianceMetadataata: log.metadata
      }))
    }
  });
});

module.exports = {
  getPolicyVersion: exports.getPolicyVersion,
  acceptUpdatedPolicy: exports.acceptUpdatedPolicy,
  getStudentsNeedingReconsent: exports.getStudentsNeedingReconsent,
  getPolicyChanges: exports.getPolicyChanges,
  getComplianceAuditLog: exports.getComplianceAuditLog,
  CURRENT_POLICY_VERSION,
  CURRENT_CONSENT_VERSION
};
