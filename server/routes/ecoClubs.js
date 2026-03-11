const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ecoClubController = require('../controllers/ecoClubController');

// Protected routes - all require authentication
router.use(protect);

// Eco-Club CRUD (Coordinator/Admin)
router.post('/', authorize('teacher', 'school_admin', 'district_admin', 'state_admin'), ecoClubController.createEcoClub);
router.get('/school/:schoolId', ecoClubController.getSchoolEcoClubs);
router.get('/:clubId', ecoClubController.getEcoClubById);
router.patch('/:clubId', authorize('teacher', 'school_admin'), ecoClubController.updateEcoClub);

// Membership management
router.post('/:clubId/members', ecoClubController.addClubMember);
router.post('/:clubId/members/approve-request', authorize('teacher', 'school_admin'), ecoClubController.approveJoinRequest);
router.delete('/:clubId/members/:studentId', authorize('teacher', 'school_admin'), ecoClubController.removeClubMember);

// Activities
router.post('/:clubId/activities', authorize('teacher', 'school_admin'), ecoClubController.createActivity);
router.get('/:clubId/activities', ecoClubController.getClubActivities);

// Activity Submissions & Verification
router.post('/:clubId/submissions', ecoClubController.submitActivityApproval);
router.get('/:clubId/submissions', authorize('teacher', 'school_admin'), ecoClubController.getSubmissionQueue);
router.post('/:clubId/submissions/:submissionId/approve', authorize('teacher', 'school_admin'), ecoClubController.approveActivitySubmission);
router.post('/:clubId/submissions/:submissionId/reject', authorize('teacher', 'school_admin'), ecoClubController.rejectActivitySubmission);

// Statistics & Analytics
router.get('/:clubId/statistics', ecoClubController.getClubStatistics);

// Announcements
router.get('/:clubId/announcements', ecoClubController.getClubAnnouncements);
router.post('/:clubId/announcements', authorize('teacher', 'school_admin'), ecoClubController.postAnnouncement);

// My clubs (for logged-in user)
router.get('/my-clubs', ecoClubController.getMyEcoClubs);

module.exports = router;
