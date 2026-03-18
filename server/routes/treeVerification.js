const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getTreeSpecies,
  plantTree,
  submitTreeFollowUp,
  reviewTreeFollowUp,
  getMyTrees
} = require('../controllers/treeVerificationController');

const router = express.Router();

router.get('/species', protect, getTreeSpecies);
router.post('/plant', protect, plantTree);
router.get('/my-trees', protect, getMyTrees);
router.post('/verify/:plantedTreeId', protect, submitTreeFollowUp);
router.put('/review/:followUpTaskId', protect, authorize('teacher', 'admin', 'school_admin'), reviewTreeFollowUp);

module.exports = router;
