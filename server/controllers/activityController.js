const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const School = require('../models/School');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const ApprovalAuditLog = require('../models/ApprovalAuditLog');
const asyncHandler = require('../middleware/async');
const { calculateImpact } = require('../utils/impactCalculator');
const { awardEcoPoints } = require('../utils/ecoPointsManager');
const rewardValues = require('../constants/rewardValues');
const validator = require('validator');
const { gamificationQueue } = require('../queues/gamificationQueue');
const mongoose = require('mongoose');
const OutboxEvent = require('../models/OutboxEvent');
const {
  validateGeoLocation,
  checkSubmissionCooldown,
  recordSubmissionForCooldown,
  generatePHash,
  checkPHashDuplicate,
  createFraudFlag
} = require('../services/fraudService');
const { getCompetenciesForActivity } = require('../config/nepMapping');
const { getSdgsForActivity } = require('../config/sdgMapping');
const { ACTIVITY_POINTS_MAP } = require('../config/activityTypes');
const { getGeoPolicy } = require('../config/geoPolicy');
const { sendSms } = require('../services/smsService');
const { aiVerificationQueue } = require('../queues/aiVerificationQueue');
const { uploadImage } = require('../services/storageService');
const { redisClient } = require('../services/cacheService');

const APPROVAL_RATE_WINDOW = 10 * 60; // 10-minute rolling window in seconds
const APPROVAL_RATE_LIMIT = 15; // max approvals per window

async function findAssignedTeacherForStudent(student) {
  const schoolId = student.profile?.schoolId || student.schoolId || student.school;
  if (!schoolId) return null;
  const grade = String(student.profile?.grade || student.class || '').trim();
  const section = String(student.section || '').trim();
  const classCandidates = [];

  if (grade && section) classCandidates.push(`${grade}${section}`);
  if (grade) classCandidates.push(grade);
  if (section) classCandidates.push(section);

  let teacherRecord = null;

  if (schoolId && classCandidates.length > 0) {
    teacherRecord = await Teacher.findOne({
      schoolId,
      classes: { $in: classCandidates }
    }).select('userId').lean();
  }

  if (!teacherRecord && schoolId) {
    teacherRecord = await Teacher.findOne({ schoolId }).select('userId').lean();
  }

  if (teacherRecord?.userId) {
    return teacherRecord.userId;
  }

  const fallbackTeacher = await User.findOne({
    role: 'teacher',
    'profile.schoolId': schoolId
  }).select('_id').lean();

  return fallbackTeacher?._id || null;
}

