const InterSchoolChallenge = require('../models/InterSchoolChallenge');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

/**
 * @desc    Get all challenges (public with filters)
 * @route   GET /api/v1/challenges
 * @access  Public
 */
exports.getAllChallenges = asyncHandler(async (req, res) => {
  const { status, school, limit = 20, offset = 0 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (school) query['schools.schoolName'] = school;

  const challenges = await InterSchoolChallenge.find(query)
    .sort({ startsAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .populate('createdBy', 'name email')
    .lean();

  const total = await InterSchoolChallenge.countDocuments(query);

  res.status(200).json({
    success: true,
    count: challenges.length,
    total,
    data: challenges
  });
});

/**
 * @desc    Get single challenge by ID
 * @route   GET /api/v1/challenges/:id
 * @access  Public
 */
exports.getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await InterSchoolChallenge.findById(req.params.id)
    .populate('createdBy', 'name email role')
    .lean();

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  res.status(200).json({
    success: true,
    data: challenge
  });
});

/**
 * @desc    Get active challenges
 * @route   GET /api/v1/challenges/active
 * @access  Public
 */
exports.getActiveChallenges = asyncHandler(async (req, res) => {
  const now = new Date();

  const challenges = await InterSchoolChallenge.find({
    status: 'active',
    startsAt: { $lte: now },
    endsAt: { $gte: now }
  })
    .sort({ endsAt: 1 })
    .populate('createdBy', 'name email')
    .lean();

  res.status(200).json({
    success: true,
    count: challenges.length,
    data: challenges
  });
});

/**
 * @desc    Get challenges for a specific school
 * @route   GET /api/v1/challenges/school/:schoolId
 * @access  Private
 */
exports.getSchoolChallenges = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;

  const challenges = await InterSchoolChallenge.find({
    'schools.schoolId': schoolId,
    status: { $in: ['active', 'completed'] }
  })
    .sort({ startsAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: challenges.length,
    data: challenges
  });
});

/**
 * @desc    Create new challenge (Teacher/Admin only)
 * @route   POST /api/v1/challenges
 * @access  Private/Teacher/Admin
 */
exports.createChallenge = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    challengeType,
    targetMetric,
    schools,
    startsAt,
    endsAt,
    rules
  } = req.body;

  // Validation
  if (!title || !description || !startsAt || !endsAt) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, description, start date, and end date'
    });
  }

  if (new Date(startsAt) >= new Date(endsAt)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  if (!schools || schools.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'At least 2 schools are required for a challenge'
    });
  }

  const challenge = await InterSchoolChallenge.create({
    title,
    description,
    challengeType: challengeType || 'eco_points',
    targetMetric: targetMetric || 'eco_points_total',
    schools: schools.map(s => ({
      schoolId: s.schoolId,
      schoolName: s.schoolName,
      totalScore: 0,
      participantCount: 0
    })),
    startsAt,
    endsAt,
    status: 'draft',
    createdBy: req.user.id,
    rules: rules || {}
  });

  logger.info(`Challenge created: ${challenge._id} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Challenge created successfully',
    data: challenge
  });
});

/**
 * @desc    Update challenge status (activate, complete, cancel)
 * @route   PATCH /api/v1/challenges/:id/status
 * @access  Private/Teacher/Admin
 */
exports.updateChallengeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['draft', 'active', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const challenge = await InterSchoolChallenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  // Authorization: Only creator or admin can update
  if (
    challenge.createdBy.toString() !== req.user.id &&
    !['district_admin', 'state_admin', 'admin'].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this challenge'
    });
  }

  challenge.status = status;
  await challenge.save();

  logger.info(`Challenge ${challenge._id} status updated to ${status} by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: `Challenge ${status}`,
    data: challenge
  });
});

/**
 * @desc    Update challenge scores (cron job or manual trigger)
 * @route   POST /api/v1/challenges/:id/update-scores
 * @access  Private/Admin
 */
