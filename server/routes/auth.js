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
  registerStudent,
  qrLoginByToken
} = require('../controllers/auth');
const { qrLogin } = require('../controllers/qrController');

const { protect } = require('../middleware/auth');
const { checkAccountLockout } = require('../middleware/accountLockout');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile
} = require('../middleware/validation');

const router = express.Router();
const { loginLimiter } = require('../middleware/rateLimiter');


// Public routes
router.post('/register', loginLimiter, validateUserRegistration, register);
router.post('/register-student', loginLimiter, registerStudent);
router.post('/login', loginLimiter, checkAccountLockout, validateUserLogin, login);
router.post('/send-otp', loginLimiter, sendOtp);
router.post('/resend-otp', loginLimiter, resendOtp);
router.post('/verify-otp', loginLimiter, verifyOtp);
router.post('/qr-login', loginLimiter, qrLogin);  // QR code login (no email/phone needed)
router.get('/qr-login', loginLimiter, qrLoginByToken);
router.post('/logout', logout);
router.post('/refresh', refreshToken);  // #12 Refresh token rotation
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/verify', protect, getMe);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUserProfile, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);
router.post('/revoke', protect, revokeRefreshToken); // #12 Server-side logout

module.exports = router;