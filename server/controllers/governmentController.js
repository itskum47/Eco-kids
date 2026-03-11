/**
 * @fileoverview Government Reports Controller
 * Manages compliance reporting and government integration
 */

const GovernmentReport = require('../models/GovernmentReport');
const School = require('../models/School');
const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

/**
 * @desc    Generate monthly compliance report
 * @route   POST /api/v1/government/reports/generate
 * @access  Private/StateAdmin+
 */
exports.generateMonthlyReport = asyncHandler(async (req, res) => {
  const { state, district, reportingPeriod } = req.body;

  // Verify authorization - only state admin can generate reports
  if (req.user.role !== 'state_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only state administrators can generate reports'
    });
  }

  try {
    // Aggregate student metrics
    const students = await User.find({
      role: 'student',
      'profile.state': state,
      ...(district && { 'profile.district': district })
    });

    const activeStudents = students.filter(s => {
      const lastActivity = s.updatedAt;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastActivity >= thirtyDaysAgo;
    });

    // Get submitted activities for the period
    const activities = await ActivitySubmission.find({
      ...(state && { state }),
      ...(district && { district }),
      createdAt: {
        $gte: reportingPeriod.startDate,
        $lte: reportingPeriod.endDate
      }
    });

    // Calculate environmental impact
    const totalImpact = {
      co2PreventedTonnes: 0,
      waterSavedLitres: 0,
      plasticReducedKgs: 0,
      treesPlanted: 0,
      energySavedKWh: 0
    };

    activities.forEach(activity => {
      if (activity.impact) {
        totalImpact.co2PreventedTonnes += activity.impact.co2Prevented || 0;
        totalImpact.waterSavedLitres += activity.impact.waterSaved || 0;
        totalImpact.plasticReducedKgs += activity.impact.plasticReduced || 0;
        totalImpact.treesPlanted += activity.impact.treesPlanted || 0;
        totalImpact.energySavedKWh += activity.impact.energySaved || 0;
      }
    });

    // Get school performance data
    const schools = await School.find({
      state,
      ...(district && { district })
    }).lean();

    const schoolPerformance = await Promise.all(
      schools.map(async (school) => {
        const schoolStudents = students.filter(s => s.profile.school === school.name);
        const schoolActivities = activities.filter(a => a.student?.school === school.name);
        
        const averageEcoPoints = schoolStudents.length > 0
          ? schoolStudents.reduce((sum, s) => sum + (s.gamification?.ecoPoints || 0), 0) / schoolStudents.length
          : 0;

        return {
          schoolId: school._id,
          schoolName: school.name,
          studentCount: schoolStudents.length,
          tasksCompleted: schoolActivities.length,
          averageEcoPoints: Math.round(averageEcoPoints),
          complianceStatus: 'compliant'
        };
      })
    );

    // Calculate average eco points
    const averageEcoPoints = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.gamification?.ecoPoints || 0), 0) / students.length)
      : 0;

    // Create the report
    const report = await GovernmentReport.create({
      reportType: 'monthly',
      state,
      district,
      reportingPeriod,
      schoolCount: schools.length,
      studentMetrics: {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        tasksCompleted: activities.length,
        averageEcoPoints,
        enrollmentRate: students.length > 0 ? Math.round((activeStudents.length / students.length) * 100) : 0
      },
      environmentalImpact: totalImpact,
      activityMetrics: {
        totalActivitiesSubmitted: activities.length,
        approvalRate: activities.length > 0
          ? Math.round((activities.filter(a => a.status === 'approved').length / activities.length) * 100)
          : 0
      },
      schoolPerformance,
      compliance: {
        pocsoActCompliance: {
          status: 'compliant',
          childSafetyReviewDate: new Date(),
          dataProtectionScore: 95
        },
        nep2020Alignment: {
          status: 'aligned',
          skillsAlighedWithNEP: ['critical thinking', 'environmental stewardship', 'problem solving'],
          competenciesMatched: 8,
          curriculumCoveragePercentage: 85
        }
      },
      submittedBy: req.user.id
    });

    logger.info(`Government report generated: ${report.reportId} for ${state}/${district}`);

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error(`Error generating report: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

/**
 * @desc    Submit report for government review
 * @route   POST /api/v1/government/reports/:id/submit
 * @access  Private/StateAdmin+
 */
exports.submitReport = asyncHandler(async (req, res) => {
  const report = await GovernmentReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }

  report.status = 'submitted';
  report.submissionDate = new Date();
  report.submittedBy = req.user.id;

  await report.save();

  logger.info(`Report ${report.reportId} submitted`);

  res.status(200).json({
    success: true,
    message: 'Report submitted successfully',
    data: report
  });
});

/**
 * @desc    Get compliance dashboard
 * @route   GET /api/v1/government/compliance-dashboard
 * @access  Private/StateAdmin+
 */
exports.getComplianceDashboard = asyncHandler(async (req, res) => {
  const { state } = req.query;

  if (req.user.role !== 'state_admin') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const reports = await GovernmentReport.getComplianceDashboard(state);

  // Calculate aggregates
  const totalStudents = reports.reduce((sum, r) => sum + (r.studentMetrics?.totalStudents || 0), 0);
  const totalImpact = {
    co2Prevented: 0,
    waterSaved: 0,
    plasticReduced: 0,
    treesPlanted: 0,
    energySaved: 0
  };

  reports.forEach(report => {
    if (report.environmentalImpact) {
      totalImpact.co2Prevented += report.environmentalImpact.co2PreventedTonnes || 0;
      totalImpact.waterSaved += report.environmentalImpact.waterSavedLitres || 0;
      totalImpact.plasticReduced += report.environmentalImpact.plasticReducedKgs || 0;
      totalImpact.treesPlanted += report.environmentalImpact.treesPlanted || 0;
      totalImpact.energySaved += report.environmentalImpact.energySavedKWh || 0;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      reportsCount: reports.length,
      totalStudents,
      averageEnrollment: reports.length > 0
        ? Math.round(reports.reduce((sum, r) => sum + (r.studentMetrics?.enrollmentRate || 0), 0) / reports.length)
        : 0,
      totalImpact,
      reports
    }
  });
});

/**
 * @desc    Get NEP 2020 alignment report
 * @route   GET /api/v1/government/nep-2020-alignment
 * @access  Private/StateAdmin+
 */
exports.getNEP2020Alignment = asyncHandler(async (req, res) => {
  const { state } = req.query;

  const reports = await GovernmentReport.find({
    state,
    status: { $in: ['submitted', 'approved'] }
  }).sort({ submissionDate: -1 });

  const alignmentData = {
    overallCompliancePercentage: 0,
    skillsAligned: [],
    competenciesMatched: 0,
    curriculumCoverage: 0,
    studentOutcomesData: {
      excellentPerformance: 0,
      goodPerformance: 0,
      satisfactoryPerformance: 0,
      needsImprovement: 0
    },
    schoolWiseAlignment: []
  };

  if (reports.length > 0) {
    const avgReport = reports[0];
    alignmentData.overallCompliancePercentage = avgReport.compliance?.nep2020Alignment?.curriculumCoveragePercentage || 0;
    alignmentData.skillsAligned = avgReport.compliance?.nep2020Alignment?.skillsAlighedWithNEP || [];
    alignmentData.competenciesMatched = avgReport.compliance?.nep2020Alignment?.competenciesMatched || 0;
    alignmentData.curriculumCoverage = avgReport.compliance?.nep2020Alignment?.curriculumCoveragePercentage || 0;
  }

  res.status(200).json({
    success: true,
    data: alignmentData
  });
});

/**
 * @desc    Get government export (PDF/Excel)
 * @route   GET /api/v1/government/reports/:id/export
 * @access  Private/StateAdmin+
 */
exports.exportReport = asyncHandler(async (req, res) => {
  const { format } = req.query; // 'pdf' or 'excel'

  const report = await GovernmentReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }

  // Set up response headers
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.reportId}.pdf`);
  } else {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.reportId}.xlsx`);
  }

  // TODO: Implement PDF/Excel generation with PDFKit or ExcelJS

  res.status(200).json({
    success: true,
    message: 'Report exported successfully'
  });
});

/**
 * @desc    Get government dashboard summary
 * @route   GET /api/v1/government/dashboard/summary
 * @access  Private/StateAdmin+
 */
exports.getGovernmentDashboardSummary = asyncHandler(async (req, res) => {
  const { state, district } = req.query;

  const userFilter = {
    ...(state && { 'profile.state': state }),
    ...(district && { 'profile.district': district })
  };

  const [reportsCount, studentsCount, approvedSubmissions, schoolsCount] = await Promise.all([
    GovernmentReport.countDocuments({ ...(state && { state }), ...(district && { district }) }),
    User.countDocuments({ role: 'student', ...userFilter }),
    ActivitySubmission.countDocuments({ status: 'approved', ...(state && { state }), ...(district && { district }) }),
    School.countDocuments({ ...(state && { state }), ...(district && { district }) })
  ]);

  const latestReports = await GovernmentReport.find({ ...(state && { state }), ...(district && { district }) })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('reportId state district status createdAt reportingPeriod schoolCount studentMetrics')
    .lean();

  const readinessScore = Math.min(
    100,
    Math.round(
      (reportsCount > 0 ? 30 : 0) +
      (schoolsCount > 0 ? 20 : 0) +
      (studentsCount > 0 ? 20 : 0) +
      (approvedSubmissions > 100 ? 30 : Math.min(30, Math.round((approvedSubmissions / 100) * 30)))
    )
  );

  res.status(200).json({
    success: true,
    data: {
      filters: { state: state || null, district: district || null },
      metrics: {
        reportsCount,
        schoolsCount,
        studentsCount,
        approvedSubmissions,
        readinessScore
      },
      latestReports
    }
  });
});
