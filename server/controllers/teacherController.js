const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const Teacher = require('../models/Teacher');
const School = require('../models/School');
const { generateCertificate } = require('../services/certificateService');
const asyncHandler = require('../middleware/async');
const { awardEcoPoints } = require('../utils/ecoPointsManager');
const rewardValues = require('../constants/rewardValues');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../utils/logger');
const ApprovalAuditLog = require('../models/ApprovalAuditLog');
const AuditLog = require('../models/AuditLog');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Find the Teacher document for the currently authenticated user.
 * Teachers sign in via the User model (role = 'teacher'), so we look up the
 * Teacher supplementary record by userId.
 */
const getTeacherRecord = async (userId) => {
  let record = await Teacher.findOne({ userId });
  if (!record) {
    // Lazily create a teacher record on first access so existing teachers
    // (registered before the Teacher model existed) are not blocked.
    const user = await User.findById(userId).select('profile').lean();
    record = await Teacher.create({
      userId,
      schoolId: user?.profile?.schoolId,
      schoolCode: user?.profile?.school,
      classes: [],
      subjects: []
    });
  }
  return record;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/dashboard
 * Returns KPI snapshot for the teacher's school: pending submissions,
 * active students, recent activity counts, and class impact.
 */
exports.getTeacherDashboard = asyncHandler(async (req, res) => {
  const school = req.user.profile?.school;
  const schoolId = req.user.profile?.schoolId;

  if (!school && !schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Teacher account not associated with a school. Contact admin.'
    });
  }

  const matchSchool = schoolId ? { $or: [{ schoolId }, { school }] } : { school };
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [students, pendingCount, appealedSubmissionsCount, recentActivity] = await Promise.all([
    User.find({ role: 'student', ...matchSchool }).select('name class gradeBand gamification lastActive'),
    ActivitySubmission.countDocuments({
      ...matchSchool,
      status: { $in: ['pending', 'pending_review', 'pending_ai', 'ai_processing'] }
    }),
    ActivitySubmission.countDocuments({
      ...matchSchool,
      status: 'appealed'
    }),
    ActivitySubmission.find({
      ...matchSchool,
      status: { $in: ['pending_review', 'pending_ai'] }
    })
      .populate('user', 'name class')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('activityType status createdAt aiValidation user activityPoints evidence')
  ]);

  const activeThisWeek = students.filter(s =>
    s.lastActive && new Date(s.lastActive) >= sevenDaysAgo
  ).length;

  const totalPoints = students.reduce((sum, s) => sum + (s.gamification?.ecoPoints || 0), 0);
  const avgEcoPoints = students.length ? Math.round(totalPoints / students.length) : 0;

  const topStudents = [...students]
    .sort((a, b) => (b.gamification?.ecoPoints || 0) - (a.gamification?.ecoPoints || 0))
    .slice(0, 5)
    .map(s => ({
      name: s.name,
      class: s.class,
      gradeBand: s.gradeBand,
      ecoPoints: s.gamification?.ecoPoints || 0
    }));

  res.json({
    stats: {
      totalStudents: students.length,
      activeThisWeek,
      avgEcoPoints,
      pendingVerifications: pendingCount,
      appealed_submissions_count: appealedSubmissionsCount,
      appealedSubmissionsCount
    },
    topStudents,
    recentActivity
  });
});

// ─── School Rankings (district leaderboard) ──────────────────────────────────
exports.getSchoolRankings = asyncHandler(async (req, res) => {
  const schoolId = req.user.profile?.schoolId || req.user.school;
  if (!schoolId) {
    return res.status(403).json({ message: 'Teacher account not linked to a school' });
  }

  const school = await School.findById(schoolId).select('district');
  if (!school) {
    return res.status(404).json({ message: 'School not found' });
  }

  const rankings = await School.find({ district: school.district })
    .select('name totalEcoPoints district')
    .sort({ totalEcoPoints: -1 })
    .limit(20)
    .lean();

  const myRank = rankings.findIndex(s => s._id.toString() === schoolId.toString()) + 1;

  res.json({
    district: school.district,
    myRank: myRank || rankings.length + 1,
    rankings
  });
});

// ─── Submissions ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/submissions/pending
 * Returns paginated pending submissions scoped to the teacher's school.
 */
