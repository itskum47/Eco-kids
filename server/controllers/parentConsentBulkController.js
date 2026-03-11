const User = require('../models/User');
const ConsentRecord = require('../models/ConsentRecord');
const ParentalConsent = require('../models/ParentalConsent');
const { logAuditEvent } = require('../utils/auditLogger');
const logger = require('../utils/logger');
const parentalConsentService = require('../services/parentalConsentService');

/**
 * Parent Consent Bulk Controller
 * Handles bulk parent consent collection for schools
 * 
 * Critical for Phase 6: Schools need to collect consent from 500+ parents
 */

/**
 * Bulk send parent consent requests
 * POST /api/v1/consent/bulk-send-parent
 * Auth: SCHOOL_ADMIN only
 */
exports.bulkSendParentConsent = async (req, res) => {
  try {
    const { studentIds, grade, section } = req.body;
    const schoolId = req.user.profile?.schoolId;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School not found for user'
      });
    }

    let targetStudents = [];

    // Get students either by explicit IDs or by grade/section
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      targetStudents = await User.find({
        _id: { $in: studentIds },
        role: 'student',
        'profile.schoolId': schoolId,
        isActive: true
      });
    } else if (grade && section) {
      targetStudents = await User.find({
        'profile.grade': grade,
        'profile.section': section,
        'profile.schoolId': schoolId,
        role: 'student',
        isActive: true
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either studentIds or (grade + section) is required'
      });
    }

    if (targetStudents.length === 0) {
      return res.json({
        success: true,
        message: 'No eligible students found',
        data: {
          total: 0,
          emailsSent: 0,
          skipped: 0,
          alreadyConsented: 0
        }
      });
    }

    // Process consent requests
    let emailsSent = 0;
    let skipped = 0;
    let alreadyConsented = 0;
    const failedStudents = [];

    for (const student of targetStudents) {
      try {
        // Check if parent email exists
        if (!student.profile?.parentEmail) {
          skipped++;
          continue;
        }

        // Check if consent already given
        const existingConsent = await ParentalConsent.findOne({
          studentId: student._id,
          consentGiven: true
        });

        if (existingConsent) {
          alreadyConsented++;
          continue;
        }

        // Send consent request
        try {
          await parentalConsentService.sendConsentRequest(student._id, {
            studentName: student.name,
            parentEmail: student.profile?.parentEmail,
            schoolId: schoolId,
            grade: student.profile?.grade
          });
          
          emailsSent++;
        } catch (emailError) {
          logger.error({
            studentId: student._id,
            parentEmail: student.profile?.parentEmail,
            error: emailError.message
          }, 'Failed to send parent consent email');
          
          failedStudents.push({
            studentId: student._id,
            studentName: student.name,
            reason: emailError.message
          });
        }
      } catch (error) {
        logger.error({
          studentId: student._id,
          error: error.message
        }, 'Error processing consent for student');
        
        failedStudents.push({
          studentId: student._id,
          studentName: student.name,
          reason: error.message
        });
      }
    }

    // Log audit event
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'BULK_CONSENT_REQUESTS_SENT',
      targetType: 'PARENT_CONSENT',
      targetId: schoolId.toString(),
      metadata: {
        schoolName: req.user.profile?.schoolName,
        totalStudents: targetStudents.length,
        emailsSent,
        skipped,
        alreadyConsented,
        failedCount: failedStudents.length,
        filterGrade: grade,
        filterSection: section
      },
      req,
      status: 'success',
      complianceFlags: ['DPDP_2023']
    });

    logger.info({
      schoolId,
      total: targetStudents.length,
      emailsSent,
      skipped,
      alreadyConsented
    }, 'Bulk parent consent dispatch completed');

    res.json({
      success: true,
      message: `Consent requests sent to ${emailsSent} parents`,
      data: {
        total: targetStudents.length,
        emailsSent,
        skipped,
        alreadyConsented,
        failedCount: failedStudents.length,
        failedStudents: failedStudents.slice(0, 10) // Return first 10 for display
      }
    });
  } catch (error) {
    logger.error({
      schoolId: req.user.profile?.schoolId,
      error: error.message
    }, 'Bulk consent dispatch failed');

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'BULK_CONSENT_DISPATCH_FAILED',
      targetType: 'PARENT_CONSENT',
      metadata: { error: error.message },
      req,
      status: 'failure'
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk consent requests'
    });
  }
};

/**
 * Get parent consent status for school
 * GET /api/v1/consent/parent-status/:schoolId
 * Auth: SCHOOL_ADMIN, DISTRICT_ADMIN, STATE_ADMIN
 */
