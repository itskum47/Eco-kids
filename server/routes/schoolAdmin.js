const express = require('express');
const router = express.Router();
const schoolAdminController = require('../controllers/schoolAdminController');
const bulkImportController = require('../controllers/bulkImportController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const multer = require('multer');
// Note: We're reusing the authorize framework, user explicitly mapped to 'school_admin'
const { authorize } = require('../middleware/auth'); // If authorize exists in auth, or we can use requireRole

// All school admin routes are protected
router.use(protect);

// User mapping rule: They authorize by 'school_admin' or 'admin'
// For this we will use requireRole since it already handles multiple roles gracefully
const { ROLES } = require('../constants/roles');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
router.use(requireRole(ROLES.SCHOOL_ADMIN, ROLES.ADMIN));

router.get('/dashboard', schoolAdminController.getDashboard);
router.get('/stats', schoolAdminController.getDashboard);
router.get('/students', schoolAdminController.getStudents);
router.get('/teachers', schoolAdminController.getTeachers);
router.get('/impact', schoolAdminController.getImpactMetrics);
router.get('/leaderboard-position', schoolAdminController.getLeaderboardPosition);
router.get('/activity-metrics', schoolAdminController.getActivityMetrics);
router.post('/create-student', schoolAdminController.createStudent);
router.post('/bulk-create-students', upload.single('file'), schoolAdminController.bulkCreateStudents);
router.get('/generate-qr/:studentId', schoolAdminController.generateQrForStudent);
router.post('/students/bulk-import', upload.single('file'), bulkImportController.bulkImportStudents);

module.exports = router;