exports.getPendingSubmissions = asyncHandler(async (req, res) => {
  const school = req.user.profile?.school;
  const schoolId = req.user.profile?.schoolId;
  if (!school && !schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Teacher account not associated with a school. Contact admin.'
    });
  }
  const matchSchool = schoolId ? { schoolId } : school ? { school } : {};

  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [submissions, total] = await Promise.all([
    ActivitySubmission.find({ ...matchSchool, status: { $in: ['pending_review', 'pending_ai', 'pending', 'ai_processing'] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name profile.grade profile.school profile.avatar'),
    ActivitySubmission.countDocuments({ ...matchSchool, status: { $in: ['pending_review', 'pending_ai', 'pending', 'ai_processing'] } })
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const reviewerStats = await ApprovalAuditLog.aggregate([
    {
      $match: {
        teacher_id: new mongoose.Types.ObjectId(req.user.id),
        action_source: 'teacher',
        timestamp: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: '$teacher_id',
        totalActions: { $sum: 1 },
        approvals: { $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] } },
        rejections: { $sum: { $cond: [{ $eq: ['$action', 'rejected'] }, 1, 0] } }
      }
    }
  ]);

  const baseStats = reviewerStats[0] || { totalActions: 0, approvals: 0, rejections: 0 };
  const approvalRatio = baseStats.totalActions > 0 ? baseStats.approvals / baseStats.totalActions : 0;
  const anomalyScore = Math.min(100, Math.round((approvalRatio * 70) + (Math.min(baseStats.totalActions, 100) * 0.3)));

  const enrichedSubmissions = submissions.map((submission) => {
    const hasFlags = Array.isArray(submission.flags) && submission.flags.length > 0;
    const aiConfidence = Number(submission?.aiValidation?.confidenceScore);
    const lowConfidence = Number.isFinite(aiConfidence) && aiConfidence < 50;

    return {
      ...submission.toObject(),
      requiresDualReview: hasFlags || lowConfidence,
      dualReviewReason: hasFlags
        ? 'fraud_flags_present'
        : lowConfidence
          ? 'low_ai_confidence'
          : null,
    };
  });

  const dualReviewSample = enrichedSubmissions
    .filter((submission) => submission.requiresDualReview)
    .slice(0, 5)
    .map((submission) => ({
      _id: submission._id,
      activityType: submission.activityType,
      studentName: submission.user?.name || 'Student',
      dualReviewReason: submission.dualReviewReason,
      createdAt: submission.createdAt,
    }));

  res.status(200).json({
    success: true,
    count: enrichedSubmissions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    reviewerAnomaly: {
      totalActions: baseStats.totalActions,
      approvals: baseStats.approvals,
      rejections: baseStats.rejections,
      approvalRatio: Math.round(approvalRatio * 100),
      anomalyScore,
      windowDays: 7
    },
    dualReviewSample,
    data: enrichedSubmissions
  });
});

/**
 * PATCH /api/v1/teacher/submissions/:id
 * Approve or reject a single submission.
 */
exports.updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, note } = req.body;
  const teacherSchool = req.user.profile?.school;
  const teacherSchoolId = req.user.profile?.schoolId;

  if (!['approved', 'rejected', 'teacher_approved', 'teacher_rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be "approved" or "rejected"'
    });
  }

  const submission = await ActivitySubmission.findOne({
    _id: id,
    ...(teacherSchool ? { school: teacherSchool } : {}),
    ...(teacherSchoolId ? { schoolId: teacherSchoolId } : {})
  }).populate('user');
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  const alreadyApprovedStatuses = ['ai_approved', 'teacher_approved', 'approved'];
  const alreadyApproved = alreadyApprovedStatuses.includes(submission.status);

  // School boundary check
  if (teacherSchool && submission.school && submission.school !== teacherSchool) {
    return res.status(403).json({
      success: false,
      message: 'Cannot review submissions from outside your school'
    });
  }

  if (status === 'rejected' || status === 'teacher_rejected') {
    const { deleteImage } = require('../services/cloudinaryService');
    if (submission.evidence?.publicId) {
      await deleteImage(submission.evidence.publicId).catch(() => {});
    }
    submission.status = 'teacher_rejected';
    submission.teacherReview = {
      teacherId: req.user._id,
      decision: 'reject',
      note: note || rejectionReason || '',
      reviewedAt: new Date()
    };
    await submission.save();
    ApprovalAuditLog.create({
      teacher_id: req.user.id,
      submission_id: submission._id,
      action: 'rejected',
      action_source: 'teacher',
      ip_address: req.ip,
      session_id: req.headers['x-session-id'] || null
    }).catch(() => {});
    return res.status(200).json({ success: true, message: 'Submission rejected and removed', data: submission });
  }

  // Approve
  submission.status = 'teacher_approved';
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date();
  submission.impactApplied = true;
  submission.teacherReview = {
    teacherId: req.user._id,
    decision: 'approve',
    note: note || '',
    reviewedAt: new Date()
  };
  await submission.save();
  ApprovalAuditLog.create({
    teacher_id: req.user.id,
    submission_id: submission._id,
    action: 'approved',
    action_source: 'teacher',
    ip_address: req.ip,
    session_id: req.headers['x-session-id'] || null
  }).catch(() => {});

  // Award eco points (non-blocking) only if not already awarded by AI
  if (!alreadyApproved) {
    const pointsToAward = submission.activityPoints || rewardValues.ACTIVITY_APPROVED;
    awardEcoPoints(
      submission.user._id,
      pointsToAward,
      'activity-approved',
      {
        sourceType: 'activity',
        sourceModel: 'ActivitySubmission',
        sourceId: submission._id,
        submissionId: submission._id,
        activityType: submission.activityType,
        verification: {
          status: 'teacher_approved',
          reviewerId: req.user.id,
          verifiedAt: new Date().toISOString()
        },
        idempotencyKey: `teacher:approved:${submission._id.toString()}`
      }
    ).catch(() => {});
    if (submission.school || submission.schoolId) {
      await School.findByIdAndUpdate(submission.school || submission.schoolId, { $inc: { totalEcoPoints: pointsToAward } }).catch(() => {});
    }

    const streakUser = await User.findById(submission.user._id);
    if (streakUser) {
      await streakUser.updateStreak();
    }
  }

  res.status(200).json({ success: true, message: 'Submission approved', data: submission });
});

