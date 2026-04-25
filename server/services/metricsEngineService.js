const EngagementEvent = require('../models/EngagementEvent');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');

async function computePeriodMetrics(startDate, endDate) {
  const weekStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalStudents, impactAgg, weeklyApprovedAgg, weeklyActiveUsersAgg, retentionAgg] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.aggregate([
      {
        $match: {
          role: 'student',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          co2Saved: { $sum: '$environmentalImpact.co2Prevented' },
          wasteReduced: { $sum: '$environmentalImpact.plasticReduced' },
          treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
          waterSaved: { $sum: '$environmentalImpact.waterSaved' }
        }
      }
    ]),
    ActivitySubmission.countDocuments({
      status: { $in: ['approved', 'teacher_approved', 'ai_approved'] },
      reviewedAt: { $gte: weekStart, $lte: endDate }
    }),
    ActivitySubmission.distinct('user', {
      status: { $in: ['approved', 'teacher_approved', 'ai_approved'] },
      reviewedAt: { $gte: weekStart, $lte: endDate }
    }),
    EngagementEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          event: { $in: ['registration', 'day_7_retention', 'day_30_retention', 'first_activity'] }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const impactData = impactAgg[0] || {
    co2Saved: 0,
    wasteReduced: 0,
    treesPlanted: 0,
    waterSaved: 0
  };

  const retentionByEvent = retentionAgg.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const dauWau = await EngagementEvent.distinct('userId', {
    createdAt: { $gte: weekStart, $lte: endDate }
  });

  const studentWithStreak = await User.countDocuments({
    role: 'student',
    isActive: true,
    'gamification.streak.current': { $gt: 0 }
  });

  const activeStudents = weeklyActiveUsersAgg.length;
  const studentEngagementPercent = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const verifiedActionsPerStudentWeek = totalStudents > 0 ? Math.round((weeklyApprovedAgg / totalStudents) * 100) / 100 : 0;
  const wau = dauWau.length;
  const sevenDayRetention = retentionByEvent.day_7_retention || 0;
  const thirtyDayRetention = retentionByEvent.day_30_retention || 0;
  const streakContinuityRate = totalStudents > 0 ? Math.round((studentWithStreak / totalStudents) * 100) : 0;

  return {
    period: { from: startDate.toISOString(), to: endDate.toISOString() },
    metrics: {
      co2Saved: Math.round((impactData.co2Saved || 0) * 100) / 100,
      wasteReduced: Math.round((impactData.wasteReduced || 0) * 100) / 100,
      treesPlanted: Math.round(impactData.treesPlanted || 0),
      waterSaved: Math.round((impactData.waterSaved || 0) * 100) / 100,
      studentEngagementPercent,
    },
    behaviorChange: {
      wau,
      verifiedActionsPerStudentWeek,
      sevenDayRetention,
      thirtyDayRetention,
      streakContinuityRate,
      activeStudents,
      totalStudents,
    }
  };
}

async function getMetricsSummary({ from, to } = {}) {
  const now = new Date();
  const endDate = to ? new Date(to) : now;
  const startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const previousWindowMs = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate.getTime());
  const previousStartDate = new Date(startDate.getTime() - previousWindowMs);

  const [current, previous] = await Promise.all([
    computePeriodMetrics(startDate, endDate),
    computePeriodMetrics(previousStartDate, previousEndDate)
  ]);

  const deltas = {
    co2Saved: Math.round((current.metrics.co2Saved - previous.metrics.co2Saved) * 100) / 100,
    studentEngagementPercent: current.metrics.studentEngagementPercent - previous.metrics.studentEngagementPercent,
    wau: current.behaviorChange.wau - previous.behaviorChange.wau,
    verifiedActionsPerStudentWeek: Math.round((current.behaviorChange.verifiedActionsPerStudentWeek - previous.behaviorChange.verifiedActionsPerStudentWeek) * 100) / 100,
    sevenDayRetention: current.behaviorChange.sevenDayRetention - previous.behaviorChange.sevenDayRetention,
    thirtyDayRetention: current.behaviorChange.thirtyDayRetention - previous.behaviorChange.thirtyDayRetention,
    streakContinuityRate: current.behaviorChange.streakContinuityRate - previous.behaviorChange.streakContinuityRate,
  };

  return {
    current,
    previous,
    deltas
  };
}

module.exports = {
  getMetricsSummary,
};
