const express = require('express');
const asyncHandler = require('../middleware/async');
const ContentReport = require('../models/ContentReport');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getContentStats,
  getUserAnalytics,
  getLearningAnalytics,
  bulkUserOperations,
  getAllSubmissions,
  getLeaderboard,
  getOverview,
  getImpactReport,
  getSchoolStats,
  getDistrictStats,
  getStateStats
} = require('../controllers/admin');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All routes require authentication and admin roles (district or state admin)
router.use(protect);
router.use(requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN));

// Dashboard & Overview
router.get('/dashboard', getDashboardStats);
router.get('/overview', getOverview);
router.get('/reports/impact', getImpactReport);
router.get('/submissions', getAllSubmissions);
router.get('/leaderboard', getLeaderboard);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/learning', getLearningAnalytics);
router.get('/content/stats', getContentStats);

// Content report moderation
router.get('/content-reports', asyncHandler(async (req, res) => {
  const status = req.query.status || 'open';

  const reports = await ContentReport.find({ status })
    .sort({ created_at: 1 })
    .populate('reporter_id', 'name email role')
    .populate('reviewed_by', 'name email role')
    .lean();

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
}));

router.patch('/content-reports/:reportId', asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, admin_note } = req.body;

  if (!['open', 'resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const update = {
    status,
    admin_note: typeof admin_note === 'string' ? admin_note.trim() : ''
  };

  if (status === 'resolved' || status === 'dismissed') {
    update.reviewed_by = req.user._id;
    update.reviewed_at = new Date();
  }

  const report = await ContentReport.findByIdAndUpdate(
    reportId,
    update,
    { new: true, runValidators: true }
  )
    .populate('reporter_id', 'name email role')
    .populate('reviewed_by', 'name email role');

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.status(200).json({ success: true, data: report });
}));

// Geographic Admin Dashboards
router.get('/school/:schoolId/stats', getSchoolStats);
router.get('/district/:districtId/stats', getDistrictStats);
router.get('/state/:stateId/stats', getStateStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk', bulkUserOperations);

module.exports = router;