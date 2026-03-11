const SafetyReport = require('../models/SafetyReport');

// @desc    Create a manual safety report
// @route   POST /api/v1/safety/report
// @access  Private
exports.createSafetyReport = async (req, res, next) => {
  try {
    const report = await SafetyReport.create({
      reportedBy: req.user._id,
      subjectType: req.body.subjectType,
      subjectId: req.body.subjectId,
      reason: req.body.reason,
      details: req.body.details || '',
      riskScore: req.body.riskScore || 5
    });

    return res.status(201).json({
      success: true,
      message: 'Safety report submitted successfully',
      data: report
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    List safety reports for moderators
// @route   GET /api/v1/safety/reports
// @access  Private (teacher/school_admin/district_admin/state_admin)
exports.listSafetyReports = async (req, res, next) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status !== 'all') filter.status = status;

    const reports = await SafetyReport.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('reportedBy', 'name role')
      .populate('resolvedBy', 'name role')
      .lean();

    const total = await SafetyReport.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: reports
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Resolve or reject a safety report
// @route   PATCH /api/v1/safety/reports/:id
// @access  Private (teacher/school_admin/district_admin/state_admin)
exports.resolveSafetyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;

    const report = await SafetyReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Safety report not found' });
    }

    report.status = status;
    report.moderationNotes = moderationNotes || report.moderationNotes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Safety report updated',
      data: report
    });
  } catch (error) {
    return next(error);
  }
};