exports.submitActivity = asyncHandler(async (req, res) => {
  const { activityType, description, latitude, longitude, geoAccuracy } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image evidence is required'
    });
  }

  // === FRAUD CHECK 1: Validate activity type early ===
  const validTypes = [
    'tree-planting',
    'waste-segregation',
    'water-conservation',
    'energy-saving',
    'composting',
    'nature-walk',
    'quiz-completion',
    'stubble-management',
    'sutlej-cleanup',
    'groundwater-conservation',
    'air-quality-monitoring',
    'urban-tree-planting'
  ];

  if (!activityType || !description) {
    return res.status(400).json({
      success: false,
      message: 'Activity type and description are required'
    });
  }

  if (!validTypes.includes(activityType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid activity type. Must be one of: ${validTypes.join(', ')}`
    });
  }

  // === FRAUD CHECK 2: Geo-location enforcement (per-activity policy) ===
  const geoPolicy = getGeoPolicy(activityType);

  // Only hard-require GPS coords if the policy demands it
  if (geoPolicy.requiresGeo) {
    const geoResult = validateGeoLocation(latitude, longitude, geoAccuracy);
    if (!geoResult.valid) {
      return res.status(400).json({
        success: false,
        message: geoResult.message,
        fraudCheck: 'geo_location'
      });
    }
  }

  const flags = [];
  const schoolObjectId = req.user.profile?.schoolId;
  if (schoolObjectId && latitude !== undefined && longitude !== undefined && geoPolicy.maxDistanceMeters !== null) {
    const schoolDoc = await School.findById(schoolObjectId).select('coordinates');
    if (schoolDoc?.coordinates?.lat && schoolDoc?.coordinates?.lng) {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371000;
      const dLat = toRad(parseFloat(latitude) - schoolDoc.coordinates.lat);
      const dLon = toRad(parseFloat(longitude) - schoolDoc.coordinates.lng);
      const lat1 = toRad(schoolDoc.coordinates.lat);
      const lat2 = toRad(parseFloat(latitude));
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distance > geoPolicy.maxDistanceMeters) {
        // Flag but don't block — AI will factor this in as a confidence reducer
        flags.push('outside_school_proximity');
      }
    }
  }


  // === FRAUD CHECK 3: Submission cooldown ===
  const cooldownResult = await checkSubmissionCooldown(req.user.id, activityType);
  if (!cooldownResult.allowed) {
    return res.status(429).json({
      success: false,
      message: `You've submitted ${cooldownResult.currentCount} ${activityType} activities today. Maximum ${cooldownResult.maxAllowed} allowed.`,
      nextAvailableAt: cooldownResult.nextAvailableAt,
      retryAfterSeconds: cooldownResult.retryAfterSeconds,
      fraudCheck: 'cooldown'
    });
  }

  if (req.body.photoUrl) {
    const duplicatePhotoSubmission = await ActivitySubmission.findOne({
      $or: [{ photoUrl: req.body.photoUrl }, { 'evidence.imageUrl': req.body.photoUrl }],
      user: { $ne: req.user.id }
    });

    if (duplicatePhotoSubmission) {
      return res.status(400).json({
        success: false,
        message: 'This image has already been used in another submission'
      });
    }
  }

  // === FRAUD CHECK 4: SHA-256 exact duplicate ===
  const crypto = require('crypto');
  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

  const existingSubmission = await ActivitySubmission.findOne({ fileHash });
  if (existingSubmission) {
    return res.status(409).json({
      success: false,
      message: 'This exact image has already been submitted. Please upload an original photo.',
      fraudCheck: 'exact_duplicate'
    });
  }

  // === FRAUD CHECK 5: Perceptual hash (visual similarity) ===
  const pHash = await generatePHash(req.file.buffer);
  if (pHash) {
    const pHashResult = await checkPHashDuplicate(pHash, req.user.id);
    if (pHashResult.isDuplicate) {
      // Don't block the submission yet if cross-student, just flag it
      if (pHashResult.crossStudent) {
        // Will create flag after submission is saved
        req._fraudAlert = pHashResult;
      } else {
        // Same student, same image — block
        return res.status(409).json({
          success: false,
          message: pHashResult.message,
          fraudCheck: 'perceptual_duplicate'
        });
      }
    }
  }

  const uploadResult = await uploadImage(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );
  const imageUrl = uploadResult.url;
  const imageFileId = uploadResult.fileId;

  if (imageUrl && !validator.isURL(imageUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image URL'
    });
  }

  // === Create submission with all fraud-prevention data ===
  const submission = new ActivitySubmission({
    user: req.user.id,
    idempotencyKey: req.idempotencyKey,
    activityType,
    activityPoints: ACTIVITY_POINTS_MAP[activityType] || 10,
    nepCompetencies: getCompetenciesForActivity(activityType),
    sdgGoals: getSdgsForActivity(activityType),
    evidence: {
      imageUrl,
      imageFileId,
      publicId: imageFileId,
      description,
      location: latitude && longitude ? { latitude, longitude } : undefined
    },
    geoLocation: {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      accuracy: geoAccuracy ? parseFloat(geoAccuracy) : undefined,
      timestamp: new Date()
    },
    deviceTimestamp: req.body.deviceTimestamp ? new Date(req.body.deviceTimestamp) : undefined,
    status: 'pending',
    impactApplied: false,
    fileHash,
    pHash: pHash || undefined,
    flags,
    school: schoolObjectId || req.user.profile?.schoolId || undefined,
    schoolId: schoolObjectId || req.user.profile?.schoolId || undefined,
    district: req.user.profile ? req.user.profile.district : undefined,
    state: req.user.profile ? req.user.profile.state : undefined
  });

  await submission.save();

  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) {
    submission.flags = [...(submission.flags || []), 'late_night_submission'];
    submission.status = 'pending_review';
    await submission.save();
  }

  try {
    await aiVerificationQueue.add('verify-image', {
      submissionId: submission._id,
      imageUrl: submission.evidence.imageUrl,
      activityType: submission.activityType
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  } catch (error) {
    console.error('[AI Queue] Error enqueueing verification job:', error);
  }


  const teacher = submission.school
    ? await User.findOne({ role: 'teacher', 'profile.school': submission.school }).select('_id').lean()
    : null;

  if (global.io && teacher?._id) {
    global.io.to(`teacher-${teacher._id.toString()}`).emit('new-submission', {
      studentName: req.user.name,
      activityType: submission.activityType,
      submissionId: submission._id,
      submittedAt: submission.createdAt
    });
  }

  // Record cooldown (non-blocking)
  recordSubmissionForCooldown(req.user.id, activityType).catch(() => { });

  // Create fraud flag if cross-student pHash match detected (non-blocking)
  if (req._fraudAlert) {
    createFraudFlag(
      submission._id,
      req.user.id,
      req._fraudAlert.flagType,
      req._fraudAlert.confidence,
      req._fraudAlert.message,
      req._fraudAlert.matchedSubmissions
    ).catch(() => { });
  }

  res.status(201).json({
    success: true,
    data: submission
  });
});

