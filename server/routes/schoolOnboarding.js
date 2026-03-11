const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    registerSchool,
    lookupSchool,
    getRegistrationRequests,
    approveRegistration,
    rejectRegistration,
    createSection,
    getSections,
    updateSectionStudents,
    importStudentsCSV
} = require('../controllers/schoolOnboardingController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Public routes
router.post('/register', registerSchool);
router.get('/lookup', lookupSchool);

// Protected routes
router.use(protect);

// Admin: registration request management
router.get('/requests', authorize('admin'), getRegistrationRequests);
router.patch('/requests/:id/approve', authorize('admin'), approveRegistration);
router.patch('/requests/:id/reject', authorize('admin'), rejectRegistration);

// Teacher / School Admin: section management
router.post('/sections', authorize('teacher', 'school_admin', 'admin'), createSection);
router.get('/sections', authorize('teacher', 'school_admin', 'admin'), getSections);
router.patch('/sections/:id/students', authorize('teacher', 'school_admin', 'admin'), updateSectionStudents);

// School Admin: bulk import
router.post('/students/import', authorize('school_admin', 'admin'), upload.single('file'), importStudentsCSV);

module.exports = router;
