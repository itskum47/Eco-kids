const ParentReport = require('../models/ParentReport');
const User = require('../models/User');
const Activity = require('../models/ActivitySubmission');
const Gamification = require('../models/Gamification');
const Habit = require('../models/Habit');
const InterSchoolChallenge = require('../models/InterSchoolChallenge');
const School = require('../models/School');
const logger = require('../utils/logger');

// Generate Parent Report for a student
exports.generateParentReport = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parentId = req.user.id;
    const schoolId = req.user.schoolId;

    // Verify parent-student relationship
    const student = await User.findById(studentId);
    if (!student || (student.parentId && !student.parentId.equals(parentId))) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }

    // Fetch student data
    const activities = await Activity.find({ studentId, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(100);

    const gamification = await Gamification.findOne({ userId: studentId });
    const habits = await Habit.find({ userId: studentId, isActive: true });
    const challenges = await InterSchoolChallenge.find({ 'participants.studentId': studentId });

    // Calculate activity metrics
    const totalApproved = activities.length;
    const totalSubmitted = await Activity.countDocuments({ studentId });
    const approvalRate = totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;

    // Activity distribution
    const activityDistribution = {
      treesCounted: activities.filter(a => a.activityType === 'tree-planting').length,
      wasteSegratedKg: activities.filter(a => a.activityType === 'waste-segregation').reduce((sum, a) => sum + (a.metaData?.quantity || 0), 0),
      waterSavedLitres: activities.filter(a => a.activityType === 'water-conservation').reduce((sum, a) => sum + (a.metaData?.quantity || 0), 0),
      communityServiceHours: activities.filter(a => a.activityType === 'community-service').reduce((sum, a) => sum + (a.metaData?.hours || 0), 0),
      plasticReducedKg: activities.filter(a => a.activityType === 'plastic-reduction').reduce((sum, a) => sum + (a.metaData?.quantity || 0), 0),
    };

    // Habit metrics
    const activeHabits = habits.filter(h => h.isActive).length;
    const completedHabitsThisPeriod = habits.reduce((sum, h) => {
      const thisMonthCompletions = h.completedDates.filter(date => {
        const d = new Date(date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      return sum + thisMonthCompletions;
    }, 0);

    const habitsByCategory = {
      energy: { active: habits.filter(h => h.category === 'energy').length, completionRate: 0 },
      water: { active: habits.filter(h => h.category === 'water').length, completionRate: 0 },
      waste: { active: habits.filter(h => h.category === 'waste').length, completionRate: 0 },
      transportation: { active: habits.filter(h => h.category === 'transportation').length, completionRate: 0 },
      food: { active: habits.filter(h => h.category === 'food').length, completionRate: 0 },
    };

    // Calculate habit completion rates
    Object.keys(habitsByCategory).forEach(category => {
      const categoryHabits = habits.filter(h => h.category === category);
      if (categoryHabits.length > 0) {
        const avgCompletion = categoryHabits.reduce((sum, h) => sum + h.currentStreak, 0) / categoryHabits.length;
        habitsByCategory[category].completionRate = Math.round(avgCompletion);
      }
    });

    // Challenge metrics
    const studentChallenges = challenges.filter(c => c.participants.some(p => p.studentId.equals(studentId)));
    const completedChallenges = studentChallenges.filter(c => c.status === 'completed').length;

    // Learning metrics
    const lessonsCompleted = student.lessonsCompleted || 0;
    const quizzesAttempted = student.quizzesAttempted || 0;
    const assessmentScore = student.assessmentScore || 0;

    // Environmental impact
    const co2Prevented = activities.reduce((sum, a) => sum + (a.metaData?.co2Prevented || 0), 0);
    const waterSaved = activityDistribution.waterSavedLitres;
    const plasticReduced = activityDistribution.plasticReducedKg;
    const treesPlanted = activityDistribution.treesCounted;
    const energySaved = activities.reduce((sum, a) => sum + (a.metaData?.energySaved || 0), 0);

    // School comparison
    const allStudents = await User.find({ schoolId, role: 'student' });
    const studentIndex = allStudents.findIndex(s => s._id.equals(studentId));
    const studentRankInSchool = studentIndex + 1;

    // Create report
    const report = new ParentReport({
      parentId,
      studentId,
      schoolId,
      reportPeriod: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        periodType: 'monthly',
      },
      activityMetrics: {
        totalActivitiesSubmitted: totalSubmitted,
        activitiesApproved: totalApproved,
        approvalRate,
        topActivityType: activities[0]?.activityType || 'none',
        activityDistribution,
      },
      gamificationMetrics: {
        totalEcoPoints: gamification?.ecoPoints || 0,
        pointsThisPeriod: gamification?.ecoPoints || 0,
        currentLevel: gamification?.level || 1,
        badgesEarned: gamification?.badges || [],
        currentStreak: gamification?.currentStreak || 0,
        longestStreak: gamification?.longestStreak || 0,
      },
      habitMetrics: {
        activeHabits,
        habitCompletionRate: activeHabits > 0 ? Math.round((completedHabitsThisPeriod / (activeHabits * 30)) * 100) : 0,
        habits: habits.map(h => ({
          habitId: h._id,
          habitName: h.name,
          category: h.category,
          currentStreak: h.currentStreak,
          longestStreak: h.longestStreak,
          completionsThisPeriod: completedHabitsThisPeriod,
          status: 'active',
        })),
        habitsByCategory,
      },
      challengeMetrics: {
        challengesParticipated: studentChallenges.length,
        challengesCompleted: completedChallenges,
        challengeCompletionRate: studentChallenges.length > 0 ? Math.round((completedChallenges / studentChallenges.length) * 100) : 0,
      },
      environmentalImpact: {
        co2PreventedKg: co2Prevented,
        waterSavedLitres: waterSaved,
        plasticReducedKg: plasticReduced,
        treesContributed: treesPlanted,
        energySavedKWh: energySaved,
      },
      learningMetrics: {
        lessonsCompleted,
        quizzesAttempted,
        assessmentScore,
      },
      schoolComparison: {
        studentRankInSchool,
        performanceTrend: 'stable',
      },
    });

    // Generate recommendations
    report.generateRecommendations();
    report.parentInsights.overallPerformance = report.calculateOverallPerformance();

    await report.save();

    logger.info(`Parent report generated: ${report.reportId} for student ${studentId}`);

    res.status(201).json({
      success: true,
      message: 'Parent report generated successfully',
      report,
    });
  } catch (error) {
    logger.error('Error generating parent report', error);
    res.status(500).json({ error: 'Failed to generate parent report' });
  }
};

// Get parent reports for logged-in parent
exports.getMyReports = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId, status, periodType } = req.query;

    const filter = { parentId };
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (periodType) filter['reportPeriod.periodType'] = periodType;

    const reports = await ParentReport.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('schoolId', 'schoolName')
      .sort({ 'metadata.createdAt': -1 })
      .limit(50);

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    logger.error('Error fetching parent reports', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get single parent report
exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const parentId = req.user.id;

    const report = await ParentReport.findOne({ reportId, parentId })
      .populate('studentId', 'firstName lastName email')
      .populate('schoolId', 'schoolName')
      .populate('schoolContactInfo.classTeacherId', 'firstName lastName email phone');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Mark as read
    report.markAsRead();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error('Error fetching report', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

// Acknowledge parent report
exports.acknowledgeReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { comments, sharedWithStudent, sharedWithTeacher } = req.body;
    const parentId = req.user.id;

    const report = await ParentReport.findOne({ reportId, parentId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.acknowledge(parentId, comments);
    report.parentAcknowledgment.sharedWithStudent = sharedWithStudent || false;
    report.parentAcknowledgment.sharedWithTeacher = sharedWithTeacher || false;
    report.status = 'acknowledged';

    await report.save();

    logger.info(`Parent report acknowledged: ${reportId}`);

    res.json({
      success: true,
      message: 'Report acknowledged successfully',
      report,
    });
  } catch (error) {
    logger.error('Error acknowledging report', error);
    res.status(500).json({ error: 'Failed to acknowledge report' });
  }
};

// Get student progress summary for parent (quick view)
exports.getStudentProgressSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user.id;

    const student = await User.findById(studentId);
    if (!student || (student.parentId && !student.parentId.equals(parentId))) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get latest report
    const latestReport = await ParentReport.findOne({ studentId, parentId }).sort({ 'metadata.createdAt': -1 });

    // Get real-time stats
    const gamification = await Gamification.findOne({ userId: studentId });
    const habits = await Habit.find({ userId: studentId, isActive: true });
    const activities = await Activity.find({ studentId, status: 'approved' });

    res.json({
      success: true,
      summary: {
        student: { firstName: student.firstName, lastName: student.lastName },
        ecoPoints: gamification?.ecoPoints || 0,
        level: gamification?.level || 1,
        streak: gamification?.currentStreak || 0,
        habitsActive: habits.filter(h => h.isActive).length,
        activitiesApproved: activities.length,
        lastReportDate: latestReport?.metadata.createdAt,
        latestReport,
      },
    });
  } catch (error) {
    logger.error('Error fetching student progress', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

// Download report as PDF
exports.downloadReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    const parentId = req.user.id;

    const report = await ParentReport.findOne({ reportId, parentId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // TODO: Implement PDF generation using PDFKit or similar
    // For now, return JSON with PDF download URL
    res.json({
      success: true,
      message: 'PDF generation started',
      downloadUrl: `/api/v1/parent-reports/${reportId}/download-pdf`,
    });
  } catch (error) {
    logger.error('Error downloading report', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
};

// Get all parent reports (admin only - for school/district)
exports.getAllParentReports = async (req, res) => {
  try {
    const { schoolId, status, periodType } = req.query;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Check authorization
    if (user.role !== 'state_admin' && user.role !== 'district_admin' && user.role !== 'school_admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const filter = {};
    if (schoolId) filter.schoolId = schoolId;
    if (status) filter.status = status;
    if (periodType) filter['reportPeriod.periodType'] = periodType;

    const reports = await ParentReport.find(filter)
      .populate('parentId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName email')
      .populate('schoolId', 'schoolName')
      .sort({ 'metadata.createdAt': -1 })
      .limit(100);

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    logger.error('Error fetching all parent reports', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get parent report analytics
exports.getReportAnalytics = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.query;

    const reports = await ParentReport.find({ parentId, studentId }).sort({ 'metadata.createdAt': -1 }).limit(12);

    const analytics = {
      totalReports: reports.length,
      acknowledgedReports: reports.filter(r => r.status === 'acknowledged').length,
      averageEcoPoints: reports.reduce((sum, r) => sum + (r.gamificationMetrics.totalEcoPoints || 0), 0) / reports.length || 0,
      averageHabitCompletionRate: reports.reduce((sum, r) => sum + (r.habitMetrics.habitCompletionRate || 0), 0) / reports.length || 0,
      averageChallengeCompletionRate: reports.reduce((sum, r) => sum + (r.challengeMetrics.challengeCompletionRate || 0), 0) / reports.length || 0,
      trends: {
        ecoPointsTrend: reports.length > 1 ? reports[0].gamificationMetrics.totalEcoPoints > reports[reports.length - 1].gamificationMetrics.totalEcoPoints ? 'increasing' : 'decreasing' : 'stable',
        habitTrend: reports.length > 1 ? reports[0].habitMetrics.habitCompletionRate > reports[reports.length - 1].habitMetrics.habitCompletionRate ? 'improving' : 'declining' : 'stable',
      },
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error('Error fetching analytics', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