exports.getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await ActivitySubmission.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('reviewedBy', 'name role')
    .populate('verifiedBy', 'name role')
    .populate('appealResolvedBy', 'name role');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

exports.getPendingSubmissions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view pending submissions'
    });
  }

  const { limit = 50, offset = 0 } = req.query;

  const schoolId = req.user.profile?.schoolId || req.user.schoolId;
  const schoolName = req.user.profile?.school || req.user.school;

  if (!schoolId && !schoolName) {
    return res.status(403).json({
      success: false,
      message: 'Teacher account not associated with a school. Contact admin.'
    });
  }

  const schoolFilter = schoolId ? { schoolId } : { school: schoolName };

  const submissions = await ActivitySubmission.find({
    status: { $in: ['pending', 'pending_ai', 'pending_review', 'ai_processing'] },
    ...schoolFilter
  })
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .populate('user', 'name profile.school profile.grade');

  const total = await ActivitySubmission.countDocuments({
    status: { $in: ['pending', 'pending_ai', 'pending_review', 'ai_processing'] },
    ...schoolFilter
  });

  res.status(200).json({
    success: true,
    count: submissions.length,
    total,
    data: submissions
  });
});

exports.verifyActivity = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to verify activities'
    });
  }

  const { submissionId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either "approved" or "rejected"'
    });
  }

  const submissionInfo = await ActivitySubmission.findById(submissionId).populate('user');

  if (!submissionInfo) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  if (
    submissionInfo.school &&
    req.user.profile && req.user.profile.school &&
    submissionInfo.school !== req.user.profile.school
  ) {
    return res.status(403).json({
      success: false,
      message: 'Cannot approve submissions outside your school'
    });
  }

  // Approval rate-limit check: max 15 approvals per 10-minute rolling window (anti-fraud)
  if (status === 'approved') {
    try {
      const rateKey = `approval_rate:${req.user.id}`;
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - APPROVAL_RATE_WINDOW;

      // Use Redis sorted set: score = timestamp, member = unique key per approval
      await redisClient.zremrangebyscore(rateKey, '-inf', windowStart);
      const windowCount = await redisClient.zcard(rateKey);

      if (windowCount >= APPROVAL_RATE_LIMIT) {
        return res.status(429).json({
          error: 'APPROVAL_RATE_LIMIT',
          message: 'Unusually high approval rate detected. Your approvals have been paused for review. Contact your school administrator.'
        });
      }

      await redisClient.zadd(rateKey, now, `${submissionId}:${now}`);
      await redisClient.expire(rateKey, APPROVAL_RATE_WINDOW + 60);
    } catch (_) { /* Redis failure is non-blocking — approval proceeds */ }
  }

  const reviewableStatuses = ['pending', 'pending_ai', 'pending_review'];

  if (status === 'rejected') {
    const submission = await ActivitySubmission.findOneAndUpdate(
      { _id: submissionId, status: { $in: reviewableStatuses } },
      {
        status: 'teacher_rejected',
        rejectionReason: (rejectionReason || '').trim() || 'Submission rejected by teacher',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        teacherReview: {
          teacherId: req.user._id,
          decision: 'reject',
          notes: (rejectionReason || '').trim(),
          reviewedAt: new Date()
        }
      },
      { new: true }
    ).populate('user');

    if (!submission) {
      return res.status(400).json({ success: false, message: 'Already processed or not pending' });
    }

    // Log to approval audit trail
    ApprovalAuditLog.create({
      teacher_id: req.user.id,
      submission_id: submissionId,
      action: 'rejected',
      action_source: 'teacher',
      ip_address: req.ip,
      session_id: req.headers['x-session-id'] || null
    }).catch(() => {});

    return res.status(200).json({ success: true, message: 'Activity rejected', data: submission });
  }

  if (status === 'approved') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const submission = await ActivitySubmission.findOneAndUpdate(
        {
          _id: submissionId,
          status: { $in: reviewableStatuses }
        },
        {
          status: 'teacher_approved',
          impactApplied: true,
          verifiedBy: req.user.id,
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        },
        {
          new: true,
          session
        }
      ).populate('user');

      if (!submission) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Already processed or not pending' });
      }

      await OutboxEvent.create([{
        type: 'SUBMISSION_APPROVED',
        payload: {
          submissionId: submission._id,
          studentId: submission.user._id,
          action: 'approve_teacher'
        },
        processed: false
      }], { session });

      await AuditLog.create([{
        action: 'ACTIVITY_APPROVED',
        actor: req.user.id,
        target: submission.user._id,
        metadata: { submissionId: submission._id, activityType: submission.activityType },
        ip: req.ip
      }], { session });

      if (submission.school) {
        gamificationQueue.add('update-school-aggregate', { schoolId: submission.school });
      }

      const impact = calculateImpact(submission.activityType, {});

      await User.findByIdAndUpdate(
        submission.user._id,
        {
          $inc: {
            'environmentalImpact.treesPlanted': impact.treesPlanted || 0,
            'environmentalImpact.co2Prevented': impact.co2Prevented || 0,
            'environmentalImpact.waterSaved': impact.waterSaved || 0,
            'environmentalImpact.plasticReduced': impact.plasticReduced || 0,
            'environmentalImpact.energySaved': impact.energySaved || 0,
            'environmentalImpact.activitiesCompleted': 1
          },
          $set: { 'environmentalImpact.lastImpactUpdate': new Date() }
        },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      await awardEcoPoints(submission.user._id, rewardValues.ACTIVITY_APPROVED, 'activity-approved', {
        sourceType: 'activity',
        sourceModel: 'ActivitySubmission',
        submissionId: submission._id,
        activityType: submission.activityType,
        verification: {
          status: 'teacher_approved',
          reviewerId: req.user.id,
          verifiedAt: new Date().toISOString()
        }
      });

      const streakUser = await User.findById(submission.user._id);
      if (streakUser) {
        await streakUser.updateStreak();
      }

      const gamificationService = require('../services/gamificationService');
      const newBadges = await gamificationService.evaluateBadgesForUser(submission.user._id);
      if (newBadges?.length > 0) {
        const freshUser = await User.findById(submission.user._id).select('name parentPhone');
        const phone = String(freshUser?.parentPhone || '').replace(/\D/g, '').slice(-10);
        if (/^\d{10}$/.test(phone)) {
          for (const badge of newBadges) {
            await sendSms({
              phone,
              message: `Great news! Your child ${freshUser?.name || 'Student'} just earned the '${badge.name}' badge on EcoKids India! - EcoKids Team`
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Activity approved',
        data: submission
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('[verifyActivity] Transaction error', error);
      return res.status(500).json({ success: false, message: 'Server Error during approval' });
    }
  }
});

exports.appealSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { reason } = req.body;

  const trimmedReason = (reason || '').trim();
  if (!trimmedReason) {
    return res.status(400).json({ success: false, message: 'Appeal reason is required' });
  }
  if (trimmedReason.length > 200) {
    return res.status(400).json({ success: false, message: 'Appeal reason cannot exceed 200 characters' });
  }

  const submission = await ActivitySubmission.findById(submissionId).populate('user', 'name profile.grade section class profile.schoolId');
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (String(submission.user?._id || submission.user) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: 'You can only appeal your own submissions' });
  }

  if (!['rejected', 'teacher_rejected'].includes(submission.status)) {
    return res.status(400).json({ success: false, message: 'Only rejected submissions can be appealed' });
  }

  if (submission.status === 'appealed' || submission.appealedAt) {
    return res.status(400).json({ success: false, message: 'This submission has already been appealed' });
  }

  submission.status = 'appealed';
  submission.appealReason = trimmedReason;
  submission.appealedAt = new Date();
  submission.appealed_at = submission.appealedAt;
  await submission.save();

  const teacherUserId = await findAssignedTeacherForStudent(submission.user);
  if (teacherUserId) {
    await Notification.create({
      userId: teacherUserId,
      type: 'system',
      title: 'New Appeal Submitted',
      message: `${submission.user?.name || 'A student'} appealed a rejected activity submission.`,
      data: {
        submissionId: submission._id,
        activityType: submission.activityType,
        reason: trimmedReason,
        studentId: submission.user?._id || req.user.id
      }
    }).catch(() => {});
  }

  return res.status(200).json({ success: true, data: submission });
});

