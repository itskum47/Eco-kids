const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const { NEP_COMPETENCIES } = require('../config/nepMapping');

const summarizeCompetencyCounts = (rows) => {
  const baseline = NEP_COMPETENCIES.reduce((acc, item) => {
    acc[item] = 0;
    return acc;
  }, {});

  for (const row of rows) {
    baseline[row._id] = row.count;
  }

  return baseline;
};

// @desc    Get NEP competency progress for current user
// @route   GET /api/v1/nep/my-progress
// @access  Private
exports.getMyNepProgress = async (req, res, next) => {
  try {
    const rows = await ActivitySubmission.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'approved'
        }
      },
      { $unwind: '$nepCompetencies' },
      {
        $group: {
          _id: '$nepCompetencies',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = summarizeCompetencyCounts(rows);

    return res.status(200).json({
      success: true,
      data: {
        userId: req.user._id,
        userName: req.user.name,
        competencies: summary,
        totalApprovedSubmissions: Object.values(summary).reduce((a, b) => a + b, 0)
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get school-level NEP 2020 alignment report
// @route   GET /api/v1/nep/school-report/:schoolId?
// @access  Private (school_admin, district_admin, state_admin)
exports.getSchoolNepReport = async (req, res, next) => {
  try {
    let schoolFilter = {};

    if (req.params.schoolId) {
      schoolFilter.schoolId = req.params.schoolId;
    } else if (req.user.role === 'school_admin' && req.user.profile?.school) {
      schoolFilter.school = req.user.profile.school;
    }

    const [activitySummary, studentCoverage] = await Promise.all([
      ActivitySubmission.aggregate([
        { $match: { ...schoolFilter, status: 'approved' } },
        { $unwind: '$nepCompetencies' },
        {
          $group: {
            _id: '$nepCompetencies',
            count: { $sum: 1 }
          }
        }
      ]),
      ActivitySubmission.aggregate([
        { $match: { ...schoolFilter, status: 'approved' } },
        {
          $group: {
            _id: '$user',
            competencyCount: { $sum: { $size: { $ifNull: ['$nepCompetencies', []] } } }
          }
        },
        {
          $group: {
            _id: null,
            activeStudents: { $sum: 1 },
            avgCompetencyEventsPerStudent: { $avg: '$competencyCount' }
          }
        }
      ])
    ]);

    const competencySummary = summarizeCompetencyCounts(activitySummary);

    return res.status(200).json({
      success: true,
      data: {
        schoolFilter,
        competencySummary,
        activeStudents: studentCoverage[0]?.activeStudents || 0,
        avgCompetencyEventsPerStudent: Number((studentCoverage[0]?.avgCompetencyEventsPerStudent || 0).toFixed(2)),
        nepComplianceAreasCovered: Object.values(competencySummary).filter((value) => value > 0).length
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Generate NEP competency certificate for a student
// @route   GET /api/v1/nep/certificate/:studentId
// @access  Private (teacher, school_admin, district_admin, state_admin)
exports.generateNepCertificate = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId).select('name profile.school profile.district profile.state');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const rows = await ActivitySubmission.aggregate([
      {
        $match: {
          user: student._id,
          status: 'approved'
        }
      },
      { $unwind: '$nepCompetencies' },
      {
        $group: {
          _id: '$nepCompetencies',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = summarizeCompetencyCounts(rows);
    const achievedCompetencies = Object.entries(summary)
      .filter(([, count]) => count > 0)
      .map(([name]) => name);

    return res.status(200).json({
      success: true,
      data: {
        certificateId: `NEP-${student._id}-${Date.now()}`,
        issuedAt: new Date(),
        student: {
          id: student._id,
          name: student.name,
          school: student.profile?.school || '',
          district: student.profile?.district || '',
          state: student.profile?.state || ''
        },
        framework: 'NEP 2020',
        competenciesAchieved: achievedCompetencies,
        competencyBreakdown: summary,
        issuedBy: {
          id: req.user._id,
          name: req.user.name,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
