const express = require('express');
const multer = require('multer');
const {
  uploadImage,
  uploadVideo,
  uploadDocument,
  deleteFile,
  getUploadedFiles
} = require('../controllers/upload');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// All routes require authentication
router.use(protect);

// Image upload
router.post('/image', 
  upload.single('image'), 
  validateFileUpload(['image']), 
  uploadImage
);

// Video upload (teacher and above only)
router.post('/video', 
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  upload.single('video'), 
  validateFileUpload(['video'], 50000000), // 50MB for videos
  uploadVideo
);

// Document upload (teacher and above only)
router.post('/document', 
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  upload.single('document'), 
  validateFileUpload(['application'], 10000000), // 10MB for documents
  uploadDocument
);

// Multiple files upload
router.post('/multiple', 
  upload.array('files', 5), // Max 5 files
  uploadImage
);

// File management
router.get('/files', getUploadedFiles);
router.delete('/files/:publicId', deleteFile);

module.exports = router;