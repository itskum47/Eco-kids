const mongoose = require('mongoose');
const EngagementEvent = require('../models/EngagementEvent');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');

function buildDateFilter(from, to) {
  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);
  return dateFilter;
}

async function getEngagementFunnel(from, to) {
  return EngagementEvent.getFunnelMetrics(from, to);
}

async function getEnvironmentalImpactReport({ from, to }) {
  const dateFilter = buildDateFilter(from, to);
  const matchStage = { status: 'approved' };
  if (from || to) matchStage.createdAt = dateFilter;

  return ActivitySubmission.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { school: '$school', activityType: '$activityType' },
        count: { $sum: 1 },
        uniqueStudents: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        school: '$_id.school',
        activityType: '$_id.activityType',
        submissions: '$count',
        uniqueStudents: { $size: '$uniqueStudents' },
        _id: 0
      }
    },
    { $sort: { school: 1, activityType: 1 } }
  ]);
}

async function getUserEngagementReport() {
  return User.aggregate([
    { $match: { role: 'student', isActive: true } },
    {
      $group: {
        _id: '$profile.school',
        totalStudents: { $sum: 1 },
        avgEcoPoints: { $avg: '$gamification.ecoPointsTotal' },
        avgStreak: { $avg: '$gamification.streakDays' },
        totalTreesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        totalCo2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

async function getSchoolReportRows({ schoolId }) {
  const schoolFilter = mongoose.Types.ObjectId.isValid(schoolId)
    ? {
        $or: [
          { 'profile.schoolId': new mongoose.Types.ObjectId(schoolId) },
          { 'profile.school': schoolId }
        ]
      }
    : { 'profile.school': schoolId };

  const students = await User.find({ role: 'student', ...schoolFilter })
    .select('name gamification lastLogin updatedAt')
    .lean();

  const studentIds = students.map((student) => student._id);

  const submissionStats = await ActivitySubmission.aggregate([
    {
      $match: {
        user: { $in: studentIds },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$user',
        activitiesCompleted: { $sum: 1 },
        lastSubmissionAt: { $max: '$createdAt' }
      }
    }
  ]);

  const statsByUserId = submissionStats.reduce((acc, row) => {
    acc[row._id.toString()] = row;
    return acc;
  }, {});

  return students.map((student) => {
    const stat = statsByUserId[student._id.toString()] || {};
    const lastActiveCandidates = [stat.lastSubmissionAt, student.lastLogin, student.updatedAt].filter(Boolean);
    const lastActive = lastActiveCandidates.length
      ? new Date(Math.max(...lastActiveCandidates.map((date) => new Date(date).getTime()))).toISOString()
      : '';

    return {
      studentName: student.name || 'Unknown',
      totalPoints: student.gamification?.ecoPoints || 0,
      activitiesCompleted: stat.activitiesCompleted || 0,
      badgesEarned: student.gamification?.badges?.length || 0,
      lastActive
    };
  });
}

async function getNGOImpactSummary({ from, to, schoolId }) {
  const dateFilter = buildDateFilter(from, to);
  const schoolFilter = schoolId && mongoose.Types.ObjectId.isValid(schoolId)
    ? { school: mongoose.Types.ObjectId(schoolId) }
    : {};

  const totalStudents = await User.countDocuments({
    role: 'student',
    isActive: true,
    deletedAt: { $eq: null },
    ...schoolFilter
  });

  const activityStats = await ActivitySubmission.aggregate([
    {
      $match: {
        status: 'approved',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        ...(schoolFilter.school ? { school: schoolFilter.school } : {})
      }
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        uniqueStudents: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        activityType: '$_id',
        submissionsCount: '$count',
        uniqueStudents: { $size: '$uniqueStudents' },
        _id: 0
      }
    },
    { $sort: { submissionsCount: -1 } }
  ]);

  const totalActivities = activityStats.reduce((sum, stat) => sum + stat.submissionsCount, 0);

  const topSchools = await ActivitySubmission.aggregate([
    {
      $match: {
        status: 'approved',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }
    },
    {
      $group: {
        _id: '$school',
        submissionsCount: { $sum: 1 },
        uniqueStudents: { $addToSet: '$user' }
      }
    },
    {
      $lookup: {
        from: 'schools',
        localField: '_id',
        foreignField: '_id',
        as: 'schoolData'
      }
    },
    {
      $project: {
        schoolId: '$_id',
        schoolName: { $arrayElemAt: ['$schoolData.name', 0] },
        submissionsCount: 1,
        uniqueStudents: { $size: '$uniqueStudents' },
        _id: 0
      }
    },
    { $sort: { submissionsCount: -1 } },
    { $limit: 10 }
  ]);

  const sdgImpactMap = {
    'tree-planting': [13, 15],
    'plastic-reduction': [12],
    'water-saving': [6],
    'energy-saving': [7, 13],
    'waste-recycling': [12],
    'biodiversity-survey': [15],
    composting: [12, 15]
  };

  const sdgImpact = {};
  activityStats.forEach((stat) => {
    const goals = sdgImpactMap[stat.activityType] || [];
    goals.forEach((goal) => {
      if (!sdgImpact[goal]) {
        sdgImpact[goal] = 0;
      }
      sdgImpact[goal] += stat.submissionsCount;
    });
  });

  return {
    totalStudents,
    totalActivities,
    activityStats,
    topSchools,
    sdgImpact,
    period: { from: from || 'all-time', to: to || 'now' }
  };
}

async function getDistrictImpactSummary({ state, district }) {
  const impactAgg = await User.aggregate([
    { $match: { role: 'student', 'profile.state': state, 'profile.district': district } },
    {
      $group: {
        _id: null,
        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        energySaved: { $sum: '$environmentalImpact.energySaved' },
        totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' }
      }
    }
  ]);

  const data = impactAgg.length > 0 ? impactAgg[0] : {
    co2Prevented: 0,
    treesPlanted: 0,
    waterSaved: 0,
    plasticReduced: 0,
    energySaved: 0,
    totalActivities: 0
  };

  delete data._id;
  return data;
}

async function getDistrictVeiAsm({ state, district, thirtyDaysAgo }) {
  const veiAgg = await User.aggregate([
    { $match: { role: 'student', 'profile.state': state, 'profile.district': district } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        co2: { $sum: '$environmentalImpact.co2Prevented' },
        trees: { $sum: '$environmentalImpact.treesPlanted' },
        water: { $sum: '$environmentalImpact.waterSaved' },
        plastic: { $sum: '$environmentalImpact.plasticReduced' },
        energy: { $sum: '$environmentalImpact.energySaved' },
        activities: { $sum: '$environmentalImpact.activitiesCompleted' },
        totalEP: { $sum: '$gamification.ecoPoints' }
      }
    }
  ]);

  const activeStudentIds = await ActivitySubmission.distinct('user', {
    status: 'approved',
    verifiedAt: { $gte: thirtyDaysAgo }
  });

  const activeInDistrict = await User.countDocuments({
    _id: { $in: activeStudentIds },
    role: 'student',
    'profile.state': state,
    'profile.district': district
  });

  const veiData = veiAgg.length > 0 ? veiAgg[0] : {
    totalStudents: 0,
    co2: 0,
    trees: 0,
    water: 0,
    plastic: 0,
    energy: 0,
    activities: 0,
    totalEP: 0
  };

  const veiScore = (veiData.co2 * 10) + (veiData.trees * 5) + (veiData.water * 2) + (veiData.plastic * 3) + (veiData.energy * 2);
  const asm = activeInDistrict;
  const veiPerAsm = asm > 0 ? Math.round((veiScore / asm) * 100) / 100 : 0;

  return {
    veiScore,
    activeStudentsMonthly: asm,
    veiPerAsm,
    totalStudents: veiData.totalStudents,
    totalEcoPoints: veiData.totalEP,
    totalActivities: veiData.activities,
    breakdown: {
      co2Prevented: veiData.co2,
      treesPlanted: veiData.trees,
      waterSaved: veiData.water,
      plasticReduced: veiData.plastic,
      energySaved: veiData.energy
    },
    calculatedAt: new Date().toISOString()
  };
}

module.exports = {
  getEngagementFunnel,
  getEnvironmentalImpactReport,
  getUserEngagementReport,
  getSchoolReportRows,
  getNGOImpactSummary,
  getDistrictImpactSummary,
  getDistrictVeiAsm
};
