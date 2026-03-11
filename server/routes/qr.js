const express = require('express');
const {
  generateStudentQRCode,
  generateClassQRCodes,
  qrLogin,
  revokeQRCode
} = require('../controllers/qrController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

/**
 * QR Code Routes
 * Used by teachers and school admins to generate and manage QR login codes
 */

// Generate QR code for a single student
// GET /api/v1/qr/student/:studentId
// Auth: TEACHER, SCHOOL_ADMIN
router.get(
  '/student/:studentId',
  protect,
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN),
  generateStudentQRCode
);

// Generate QR codes for entire class
// GET /api/v1/qr/class/:grade/:section
// Auth: TEACHER, SCHOOL_ADMIN
router.get(
  '/class/:grade/:section',
  protect,
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN),
  generateClassQRCodes
);

// Revoke a QR code (lost/stolen card)
// POST /api/v1/qr/revoke/:studentId
// Auth: SCHOOL_ADMIN, TEACHER
router.post(
  '/revoke/:studentId',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.TEACHER),
  revokeQRCode
);

module.exports = router;
