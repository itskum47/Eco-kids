const ActivitySubmission = require('../models/ActivitySubmission');
const mongoose = require('mongoose');
const { SDG_METADATA } = require('../config/sdgMapping');

const toDisplay = (goal, count) => ({
  goal,
  title: SDG_METADATA[goal]?.title || `SDG ${goal}`,
  color: SDG_METADATA[goal]?.color || '#999999',
  submissions: count
});

// @desc    Get SDG impact overview
// @route   GET /api/v1/sdg/overview
// @access  Private (teacher/school_admin/district_admin/state_admin)
exports.getSdgOverview = async (req, res, next) => {
  try {
    const { from, to, school } = req.query;

    const match = { status: 'approved' };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    if (school) {
      match.school = school;
    }

    const rows = await ActivitySubmission.aggregate([
      { $match: match },
      { $unwind: '$sdgGoals' },
      {
        $group: {
          _id: '$sdgGoals',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const goals = rows.map((row) => toDisplay(Number(row._id), row.count));
    const totalSubmissions = goals.reduce((sum, item) => sum + item.submissions, 0);

    return res.status(200).json({
      success: true,
      data: {
        period: { from: from || null, to: to || null },
        school: school || null,
        totalSubmissions,
        goals
      }
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get SDG impact for a student
// @route   GET /api/v1/sdg/student/:studentId
// @access  Private (teacher/school_admin/district_admin/state_admin)
exports.getStudentSdgProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const rows = await ActivitySubmission.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(studentId),
          status: 'approved'
        }
      },
      { $unwind: '$sdgGoals' },
      {
        $group: {
          _id: '$sdgGoals',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const goals = rows.map((row) => toDisplay(Number(row._id), row.count));

    return res.status(200).json({
      success: true,
      data: {
        studentId,
        goals,
        totalSubmissions: goals.reduce((sum, item) => sum + item.submissions, 0)
      }
    });
  } catch (error) {
    return next(error);
  }
};
