const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
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
const { sendSms } = require('../services/smsService');

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
    'tree-planting', 'waste-recycling', 'water-saving',
    'energy-saving', 'plastic-reduction', 'composting', 'biodiversity-survey'
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

  // === FRAUD CHECK 2: Geo-location enforcement ===
  const geoResult = validateGeoLocation(latitude, longitude, geoAccuracy);
  if (!geoResult.valid) {
    return res.status(400).json({
      success: false,
      message: geoResult.message,
      fraudCheck: 'geo_location'
    });
  }

  // === FRAUD CHECK 3: Submission cooldown ===
  const cooldownResult = await checkSubmissionCooldown(req.user.id, activityType);
  if (!cooldownResult.allowed) {
    return res.status(429).json({
      success: false,
      message: `You've submitted ${cooldownResult.currentCount} ${activityType} activities this week. Maximum ${cooldownResult.maxAllowed} allowed.`,
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

  // === Upload to Cloudinary ===
  const cloudinary = require('../config/cloudinary');
  const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecokids-submissions',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      const streamifier = require('streamifier');
      streamifier.createReadStream(buffer).pipe(stream);
    });
  };

  const uploadResult = await uploadToCloudinary(req.file.buffer);
  const imageUrl = uploadResult.secure_url;
  const publicId = uploadResult.public_id;

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
    nepCompetencies: getCompetenciesForActivity(activityType),
    sdgGoals: getSdgsForActivity(activityType),
    evidence: {
      imageUrl,
      publicId,
      description,
      location: latitude && longitude ? { latitude, longitude } : undefined
    },
    geoLocation: {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      accuracy: geoAccuracy ? parseFloat(geoAccuracy) : undefined,
      timestamp: new Date()
    },
    status: 'pending',
    impactApplied: false,
    fileHash,
    pHash: pHash || undefined,
    school: req.user.profile ? req.user.profile.school : undefined,
    district: req.user.profile ? req.user.profile.district : undefined,
    state: req.user.profile ? req.user.profile.state : undefined
  });

  await submission.save();

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
    .populate('reviewedBy', 'name');

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

  const submissions = await ActivitySubmission.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .populate('user', 'name profile.school profile.grade');

  const total = await ActivitySubmission.countDocuments({ status: 'pending' });

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

  // Grace Fallback Boundary check
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

  if (status === 'rejected') {
    const { deleteImage } = require('../services/cloudinaryService');

    const submission = await ActivitySubmission.findOne({ _id: submissionId, status: 'pending' });

    if (!submission) {
      return res.status(400).json({ success: false, message: 'Already processed or not pending' });
    }

    // Delete image from Cloudinary permanently to stop storage bloat
    if (submission.evidence && submission.evidence.publicId) {
      await deleteImage(submission.evidence.publicId);
    }

    // Remove the orphaned record forever
    await submission.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Activity rejected and evidence deleted permanently',
      data: {}
    });
  }

  if (status === 'approved') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const submission = await ActivitySubmission.findOneAndUpdate(
        {
          _id: submissionId,
          status: 'pending'
        },
        {
          status: 'approved',
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

      // 2. Create OutboxEvent in the same transaction
      await OutboxEvent.create([{
        type: 'SUBMISSION_APPROVED',
        payload: {
          submissionId: submission._id,
          studentId: submission.user._id,
          action: 'approve'
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

      console.log(`[Activity Verified] ${submission.activityType}`, impact);

      await session.commitTransaction();
      session.endSession();

      await awardEcoPoints(submission.user._id, rewardValues.ACTIVITY_APPROVED, 'activity-approved', { sourceType: 'activity' });

      // Wire badge evaluation
      const gamificationService = require('../services/gamificationService');
      const newBadges = await gamificationService.evaluateBadgesForUser(submission.user._id);
      if (newBadges?.length > 0) {
        console.log(`[Badges] User ${submission.user._id} unlocked: ${newBadges.map(b => b.name).join(', ')}`);

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
      console.error("[verifyActivity] Transaction error", error);
      return res.status(500).json({ success: false, message: 'Server Error during approval' });
    }
  }
});

// Phase 6: Offline Activity Sync Endpoint
// POST /api/v1/activity/sync-offline
// Accepts array of offline submissions stored in IndexedDB and syncs them to server
exports.syncOfflineSubmissions = asyncHandler(async (req, res) => {
  const { submissions } = req.body;

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Submissions array is required and must not be empty'
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
        'tree-planting', 'waste-recycling', 'water-saving',
        'energy-saving', 'plastic-reduction', 'composting', 'biodiversity-survey'
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
        status: 'pending',
        impactApplied: false,
        school: req.user.profile ? req.user.profile.school : undefined,
        district: req.user.profile ? req.user.profile.district : undefined,
        state: req.user.profile ? req.user.profile.state : undefined,
        syncedFromOffline: true,
        syncedAt: new Date()
      });

      await submission.save();

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
