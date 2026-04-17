const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshToken,
  revokeRefreshToken,
  sendOtp,
  resendOtp,
  verifyOtp,
  sendEmailOtpAppwrite,
  loginEmailOtpAppwrite,
  registerStudent,
  qrLoginByToken,
  setupMfa,
  verifyMfaSetup,
  verifyMfaLogin,
  disableMfa
} = require('../controllers/auth');
const { qrLogin } = require('../controllers/qrController');

const { protect } = require('../middleware/auth');
const { checkAccountLockout } = require('../middleware/accountLockout');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile
} = require('../middleware/validation');
const { ensureCsrfCookie, requireCsrf, getCsrfToken } = require('../middleware/csrf');

const router = express.Router();
const { loginLimiter } = require('../middleware/rateLimiter');

router.get('/csrf-token', ensureCsrfCookie, getCsrfToken);

// Public routes
router.post('/register', ensureCsrfCookie, requireCsrf, loginLimiter, validateUserRegistration, register);
router.post('/register-student', loginLimiter, registerStudent);
router.post('/login', ensureCsrfCookie, requireCsrf, loginLimiter, checkAccountLockout, validateUserLogin, login);
router.post('/send-otp', loginLimiter, sendOtp);
router.post('/resend-otp', loginLimiter, resendOtp);
router.post('/verify-otp', loginLimiter, verifyOtp);
router.post('/send-email-otp-appwrite', loginLimiter, sendEmailOtpAppwrite);
router.post('/login-email-otp-appwrite', loginLimiter, loginEmailOtpAppwrite);
router.post('/verify-mfa', ensureCsrfCookie, requireCsrf, loginLimiter, verifyMfaLogin);
router.post('/qr-login', loginLimiter, qrLogin);  // QR code login (no email/phone needed)
router.get('/qr-login', loginLimiter, qrLoginByToken);
router.post('/logout', ensureCsrfCookie, requireCsrf, protect, logout);
router.post('/refresh', ensureCsrfCookie, requireCsrf, refreshToken);  // #12 Refresh token rotation
router.post('/forgot-password', ensureCsrfCookie, requireCsrf, forgotPassword);
router.put('/reset-password/:resettoken', ensureCsrfCookie, requireCsrf, resetPassword);

// Protected routes
router.get('/verify', protect, getMe);
router.get('/me', protect, getMe);
router.put('/profile', ensureCsrfCookie, requireCsrf, protect, validateUserProfile, updateProfile);
router.put('/password', ensureCsrfCookie, requireCsrf, protect, updatePassword);
router.delete('/account', ensureCsrfCookie, requireCsrf, protect, deleteAccount);
router.post('/revoke', ensureCsrfCookie, requireCsrf, protect, revokeRefreshToken); // #12 Server-side logout
router.post('/mfa/setup', ensureCsrfCookie, requireCsrf, protect, setupMfa);
router.post('/mfa/verify', ensureCsrfCookie, requireCsrf, protect, verifyMfaSetup);
router.post('/mfa/disable', ensureCsrfCookie, requireCsrf, protect, disableMfa);

module.exports = router;