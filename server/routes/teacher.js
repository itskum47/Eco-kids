const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const pagination = require('../middleware/pagination');

// All teacher routes are protected and require the 'teacher' role.
router.use(protect);
router.use(requireRole(ROLES.TEACHER));

// Dashboard KPIs
router.get('/dashboard', teacherController.getTeacherDashboard);

// Submission Queue
router.get('/submissions/pending', pagination, teacherController.getPendingSubmissions);
router.patch('/submissions/:id', teacherController.updateSubmissionStatus);
router.post('/activities/batch-approve', teacherController.batchApproveActivities);

// Student Management and Reporting
router.get('/students', pagination, teacherController.getTeacherStudents);
router.get('/class-impact', teacherController.getClassImpact);

// Assignments
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', teacherController.createAssignment);

module.exports = router;
