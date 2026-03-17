const User = require('../models/User');
const ParentalConsent = require('../models/ParentalConsent');
const asyncHandler = require('./async');
const { redisClient } = require('../services/cacheService');

const CONSENT_CACHE_TTL = 15 * 60; // 15 minutes

exports.requireConsent = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('profile.dateOfBirth role');

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  // Calculate age from dateOfBirth; if unknown, treat as minor (fail-safe)
  let userAge = null;
  if (user.profile?.dateOfBirth) {
    const today = new Date();
    const birth = new Date(user.profile.dateOfBirth);
    userAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) userAge--;
  }

  // Adults (18+) and users without a recorded DOB (assumed adult for non-student roles) pass through
  if (userAge !== null && userAge >= 18) return next();
  if (userAge === null && user.role !== 'student') return next();

  // Under-18 student — require an approved parental consent record
  const cacheKey = `consent:${req.user.id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached !== null) {
      if (cached === 'approved') return next();
      // Not approved — block
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message: 'Parental consent is required to access this content. Please ask a parent or guardian to complete the consent process.',
        consentUrl: '/consent/pending'
      });
    }
  } catch (_) { /* Redis down — fall through to DB check */ }

  const consent = await ParentalConsent.findOne({
    studentId: req.user.id,
    consentStatus: 'approved'
  }).select('_id').lean();

  const consentValue = consent ? 'approved' : 'pending';

  try {
    await redisClient.set(cacheKey, consentValue, 'EX', CONSENT_CACHE_TTL);
  } catch (_) { /* ignore cache write failure */ }

  if (consent) return next();

  return res.status(403).json({
    error: 'CONSENT_REQUIRED',
    message: 'Parental consent is required to access this content. Please ask a parent or guardian to complete the consent process.',
    consentUrl: '/consent/pending'
  });
});