/**
 * POST /api/v1/teacher/activities/batch-approve
 * Bulk-approve an array of submission IDs.
 */
exports.batchApproveActivities = asyncHandler(async (req, res) => {
  const { submissionIds } = req.body;

  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    return res.status(400).json({ success: false, message: 'submissionIds array is required' });
  }

  const teacherSchool = req.user.profile?.school;
  const teacherSchoolId = req.user.profile?.schoolId;
  if (!teacherSchool && !teacherSchoolId) {
    return res.status(403).json({ success: false, message: 'Teacher account not associated with a school. Contact admin.' });
  }
  const filter = {
    _id: { $in: submissionIds },
    status: { $in: ['pending', 'pending_review', 'pending_ai'] },
    ...(teacherSchool ? { school: teacherSchool } : { schoolId: teacherSchoolId })
  };

  const submissions = await ActivitySubmission.find(filter).populate('user');
  let approvedCount = 0;

  for (const submission of submissions) {
    submission.status = 'teacher_approved';
    submission.impactApplied = true;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    submission.teacherReview = {
      teacherId: req.user._id,
      decision: 'approve',
      reviewedAt: new Date()
    };
    await submission.save();
    ApprovalAuditLog.create({
      teacher_id: req.user.id,
      submission_id: submission._id,
      action: 'approved',
      action_source: 'teacher',
      ip_address: req.ip,
      session_id: req.headers['x-session-id'] || null
    }).catch(() => {});

    if (submission.user?._id) {
      const pointsToAward = submission.activityPoints || rewardValues.ACTIVITY_APPROVED;
      await awardEcoPoints(
        submission.user._id,
        pointsToAward,
        'activity-approved',
        {
          sourceType: 'activity',
          sourceModel: 'ActivitySubmission',
          sourceId: submission._id,
          submissionId: submission._id,
          activityType: submission.activityType,
          verification: {
            status: 'teacher_approved',
            reviewerId: req.user.id,
            verifiedAt: new Date().toISOString()
          },
          idempotencyKey: `teacher:batch-approved:${submission._id.toString()}`
        }
      ).catch(() => {});
      if (submission.school || submission.schoolId) {
        await School.findByIdAndUpdate(submission.school || submission.schoolId, { $inc: { totalEcoPoints: pointsToAward } }).catch(() => {});
      }

      const streakUser = await User.findById(submission.user._id);
      if (streakUser) {
        await streakUser.updateStreak();
      }
    }

    approvedCount++;
  }

  res.status(200).json({
    success: true,
    message: `${approvedCount} submission(s) approved`,
    modifiedCount: approvedCount
  });
});

