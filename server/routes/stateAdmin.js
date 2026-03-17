const express = require('express');
const { requireRole } = require('../middleware/requireRole');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { getDashboard, getDistricts, getImpactMetrics } = require('../controllers/stateAdminController');
const { ROLES } = require('../constants/roles');

router.use(protect);
router.use(requireRole(ROLES.STATE_ADMIN, ROLES.ADMIN));

router.get('/dashboard', getDashboard);
router.get('/districts', getDistricts);
router.get('/impact', getImpactMetrics);

const ApprovalAuditLog = require('../models/ApprovalAuditLog');
const asyncHandler = require('../middleware/async');

// GET /api/v1/state-admin/suspicious-approvals
// Returns teachers whose approval-to-submission ratio in last 7 days > 95% AND total approvals > 50
router.get('/suspicious-approvals', asyncHandler(async (req, res) => {
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const stats = await ApprovalAuditLog.aggregate([
		{
			$match: {
				teacher_id: { $ne: null },
				action_source: 'teacher',
				timestamp: { $gte: sevenDaysAgo }
			}
		},
		{
			$group: {
				_id: '$teacher_id',
				totalActions: { $sum: 1 },
				approvals: { $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] } },
				rejections: { $sum: { $cond: [{ $eq: ['$action', 'rejected'] }, 1, 0] } }
			}
		},
		{
			$addFields: {
				approvalRatio: { $divide: ['$approvals', { $max: ['$totalActions', 1] }] }
			}
		},
		{
			$match: {
				approvalRatio: { $gt: 0.95 },
				approvals: { $gt: 50 }
			}
		}
	]);

	const User = require('../models/User');
	const teacherIds = stats.map(s => s._id);
	const teachers = await User.find({ _id: { $in: teacherIds } })
		.select('name email profile.school schoolCode')
		.lean();

	const teacherMap = Object.fromEntries(teachers.map(t => [String(t._id), t]));

	const result = stats.map(s => ({
		teacher: teacherMap[String(s._id)] || { _id: s._id, name: 'Unknown' },
		approvals: s.approvals,
		rejections: s.rejections,
		totalActions: s.totalActions,
		approvalRatio: Math.round(s.approvalRatio * 100),
		suspiciousFlag: true
	}));

	res.json({ success: true, count: result.length, data: result });
}));

module.exports = router;