exports.getParentConsentStatus = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Authorization check
    if (req.user.role === 'school_admin') {
      if (schoolId !== req.user.profile?.schoolId?.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You can only view consent status for your school'
        });
      }
    } else if (!['district_admin', 'state_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Get all students in school
    const schoolStudents = await User.find({
      'profile.schoolId': schoolId,
      role: 'student',
      isActive: true
    }).select('_id name profile');

    if (schoolStudents.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          consented: 0,
          pending: 0,
          noParentEmail: 0,
          consentRate: '0%',
          byGrade: {}
        }
      });
    }

    const totalStudents = schoolStudents.length;
    let consentedCount = 0;
    let noEmailCount = 0;
    const byGrade = {};

    // Aggregate consent status by grade
    for (const student of schoolStudents) {
      const grade = student.profile?.grade || 'unknown';

      // Initialize grade bucket
      if (!byGrade[grade]) {
        byGrade[grade] = {
          total: 0,
          consented: 0,
          pending: 0,
          noEmail: 0,
          rate: '0%'
        };
      }

      byGrade[grade].total++;

      // Check if parent email exists
      if (!student.profile?.parentEmail) {
        byGrade[grade].noEmail++;
        noEmailCount++;
        continue;
      }

      // Check consent status
      const consentRecord = await ConsentRecord.findOne({
        userId: student._id,
        consentType: 'parental_consent'
      }).sort({ createdAt: -1 });

      if (consentRecord && consentRecord.consentGiven === true) {
        byGrade[grade].consented++;
        consentedCount++;
      } else {
        byGrade[grade].pending++;
      }
    }

    // Calculate rates for each grade
    Object.keys(byGrade).forEach((grade) => {
      const gradeData = byGrade[grade];
      const eligibleStudents = gradeData.total - gradeData.noEmail;
      if (eligibleStudents > 0) {
        gradeData.rate = `${Math.round((gradeData.consented / eligibleStudents) * 100)}%`;
      }
    });

    const pendingCount = totalStudents - consentedCount - noEmailCount;
    const consentRate = totalStudents > 0 
      ? Math.round((consentedCount / totalStudents) * 100)
      : 0;

    // Log audit event
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CONSENT_STATUS_VIEWED',
      targetType: 'SCHOOL',
      targetId: schoolId,
      metadata: {
        totalStudents,
        consentedCount,
        pendingCount
      },
      req,
      status: 'success'
    });

    res.json({
      success: true,
      data: {
        total: totalStudents,
        consented: consentedCount,
        pending: pendingCount,
        noParentEmail: noEmailCount,
        consentRate: `${consentRate}%`,
        byGrade
      }
    });
  } catch (error) {
    logger.error({
      schoolId: req.params.schoolId,
      error: error.message
    }, 'Failed to get consent status');

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch consent status'
    });
  }
};

/**
 * Send reminder to parents who haven't consented
 * POST /api/v1/consent/send-reminder/:schoolId
 * Auth: SCHOOL_ADMIN
 */
exports.sendConsentReminder = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (schoolId !== req.user.profile?.schoolId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only send reminders for your school'
      });
    }

    // Get students who haven't given consent and have parent email
    const pendingConsents = await User.find({
      'profile.schoolId': schoolId,
      'profile.parentEmail': { $exists: true, $ne: null },
      role: 'student',
      isActive: true
    });

    let remindersSent = 0;
    const failedStudents = [];

    for (const student of pendingConsents) {
      try {
        const consentRecord = await ConsentRecord.findOne({
          userId: student._id,
          consentType: 'parental_consent',
          consentGiven: true
        });

        if (!consentRecord) {
          // Send reminder
          try {
            await parentalConsentService.sendConsentReminder(student._id, {
              studentName: student.name,
              parentEmail: student.profile?.parentEmail
            });
            remindersSent++;
          } catch (emailError) {
            failedStudents.push({
              studentId: student._id,
              reason: emailError.message
            });
          }
        }
      } catch (error) {
        logger.error({
          studentId: student._id,
          error: error.message
        }, 'Error sending reminder');
        
        failedStudents.push({
          studentId: student._id,
          reason: error.message
        });
      }
    }

    // Log audit event
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CONSENT_REMINDERS_SENT',
      targetType: 'SCHOOL',
      targetId: schoolId,
      metadata: {
        remindersSent,
        failedCount: failedStudents.length
      },
      req,
      status: 'success'
    });

    res.json({
      success: true,
      message: `Reminders sent to ${remindersSent} parents`,
      data: {
        remindersSent,
        failedCount: failedStudents.length
      }
    });
  } catch (error) {
    logger.error({
      schoolId: req.params.schoolId,
      error: error.message
    }, 'Failed to send consent reminders');

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send reminders'
    });
  }
};

/**
 * Export non-consented students list as CSV
 * GET /api/v1/consent/export-non-consented/:schoolId
 * Auth: SCHOOL_ADMIN
 */
exports.exportNonConsentedList = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (schoolId !== req.user.profile?.schoolId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only export lists for your school'
      });
    }

    // Get students without consent
    const nonConsentedStudents = await User.find({
      'profile.schoolId': schoolId,
      'profile.parentEmail': { $exists: true, $ne: null },
      role: 'student',
      isActive: true
    }).select('name profile email');

    // Filter those without consent
    const filtered = [];
    for (const student of nonConsentedStudents) {
      const consent = await ConsentRecord.findOne({
        userId: student._id,
        consentType: 'parental_consent',
        consentGiven: true
      });

      if (!consent) {
        filtered.push({
          'Student Name': student.name,
          'Email': student.email,
          'Grade': student.profile?.grade || 'N/A',
          'Section': student.profile?.section || 'N/A',
          'Parent Email': student.profile?.parentEmail || 'N/A',
          'Roll Number': student.profile?.rollNumber || 'N/A'
        });
      }
    }

    // Convert to CSV
    if (filtered.length === 0) {
      return res.json({
        success: true,
        message: 'All students have provided consent',
        data: []
      });
    }

    const headers = Object.keys(filtered[0]);
    const csv = [
      headers.join(','),
      ...filtered.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="non-consented-${schoolId}-${new Date().toISOString().split('T')[0]}.csv"`
    );

    res.send(csv);

    // Log audit event
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CONSENT_LIST_EXPORTED',
      targetType: 'SCHOOL',
      targetId: schoolId,
      metadata: {
        studentCount: filtered.length
      },
      req,
      status: 'success'
    });
  } catch (error) {
    logger.error({
      schoolId: req.params.schoolId,
      error: error.message
    }, 'Failed to export non-consented list');

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export list'
    });
  }
};
