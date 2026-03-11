const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const School = require('../models/School');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/async');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const { calculateImpact } = require('../utils/impactCalculator');
const fs = require('fs');
const path = require('path');

/**
 * Generate Principal Report PDF
 * POST /api/v1/reports/principal/generate-pdf
 * Auth: SCHOOL_ADMIN only
 * Returns: PDF file download
 */
exports.generatePrincipalReportPDF = asyncHandler(async (req, res) => {
  const schoolId = req.user.profile?.school;
  const { month, year } = req.body;

  if (!schoolId) {
    return res.status(400).json({
      success: false,
      message: 'School ID required'
    });
  }

  // Validate month/year
  const reportMonth = month || new Date().getMonth() + 1;
  const reportYear = year || new Date().getFullYear();

  if (reportMonth < 1 || reportMonth > 12) {
    return res.status(400).json({
      success: false,
      message: 'Invalid month (1-12)'
    });
  }

  // Query submissions for the month
  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

  const submissions = await ActivitySubmission.find({
    school: schoolId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'approved'
  }).lean();

  // Get school info
  const school = await School.findById(schoolId)
    .select('name udiseCode principalName email contact.phone')
    .lean();

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found'
    });
  }

  // Get teacher count
  const teacherCount = await User.countDocuments({
    role: 'teacher',
    'profile.school': schoolId
  });

  // Get active student count
  const studentCount = await User.countDocuments({
    role: 'student',
    'profile.school': schoolId,
    isActive: true
  });

  // Calculate aggregate impact
  let totalImpact = {
    treesPlanted: 0,
    co2Prevented: 0,
    waterSaved: 0,
    plasticReduced: 0,
    energySaved: 0
  };

  submissions.forEach(submission => {
    const impact = calculateImpact(submission.activityType, {});
    totalImpact.treesPlanted += impact.treesPlanted || 0;
    totalImpact.co2Prevented += impact.co2Prevented || 0;
    totalImpact.waterSaved += impact.waterSaved || 0;
    totalImpact.plasticReduced += impact.plasticReduced || 0;
    totalImpact.energySaved += impact.energySaved || 0;
  });

  // Activity breakdown by type
  const activityBreakdown = {};
  submissions.forEach(submission => {
    activityBreakdown[submission.activityType] =
      (activityBreakdown[submission.activityType] || 0) + 1;
  });

  // Get top performers (students)
  const topStudents = await ActivitySubmission.aggregate([
    {
      $match: {
        school: schoolId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$user',
        submissionCount: { $sum: 1 }
      }
    },
    { $sort: { submissionCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userData'
      }
    }
  ]);

  // NEP Compliance Score (simulated - based on activity diversity)
  const nepScore = Math.min(95, 70 + (Object.keys(activityBreakdown).length * 5));

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();

  let y = height - 50;

  // Header: School Letterhead
  page.drawText(`${school.name} - Environmental Engagement Report`, {
    x: 50,
    y,
    size: 20,
    color: rgb(0.1, 0.5, 0.2),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 30;
  page.drawText(`UDISE Code: ${school.udiseCode || 'N/A'}`, {
    x: 50,
    y,
    size: 10,
    color: rgb(0.3, 0.3, 0.3)
  });

  y -= 15;
  page.drawText(`Principal: ${school.principalName || 'N/A'} | Email: ${school.email || 'N/A'}`, {
    x: 50,
    y,
    size: 9,
    color: rgb(0.3, 0.3, 0.3)
  });

  y -= 20;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 562, y },
    thickness: 2,
    color: rgb(0.1, 0.5, 0.2)
  });

  y -= 25;

  // Report Period
  const monthName = new Date(reportYear, reportMonth - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  page.drawText(`Report Period: ${monthName}`, {
    x: 50,
    y,
    size: 12,
    color: rgb(0, 0, 0),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 30;

  // Key Metrics Section
  page.drawText('KEY METRICS', {
    x: 50,
    y,
    size: 11,
    color: rgb(0.1, 0.5, 0.2),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 20;

  const metrics = [
    { label: 'Total Activities Documented', value: submissions.length.toString() },
    { label: 'Teachers Engaged', value: teacherCount.toString() },
    { label: 'Students Active', value: studentCount.toString() },
    { label: 'NEP Compliance Score', value: `${nepScore}/100` }
  ];

  metrics.forEach(metric => {
    page.drawText(`${metric.label}: ${metric.value}`, {
      x: 70,
      y,
      size: 10,
      color: rgb(0, 0, 0)
    });
    y -= 18;
  });

  y -= 10;

  // Environmental Impact Section
  page.drawText('ENVIRONMENTAL IMPACT', {
    x: 50,
    y,
    size: 11,
    color: rgb(0.1, 0.5, 0.2),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 20;

  const impacts = [
    { label: '🌱 Trees Planted', value: totalImpact.treesPlanted },
    { label: '💨 CO2 Prevented (kg)', value: totalImpact.co2Prevented.toFixed(1) },
    { label: '💧 Water Saved (liters)', value: totalImpact.waterSaved.toFixed(1) },
    { label: '♻️ Plastic Reduced (kg)', value: totalImpact.plasticReduced.toFixed(1) },
    { label: '⚡ Energy Saved (kWh)', value: totalImpact.energySaved.toFixed(1) }
  ];

  impacts.forEach(impact => {
    page.drawText(`${impact.label}: ${impact.value}`, {
      x: 70,
      y,
      size: 10,
      color: rgb(0, 0, 0)
    });
    y -= 18;
  });

  y -= 10;

  // Activity Breakdown
  page.drawText('ACTIVITY BREAKDOWN', {
    x: 50,
    y,
    size: 11,
    color: rgb(0.1, 0.5, 0.2),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 20;

  Object.entries(activityBreakdown).forEach(([activity, count]) => {
    const displayName = activity.replace(/-/g, ' ').toUpperCase();
    page.drawText(`${displayName}: ${count} submissions`, {
      x: 70,
      y,
      size: 9,
      color: rgb(0, 0, 0)
    });
    y -= 15;

    if (y < 100) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
  });

  y -= 10;

  // Top Performers
  if (topStudents.length > 0) {
    page.drawText('TOP PERFORMERS', {
      x: 50,
      y,
      size: 11,
      color: rgb(0.1, 0.5, 0.2),
      font: await pdfDoc.embedFont('Helvetica-Bold')
    });

    y -= 20;

    topStudents.slice(0, 5).forEach((student, idx) => {
      const studentName = student.userData[0]?.name || 'Unknown Student';
      page.drawText(`${idx + 1}. ${studentName} - ${student.submissionCount} activities`, {
        x: 70,
        y,
        size: 9,
        color: rgb(0, 0, 0)
      });
      y -= 15;
    });
  }

  y -= 20;

  // Recommendations Section
  page.drawText('RECOMMENDATIONS FOR IMPROVEMENT', {
    x: 50,
    y,
    size: 11,
    color: rgb(0.1, 0.5, 0.2),
    font: await pdfDoc.embedFont('Helvetica-Bold')
  });

  y -= 20;

  const recommendations = [];
  if (submissions.length < studentCount * 0.5) {
    recommendations.push('Increase student participation by 20% - conduct awareness assemblies');
  }
  if (Object.keys(activityBreakdown).length < 5) {
    recommendations.push('Diversify activities - introduce tree planting and waste audits');
  }
  if (nepScore < 80) {
    recommendations.push('Strengthen NEP integration - include competency-based assessments');
  }

  recommendations.forEach((rec, idx) => {
    page.drawText(`${idx + 1}. ${rec}`, {
      x: 70,
      y,
      size: 9,
      color: rgb(0, 0, 0)
    });
    y -= 15;
  });

  // Footer
  page.drawText(
    `Report Generated: ${new Date().toLocaleDateString('en-IN')} | EcoKids India Platform v1.0`,
    {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    }
  );

  // Convert PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Log audit event
  await AuditLog.create({
    action: 'PRINCIPAL_REPORT_GENERATED',
    actor: req.user.id,
    target: schoolId,
    metadata: {
      month: reportMonth,
      year: reportYear,
      submissionCount: submissions.length,
      nepScore
    },
    ip: req.ip
  }).catch(() => {});

  // Send PDF as file download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="report_${school.udiseCode}_${reportYear}-${String(reportMonth).padStart(2, '0')}.pdf"`
  );
  res.setHeader('Content-Length', pdfBytes.length);

  res.send(Buffer.from(pdfBytes));
});

/**
 * Get Principal Report Summary (for dashboard)
 * GET /api/v1/reports/principal/summary
 * Returns: JSON with key statistics
 */
exports.getPrincipalReportSummary = asyncHandler(async (req, res) => {
  const schoolId = req.user.profile?.school;
  const { month, year } = req.query;

  if (!schoolId) {
    return res.status(400).json({
      success: false,
      message: 'School ID required'
    });
  }

  const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const reportYear = year ? parseInt(year) : new Date().getFullYear();

  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

  const submissions = await ActivitySubmission.find({
    school: schoolId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'approved'
  }).lean();

  const school = await School.findById(schoolId)
    .select('name udiseCode principalName')
    .lean();

  const studentCount = await User.countDocuments({
    role: 'student',
    'profile.school': schoolId,
    isActive: true
  });

  const teacherCount = await User.countDocuments({
    role: 'teacher',
    'profile.school': schoolId
  });

  // Aggregate impact
  let totalImpact = {
    treesPlanted: 0,
    co2Prevented: 0,
    waterSaved: 0,
    plasticReduced: 0,
    energySaved: 0
  };

  submissions.forEach(submission => {
    const impact = calculateImpact(submission.activityType, {});
    totalImpact.treesPlanted += impact.treesPlanted || 0;
    totalImpact.co2Prevented += impact.co2Prevented || 0;
    totalImpact.waterSaved += impact.waterSaved || 0;
    totalImpact.plasticReduced += impact.plasticReduced || 0;
    totalImpact.energySaved += impact.energySaved || 0;
  });

  // Activity breakdown
  const activityBreakdown = {};
  submissions.forEach(submission => {
    activityBreakdown[submission.activityType] =
      (activityBreakdown[submission.activityType] || 0) + 1;
  });

  // NEP Score
  const nepScore = Math.min(95, 70 + (Object.keys(activityBreakdown).length * 5));

  // Participation rate
  const participationRate = studentCount > 0
    ? Math.round((submissions.length / (studentCount * 4)) * 100) // Assume 4 activities/student/month ideal
    : 0;

  res.status(200).json({
    success: true,
    data: {
      schoolId,
      schoolName: school?.name,
      udiseCode: school?.udiseCode,
      period: {
        month: reportMonth,
        year: reportYear,
        monthName: new Date(reportYear, reportMonth - 1).toLocaleString('en-US', {
          month: 'long'
        })
      },
      metrics: {
        totalActivities: submissions.length,
        activeStudents: studentCount,
        engagedTeachers: teacherCount,
        participationRate: `${participationRate}%`,
        nepComplianceScore: nepScore
      },
      environmentalImpact: totalImpact,
      activityBreakdown,
      monthOnMonthGrowth: 0 // Can be calculated with historical data
    }
  });
});

/**
 * Export Report as CSV
 * GET /api/v1/reports/principal/export-csv
 * Returns: CSV file with detailed submission data
 */
exports.exportReportAsCSV = asyncHandler(async (req, res) => {
  const schoolId = req.user.profile?.school;
  const { month, year } = req.query;

  if (!schoolId) {
    return res.status(400).json({
      success: false,
      message: 'School ID required'
    });
  }

  const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const reportYear = year ? parseInt(year) : new Date().getFullYear();

  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

  const submissions = await ActivitySubmission.find({
    school: schoolId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'approved'
  }).populate('user', 'name email roll');

  const school = await School.findById(schoolId)
    .select('udiseCode name')
    .lean();

  if (!submissions.length) {
    return res.status(400).json({
      success: false,
      message: 'No submissions found for this period'
    });
  }

  // Generate CSV
  const headers = [
    'Serial No.',
    'Student Name',
    'Roll Number',
    'Activity Type',
    'Description',
    'Submission Date',
    'Status',
    'Trees Planted',
    'CO2 Prevented (kg)',
    'Water Saved (L)',
    'Plastic Reduced (kg)'
  ];

  let csv = headers.join(',') + '\n';

  submissions.forEach((submission, idx) => {
    const impact = calculateImpact(submission.activityType, {});
    const row = [
      (idx + 1).toString(),
      `"${submission.user?.name || 'Unknown'}"`,
      submission.user?.roll || 'N/A',
      submission.activityType.replace(/-/g, ' '),
      `"${(submission.evidence?.description || '').replace(/"/g, '""')}"`,
      new Date(submission.createdAt).toLocaleDateString('en-IN'),
      submission.status,
      impact.treesPlanted || 0,
      (impact.co2Prevented || 0).toFixed(2),
      (impact.waterSaved || 0).toFixed(2),
      (impact.plasticReduced || 0).toFixed(2)
    ];
    csv += row.join(',') + '\n';
  });

  // Log audit event
  await AuditLog.create({
    action: 'PRINCIPAL_REPORT_EXPORTED',
    actor: req.user.id,
    target: schoolId,
    metadata: {
      month: reportMonth,
      year: reportYear,
      format: 'CSV'
    },
    ip: req.ip
  }).catch(() => {});

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="submissions_${school?.udiseCode}_${reportYear}-${String(reportMonth).padStart(2, '0')}.csv"`
  );

  res.send(csv);
});
