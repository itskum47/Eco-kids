const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const asyncHandler = require('../middleware/async');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const AuditLog = require('../models/AuditLog');

/**
 * BOOST-2: NEP 2020 Certificate Generation
 * Generate competency-based certificates aligned with NEP 2020
 */

/**
 * Generate NEP Certificate for Student
 * GET /api/v1/compliance/nep-certificate/:studentId
 */
exports.generateNEPCertificate = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await User.findById(studentId)
    .select('name roll grade section profile environmentalImpact')
    .lean();

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Get student's approved activities
  const activities = await ActivitySubmission.find({
    user: studentId,
    status: 'approved'
  })
    .select('activityType nepCompetencies createdAt')
    .lean();

  // Aggregate competencies
  const competencyMap = {};
  activities.forEach(activity => {
    if (activity.nepCompetencies) {
      activity.nepCompetencies.forEach(comp => {
        competencyMap[comp] = (competencyMap[comp] || 0) + 1;
      });
    }
  });

  const totalCompetencies = Object.keys(competencyMap).length;
  const totalActivities = activities.length;

  // NEP Competency Categories
  const nepCategories = {
    'Critical Thinking': ['problem-solving', 'analysis', 'evaluation'],
    'Environmental Awareness': ['sustainability', 'conservation', 'ecological-understanding'],
    'Scientific Temperament': ['observation', 'experimentation', 'data-collection'],
    'Social Responsibility': ['community-engagement', 'civic-duty', 'leadership'],
    'Practical Application': ['hands-on-learning', 'real-world-application']
  };

  // Map competencies to categories
  const categoryScores = {};
  Object.keys(nepCategories).forEach(category => {
    const categoryComps = nepCategories[category];
    const score = categoryComps.reduce((sum, comp) => sum + (competencyMap[comp] || 0), 0);
    categoryScores[category] = score;
  });

  // Create PDF Certificate
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([792, 612]); // Landscape A4
  const { width, height } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.2, 0.5, 0.3),
    borderWidth: 3
  });

  // Title
  page.drawText('NEP 2020 Environmental Competency Certificate', {
    x: width / 2 - 240,
    y: height - 80,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.4, 0.2)
  });

  // Government Logo Area (text placeholder)
  page.drawText('🇮🇳', {
    x: width / 2 - 15,
    y: height - 120,
    size: 24
  });

  // Student Info
  page.drawText('This is to certify that', {
    x: width / 2 - 80,
    y: height - 160,
    size: 12,
    font: regularFont
  });

  page.drawText(student.name, {
    x: width / 2 - (student.name.length * 6),
    y: height - 190,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0.5)
  });

  page.drawText(`Roll No: ${student.roll || 'N/A'} | Grade: ${student.grade || 'N/A'} | Section: ${student.section || 'N/A'}`, {
    x: width / 2 - 120,
    y: height - 215,
    size: 10,
    font: regularFont
  });

  // Competency Summary
  page.drawText('Has successfully demonstrated the following NEP 2020 competencies', {
    x: width / 2 - 200,
    y: height - 250,
    size: 11,
    font: regularFont
  });

  page.drawText('through active participation in environmental education activities:', {
    x: width / 2 - 200,
    y: height - 265,
    size: 11,
    font: regularFont
  });

  // Competency Categories
  let yPos = height - 300;
  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score > 0) {
      page.drawText(`✓ ${category}: ${score} activities`, {
        x: 100,
        y: yPos,
        size: 10,
        font: regularFont
      });
      yPos -= 20;
    }
  });

  // Statistics
  yPos -= 20;
  page.drawText(`Total Activities Completed: ${totalActivities}`, {
    x: width / 2 - 100,
    y: yPos,
    size: 11,
    font: boldFont
  });

  yPos -= 20;
  page.drawText(`NEP Competencies Demonstrated: ${totalCompetencies}`, {
    x: width / 2 - 120,
    y: yPos,
    size: 11,
    font: boldFont
  });

  // Environmental Impact
  yPos -= 30;
  page.drawText('Environmental Impact:', {
    x: 100,
    y: yPos,
    size: 11,
    font: boldFont
  });

  yPos -= 20;
  page.drawText(`🌱 Trees Planted: ${student.environmentalImpact?.treesPlanted || 0}`, {
    x: 120,
    y: yPos,
    size: 9,
    font: regularFont
  });

  yPos -= 15;
  page.drawText(`♻️ Plastic Reduced: ${(student.environmentalImpact?.plasticReduced || 0).toFixed(2)} kg`, {
    x: 120,
    y: yPos,
    size: 9,
    font: regularFont
  });

  // Signature Area
  page.drawText('Issued on: ' + new Date().toLocaleDateString('en-IN'), {
    x: 100,
    y: 100,
    size: 9,
    font: regularFont
  });

  page.drawText('_______________________', {
    x: width - 250,
    y: 100,
    size: 10,
    font: regularFont
  });

  page.drawText('School Principal / Head', {
    x: width - 250,
    y: 85,
    size: 9,
    font: regularFont
  });

  // Footer
  page.drawText('EcoKids India | Aligned with National Education Policy 2020', {
    x: width / 2 - 180,
    y: 50,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5)
  });

  const pdfBytes = await pdfDoc.save();

  // Log certificate generation
  await AuditLog.create({
    action: 'NEP_CERTIFICATE_GENERATED',
    actor: req.user.id,
    target: studentId,
    metadata: {
      totalActivities,
      totalCompetencies,
      complianceStandard: 'NEP_2020'
    },
    ip: req.ip
  }).catch(() => {});

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="NEP_Certificate_${student.roll}_${student.name.replace(/\s/g, '_')}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

/**
 * Get NEP Competency Report for School
 * GET /api/v1/compliance/nep-report?schoolId=XXX
 */
exports.getNEPCompetencyReport = asyncHandler(async (req, res) => {
  const { schoolId } = req.query;

  const activities = await ActivitySubmission.find({
    school: schoolId,
    status: 'approved'
  })
    .select('nepCompetencies activityType')
    .lean();

  const competencyMap = {};
  activities.forEach(activity => {
    if (activity.nepCompetencies) {
      activity.nepCompetencies.forEach(comp => {
        competencyMap[comp] = (competencyMap[comp] || 0) + 1;
      });
    }
  });

  const studentCount = await User.countDocuments({
    role: 'student',
    'profile.school': schoolId,
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: {
      schoolId,
      totalActivities: activities.length,
      totalStudents: studentCount,
      activitiesPerStudent: studentCount > 0 ? (activities.length / studentCount).toFixed(2) : 0,
      competencies: competencyMap,
      nepComplianceScore: Math.min(95, 70 + (Object.keys(competencyMap).length * 3)),
      nepAlignment: 'Full alignment with NEP 2020 environmental education guidelines'
    }
  });
});

module.exports = {
  generateNEPCertificate: exports.generateNEPCertificate,
  getNEPCompetencyReport: exports.getNEPCompetencyReport
};