/**
 * POST /api/v1/teacher/realtime/manual-trigger
 * Manual fallback trigger for demo/recovery: emits approval and leaderboard events.
 */
exports.manualRealtimeTrigger = asyncHandler(async (req, res) => {
  const {
    type,
    userId,
    userName,
    points = rewardValues.ACTIVITY_APPROVED,
    leaderboardType = 'global',
    newRank,
    previousRank
  } = req.body || {};

  if (!global.io) {
    return res.status(503).json({ success: false, message: 'Realtime service unavailable' });
  }

  if (!['approval', 'rank-update'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type must be "approval" or "rank-update"' });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const now = new Date();

  if (type === 'approval') {
    const payload = {
      userId,
      points: Number(points) || rewardValues.ACTIVITY_APPROVED,
      totalPoints: null,
      activity: 'manual-approval-trigger',
      notificationId: `manual-approval:${userId}:${now.getTime()}`,
      timestamp: now
    };

    global.io.to(`user-${userId}`).emit('points-earned', payload);
    global.io.emit('points-earned', payload);

    logger.info(`[Teacher] Manual approval trigger emitted by ${req.user.id} for user ${userId}`);

    return res.status(200).json({ success: true, message: 'Manual approval trigger emitted', data: payload });
  }

  const leaderboardPayload = {
    userId,
    userName: userName || 'Student',
    newRank: Number.isFinite(Number(newRank)) ? Number(newRank) : null,
    previousRank: Number.isFinite(Number(previousRank)) ? Number(previousRank) : null,
    ecoPoints: Number(points) || 0,
    timestamp: now
  };

  global.io.to(`leaderboard-${leaderboardType}`).emit('leaderboard-update', leaderboardPayload);
  global.io.emit('leaderboard-update', { ...leaderboardPayload, leaderboardType });

  logger.info(`[Teacher] Manual rank trigger emitted by ${req.user.id} for user ${userId} (${leaderboardType})`);

  const eventTimestamp = now.toISOString();
  const signatureSecret = process.env.RANK_EVENT_SIGNING_SECRET || process.env.JWT_SECRET || 'ecokids-rank-events';
  const signaturePayload = JSON.stringify({
    userId: String(userId),
    leaderboardType,
    previousRank: leaderboardPayload.previousRank,
    newRank: leaderboardPayload.newRank,
    ecoPoints: leaderboardPayload.ecoPoints,
    timestamp: eventTimestamp
  });
  const eventSignature = crypto
    .createHmac('sha256', signatureSecret)
    .update(signaturePayload)
    .digest('hex');

  await AuditLog.create({
    actor: req.user._id,
    actorId: String(req.user.id),
    actorRole: req.user.role,
    action: 'RANK_TRANSITION_EMITTED',
    targetType: 'User',
    targetId: String(userId),
    metadata: {
      leaderboardType,
      previousRank: leaderboardPayload.previousRank,
      newRank: leaderboardPayload.newRank,
      ecoPoints: leaderboardPayload.ecoPoints,
      source: 'manual-realtime-trigger',
      signatureVersion: 'hmac-sha256:v1',
      signaturePayload,
      eventTimestamp,
      eventSignature
    },
    status: 'success',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }).catch(() => {});

  return res.status(200).json({
    success: true,
    message: 'Manual rank update trigger emitted',
    data: { ...leaderboardPayload, leaderboardType }
  });
});

/**
 * GET /api/v1/teacher/realtime/rank-history/:userId
 * Returns replayable rank transition history for a student.
 */
exports.getRankTransitionHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const history = await AuditLog.find({
    action: 'RANK_TRANSITION_EMITTED',
    targetType: 'User',
    targetId: String(userId)
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .select('action targetId metadata createdAt actorId actorRole status')
    .lean();

  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

// ─── Students ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/students
 * Returns all students in the teacher's school with their core stats.
 */
exports.getTeacherStudents = asyncHandler(async (req, res) => {
  const school = req.user.profile?.school;
  const schoolId = req.user.profile?.schoolId;

  const schoolFilter = schoolId
    ? { 'profile.schoolId': schoolId }
    : school
      ? { 'profile.school': school }
      : {};

  const { page = 1, limit = 30, grade, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { role: 'student', ...schoolFilter };
  if (grade) filter['profile.grade'] = grade;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [students, total] = await Promise.all([
    User.find(filter)
      .select('name email profile.grade profile.school profile.avatar gamification environmentalImpact')
      .sort({ 'gamification.ecoPoints': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: students
  });
});

// ─── Class Impact ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/class-impact
 * Returns aggregated environmental impact for the teacher's school.
 */
exports.getClassImpact = asyncHandler(async (req, res) => {
  const school = req.user.profile?.school;
  const schoolId = req.user.profile?.schoolId;
  if (!school && !schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Teacher account not associated with a school. Contact admin.'
    });
  }
  const matchSchool = schoolId ? { schoolId } : school ? { school } : {};

  const [impact, gradeBreakdown] = await Promise.all([
    ActivitySubmission.aggregate([
      { $match: { ...matchSchool, status: { $in: ['teacher_approved', 'ai_approved', 'approved'] } } },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          byType: { $push: '$activityType' }
        }
      }
    ]),
    User.aggregate([
      {
        $match: {
          role: 'student',
          ...(schoolId
            ? { 'profile.schoolId': mongoose.Types.ObjectId.createFromHexString
              ? new mongoose.Types.ObjectId(schoolId)
              : schoolId }
            : school
              ? { 'profile.school': school }
              : {})
        }
      },
      {
        $group: {
          _id: '$profile.grade',
          students: { $sum: 1 },
          totalPoints: { $sum: '$gamification.ecoPoints' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const summary = impact[0] || { totalActivities: 0 };

  res.status(200).json({
    success: true,
    data: {
      totalActivities: summary.totalActivities,
      gradeBreakdown: gradeBreakdown
    }
  });
});

// ─── Assignments ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/assignments
 */
exports.getAssignments = asyncHandler(async (req, res) => {
  const teacherRecord = await getTeacherRecord(req.user.id);
  res.status(200).json({
    success: true,
    count: teacherRecord.assignments.length,
    data: teacherRecord.assignments
  });
});

/**
 * POST /api/v1/teacher/assignments
 * Body: { title, description, activityType, grade, dueDate, ecoPoints }
 */
exports.createAssignment = asyncHandler(async (req, res) => {
  const { title, description, activityType, grade, dueDate, ecoPoints } = req.body;

  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    return res.status(400).json({ success: false, message: 'Title must be 3-200 characters' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDate && new Date(dueDate) < today) {
    return res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
  }

  const pointsValue = ecoPoints ?? 10;
  if (pointsValue < 1 || pointsValue > 100) {
    return res.status(400).json({ success: false, message: 'Points must be between 1 and 100' });
  }

  const sanitizedDescription = description
    ? description.replace(/<[^>]*>/g, '').trim().slice(0, 1000)
    : '';

  const teacherRecord = await getTeacherRecord(req.user.id);
  const assignment = {
    title,
    description: sanitizedDescription,
    activityType,
    grade,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    ecoPoints: pointsValue,
    status: 'active'
  };

  teacherRecord.assignments.push(assignment);
  await teacherRecord.save();

  const created = teacherRecord.assignments[teacherRecord.assignments.length - 1];

  // Broadcast to students via WebSocket if possible (non-blocking)
  if (global.io && grade) {
    const school = req.user.profile?.school;
    global.io.to(`school-${school}`).emit('new-assignment', {
      assignment: created,
      teacherName: req.user.name
    });
  }

  res.status(201).json({ success: true, data: created });
});

// ─── Classes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/classes
 * Returns the distinct grades/sections in the teacher's school.
 */
exports.getClasses = asyncHandler(async (req, res) => {
  const teacherRecord = await getTeacherRecord(req.user.id);
  const school = req.user.profile?.school;
  const schoolId = req.user.profile?.schoolId;

  const schoolFilter = schoolId
    ? { 'profile.schoolId': schoolId }
    : school
      ? { 'profile.school': school }
      : {};

  // Distinct grades present in the school
  const grades = await User.distinct('profile.grade', {
    role: 'student',
    ...schoolFilter,
    'profile.grade': { $exists: true, $ne: null }
  });

  res.status(200).json({
    success: true,
    data: {
      grades: grades.sort(),
      assignedClasses: teacherRecord.classes
    }
  });
});

// ─── Student Report ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/teacher/reports/student/:id
 * Returns a detailed report for an individual student.
 */
exports.getStudentReport = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id)
    .select('name email profile gamification environmentalImpact')
    .lean();

  if (!student || student.role === 'teacher') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // School boundary guard
  const teacherSchool = req.user.profile?.school;
  if (teacherSchool && student.profile?.school && student.profile.school !== teacherSchool) {
    return res.status(403).json({
      success: false,
      message: 'This student does not belong to your school'
    });
  }

  const submissions = await ActivitySubmission.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .select('activityType status createdAt reviewedAt evidence.description')
    .lean();

  const byType = {};
  for (const s of submissions) {
    if (!byType[s.activityType]) byType[s.activityType] = { total: 0, approved: 0 };
    byType[s.activityType].total++;
    if (['teacher_approved', 'approved', 'ai_approved'].includes(s.status)) byType[s.activityType].approved++;
  }

  res.status(200).json({
    success: true,
    data: {
      student,
      submissions: {
        total: submissions.length,
        approved: submissions.filter(s => ['teacher_approved', 'approved', 'ai_approved'].includes(s.status)).length,
        pending: submissions.filter(s => ['pending', 'pending_ai', 'pending_review', 'ai_processing'].includes(s.status)).length,
        byType,
        recent: submissions.slice(0, 10)
      }
    }
  });
});

// Reset a student's password (teacher scope)
exports.resetStudentPassword = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { newPassword } = req.body;
  const school = req.user.school || req.user.profile?.school;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password min 6 characters' });
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'Password too long' });
  }

  const student = await User.findOne({
    _id: studentId,
    $or: [{ school }, { schoolId: school }],
    role: 'student'
  });

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found in your school' });
  }

  const salt = await bcrypt.genSalt(10);
  student.password = await bcrypt.hash(newPassword, salt);
  await student.save();

  res.json({ success: true, message: `Password reset for ${student.name}` });
});

// Download PDF certificate for a student (teacher scope)
exports.downloadStudentCertificate = asyncHandler(async (req, res) => {
  const schoolId = req.user.profile?.schoolId || req.user.school;
  const student = await User.findOne({
    _id: req.params.studentId,
    role: 'student',
    $or: [{ school: schoolId }, { schoolId }]
  }).select('name gamification school profile');

  if (!student) {
    return res.status(404).json({ message: 'Student not found in your school' });
  }

  const school = await School.findById(student.school || student.profile?.schoolId).select('name');
  const stats = {
    activities: student.gamification?.activitiesCompleted || student.gamification?.totalActivities || 0,
    ecoPoints: student.gamification?.ecoPoints || 0
  };

  const pdf = await generateCertificate(student, req.user, school, stats);
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `attachment; filename=\"ecokids-certificate-${student.name}.pdf\"`);
  res.send(pdf);
});

// ─── Legacy compatibility (used by older requireTeacher middleware) ────────────

exports.getStudents = asyncHandler(async (req, res) => {
  const school = req.user?.profile?.school || req.teacher?.schoolCode;
  const students = await User.find({
    role: 'student',
    'profile.school': school
  }).select('name profile.grade gamification.ecoPoints environmentalImpact.activitiesCompleted');

  res.status(200).json({ success: true, data: students });
});

exports.assignTask = asyncHandler(async (req, res) => {
  return exports.createAssignment(req, res);
});

exports.reviewSubmission = asyncHandler(async (req, res) => {
  return exports.updateSubmissionStatus(req, res);
});