exports.updateChallengeScores = asyncHandler(async (req, res) => {
  const challenge = await InterSchoolChallenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  if (challenge.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Challenge must be active to update scores'
    });
  }

  // Calculate scores for each school with rules engine
  const updatedSchools = await Promise.all(
    challenge.schools.map(async (school) => {
      const students = await User.find({
        role: 'student',
        'profile.school': school.schoolName,
        isActive: true
      });

      let baseScore = 0;
      let participantCount = students.length;

      // Calculate base score based on challenge type
      if (challenge.challengeType === 'eco_points') {
        baseScore = students.reduce((sum, s) => sum + (s.gamification?.ecoPoints || 0), 0);
      } else if (challenge.challengeType === 'activities') {
        baseScore = students.reduce(
          (sum, s) => sum + (s.environmentalImpact?.activitiesCompleted || 0),
          0
        );
      } else if (challenge.challengeType === 'quizzes') {
        // Count quiz attempts in challenge period
        baseScore = students.reduce((sum, s) => sum + (s.gamification?.badges?.length || 0), 0);
      }

      // Apply competition rules engine
      let totalScore = baseScore;

      // 1. Apply difficulty tier multiplier
      const difficultyMultipliers = {
        easy: 0.8,
        medium: 1.0,
        hard: 1.5,
        extreme: 2.0
      };
      const difficultyMultiplier = difficultyMultipliers[challenge.rules?.difficultyTier] || 1.0;
      totalScore *= difficultyMultiplier;

      // 2. Apply points multiplier (e.g., 2x points week)
      const pointsMultiplier = challenge.rules?.pointsMultiplier || 1;
      totalScore *= pointsMultiplier;

      // 3. Apply time-based bonuses (if currently in bonus window)
      if (challenge.rules?.timeBonuses?.length > 0) {
        const currentHour = new Date().getHours();
        const activeBonus = challenge.rules.timeBonuses.find(
          bonus => currentHour >= bonus.startHour && currentHour < bonus.endHour
        );
        if (activeBonus) {
          totalScore *= activeBonus.multiplier;
          logger.info(`Time bonus applied: ${activeBonus.multiplier}x during ${activeBonus.startHour}-${activeBonus.endHour}`);
        }
      }

      // 4. Apply bonus conditions (e.g., first to 100 points)
      let bonusPoints = 0;
      if (challenge.rules?.bonusConditions?.length > 0) {
        challenge.rules.bonusConditions.forEach(condition => {
          if (condition.condition === 'first_to_100' && baseScore >= 100 && !school.bonusApplied) {
            bonusPoints += condition.bonusPoints;
            school.bonusApplied = true;
          } else if (condition.condition === 'daily_streak_7') {
            // Check if any student has 7-day streak (simplified)
            const hasStreak = students.some(s => (s.gamification?.currentStreak || 0) >= 7);
            if (hasStreak) {
              bonusPoints += condition.bonusPoints;
            }
          }
        });
      }

      totalScore += bonusPoints;

      return {
        ...school.toObject(),
        totalScore: Math.round(totalScore),
        participantCount,
        baseScore: Math.round(baseScore),
        multipliers: {
          difficulty: difficultyMultiplier,
          points: pointsMultiplier
        },
        bonusPoints
      };
    })
  );

  challenge.schools = updatedSchools;
  await challenge.save();

  logger.info(`Challenge ${challenge._id} scores updated`);

  res.status(200).json({
    success: true,
    message: 'Challenge scores updated',
    data: challenge
  });
});

/**
 * @desc    Finalize challenge and compute rankings
 * @route   POST /api/v1/challenges/:id/finalize
 * @access  Private/Admin
 */
exports.finalizeChallenge = asyncHandler(async (req, res) => {
  const challenge = await InterSchoolChallenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  if (challenge.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Challenge already finalized'
    });
  }

  // Sort schools by totalScore
  const rankings = challenge.schools
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((school, index) => ({
      rank: index + 1,
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      totalScore: school.totalScore
    }));

  challenge.results = {
    rankings,
    computedAt: new Date()
  };
  challenge.status = 'completed';
  await challenge.save();

  logger.info(`Challenge ${challenge._id} finalized with ${rankings.length} schools`);

  res.status(200).json({
    success: true,
    message: 'Challenge finalized',
    data: challenge
  });
});

/**
 * @desc    Delete challenge (Admin only)
 * @route   DELETE /api/v1/challenges/:id
 * @access  Private/Admin
 */
exports.deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await InterSchoolChallenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  await challenge.deleteOne();

  logger.info(`Challenge ${req.params.id} deleted by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Challenge deleted'
  });
});

module.exports = exports;