exports.getAppealedSubmissions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view appealed submissions' });
  }

  const schoolId = req.user.profile?.schoolId || req.user.schoolId;
  const schoolName = req.user.profile?.school || req.user.school;

  if (!schoolId && !schoolName) {
    return res.status(403).json({ success: false, message: 'Teacher account not associated with a school. Contact admin.' });
  }

  const schoolFilter = schoolId ? { schoolId } : { school: schoolName };
  const submissions = await ActivitySubmission.find({
    ...schoolFilter,
    status: 'appealed'
  })
    .sort({ appealedAt: -1, createdAt: -1 })
    .populate('user', 'name profile.grade class section');

  return res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

exports.resolveAppeal = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'school_admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to resolve appeals' });
  }

  const { submissionId } = req.params;
  const { decision, teacherNote } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Decision must be either "approved" or "rejected"' });
  }

  const submission = await ActivitySubmission.findById(submissionId).populate('user');
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (submission.status !== 'appealed') {
    return res.status(400).json({ success: false, message: 'Submission is not in appealed state' });
  }

  if (decision === 'approved') {
    submission.status = 'approved';
    submission.impactApplied = true;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    submission.appealDecision = 'approved';
    submission.appealTeacherNote = (teacherNote || '').trim();
    submission.appealResolvedAt = new Date();
    submission.appealResolvedBy = req.user.id;
    await submission.save();

    const impact = calculateImpact(submission.activityType, {});
    await User.findByIdAndUpdate(submission.user._id, {
      $inc: {
        'environmentalImpact.treesPlanted': impact.treesPlanted || 0,
        'environmentalImpact.co2Prevented': impact.co2Prevented || 0,
        'environmentalImpact.waterSaved': impact.waterSaved || 0,
        'environmentalImpact.plasticReduced': impact.plasticReduced || 0,
        'environmentalImpact.energySaved': impact.energySaved || 0,
        'environmentalImpact.activitiesCompleted': 1
      },
      $set: { 'environmentalImpact.lastImpactUpdate': new Date() }
    });

    await awardEcoPoints(submission.user._id, submission.activityPoints || rewardValues.ACTIVITY_APPROVED, 'appeal-approved', {
      sourceType: 'activity',
      sourceModel: 'ActivitySubmission',
      submissionId: submission._id,
      activityType: submission.activityType,
      verification: {
        status: 'appeal_approved',
        reviewerId: req.user.id,
        verifiedAt: new Date().toISOString()
      },
      idempotencyKey: `appeal:approved:${submission._id.toString()}`
    });

    const streakUser = await User.findById(submission.user._id);
    if (streakUser) {
      await streakUser.updateStreak();
    }
  } else {
    submission.status = 'appeal_rejected';
    submission.appealDecision = 'rejected';
    submission.appealTeacherNote = (teacherNote || '').trim();
    submission.appealResolvedAt = new Date();
    submission.appealResolvedBy = req.user.id;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    await submission.save();
  }

  await Notification.create({
    userId: submission.user._id,
    type: 'system',
    title: 'Appeal Decision Update',
    message: decision === 'approved'
      ? 'Your appeal was approved. Eco points have been credited.'
      : 'Your appeal was reviewed and rejected by your teacher.',
    data: {
      submissionId: submission._id,
      decision,
      teacherNote: (teacherNote || '').trim()
    }
  }).catch(() => {});

  return res.status(200).json({ success: true, data: submission });
});
// Phase 6: Offline Activity Sync Endpoint
// POST /api/v1/activity/sync-offline
// Accepts array of offline submissions stored in IndexedDB and syncs them to server
exports.syncOfflineSubmissions = asyncHandler(async (req, res) => {
  const { submissions } = req.body;

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'submissions array is required'
    });
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const offlineSubmission of submissions) {
    try {
      const {
        activityType,
        description,
        imageUrl,
        latitude,
        longitude,
        idempotencyKey
      } = offlineSubmission;

      // Validate required fields
      if (!activityType || !description || !imageUrl) {
        results.push({
          idempotencyKey: idempotencyKey || 'unknown',
          success: false,
          message: 'Missing required fields: activityType, description, imageUrl'
        });
        failureCount++;
        continue;
      }

      // Check for valid activity type
      const validTypes = [
        'tree-planting',
        'waste-segregation',
        'water-conservation',
        'energy-saving',
        'composting',
        'nature-walk',
        'quiz-completion',
        'stubble-management',
        'sutlej-cleanup',
        'groundwater-conservation',
        'air-quality-monitoring',
        'urban-tree-planting'
      ];

      if (!validTypes.includes(activityType)) {
        results.push({
          idempotencyKey: idempotencyKey || 'unknown',
          success: false,
          message: `Invalid activity type: ${activityType}`
        });
        failureCount++;
        continue;
      }

      // Check idempotency - don't resubmit same activity twice
      if (idempotencyKey) {
        const existingSubmission = await ActivitySubmission.findOne({
          user: req.user.id,
          idempotencyKey
        });

        if (existingSubmission) {
          results.push({
            idempotencyKey,
            success: false,
            message: 'This activity was already submitted (duplicate idempotency key)'
          });
          failureCount++;
          continue;
        }
      }

      // Create submission record (imageUrl is already a data-URL or URL from offline, use as-is)
      const submission = new ActivitySubmission({
        user: req.user.id,
        idempotencyKey: idempotencyKey || `offline-${Date.now()}-${Math.random()}`,
        activityType,
        nepCompetencies: getCompetenciesForActivity(activityType),
        sdgGoals: getSdgsForActivity(activityType),
        evidence: {
          imageUrl,
          description,
          location: latitude && longitude ? { latitude, longitude } : undefined
        },
        geoLocation: latitude && longitude ? {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          timestamp: new Date()
        } : undefined,
        status: 'pending_ai',
        impactApplied: false,
        school: req.user.profile ? req.user.profile.school : undefined,
        district: req.user.profile ? req.user.profile.district : undefined,
        state: req.user.profile ? req.user.profile.state : undefined,
        syncedFromOffline: true,
        syncedAt: new Date()
      });

      await submission.save();

      try {
        await aiVerificationQueue.add('verify-image', {
          submissionId: submission._id,
          imageUrl: submission.evidence.imageUrl,
          activityType: submission.activityType
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        });
      } catch (error) {
        console.error('[AI Queue] Error enqueueing verification job from offline sync:', error);
      }

      // Notify teacher of new submission via WebSocket if available
      const teacher = submission.school
        ? await User.findOne({ role: 'teacher', 'profile.school': submission.school }).select('_id').lean()
        : null;

      if (global.io && teacher?._id) {
        global.io.to(`teacher-${teacher._id.toString()}`).emit('new-submission', {
          studentName: req.user.name,
          activityType: submission.activityType,
          submissionId: submission._id,
          submittedAt: submission.createdAt,
          synced: true
        });
      }

      // Record cooldown
      recordSubmissionForCooldown(req.user.id, activityType).catch(() => { });

      results.push({
        idempotencyKey: idempotencyKey || `offline-${submission._id}`,
        success: true,
        submissionId: submission._id.toString(),
        message: 'Activity submitted successfully from offline queue'
      });

      successCount++;
    } catch (error) {
      console.error('[syncOfflineSubmissions] Error processing submission:', error);
      results.push({
        idempotencyKey: offlineSubmission.idempotencyKey || 'unknown',
        success: false,
        message: error.message || 'Server error processing submission'
      });
      failureCount++;
    }
  }

  // Log the sync event to audit
  await AuditLog.create({
    action: 'OFFLINE_SYNC',
    actor: req.user.id,
    target: req.user.id,
    metadata: {
      totalSubmissions: submissions.length,
      successCount,
      failureCount
    },
    ip: req.ip
  }).catch(() => { });

  res.status(200).json({
    success: failureCount === 0,
    message: `Synced ${successCount}/${submissions.length} activities`,
    data: {
      totalSubmissions: submissions.length,
      successCount,
      failureCount,
      results
    }
  });
});
