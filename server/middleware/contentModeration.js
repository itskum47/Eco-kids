const SafetyReport = require('../models/SafetyReport');

const flaggedPatterns = [
  /sexual\s+act/i,
  /explicit\s+content/i,
  /send\s+nudes?/i,
  /meet\s+alone/i,
  /touch\s+inappropriately/i,
  /groom(ing)?/i,
  /child\s+abuse/i,
  /threaten/i,
  /blackmail/i
];

const moderateTextFields = (fields = []) => {
  return async (req, res, next) => {
    const violations = [];

    for (const field of fields) {
      const value = (req.body?.[field] || '').toString();
      if (!value) continue;

      const matched = flaggedPatterns.find((pattern) => pattern.test(value));
      if (matched) {
        violations.push({ field, pattern: matched.toString() });
      }
    }

    if (violations.length === 0) {
      return next();
    }

    try {
      if (req.user?._id) {
        await SafetyReport.create({
          reportedBy: req.user._id,
          subjectType: req.originalUrl.includes('/feed') ? 'feed_post' : 'activity_submission',
          subjectId: req.params.postId || req.params.submissionId || 'pending',
          reason: 'sexual_content',
          details: `Auto-flagged by moderation. Violations: ${JSON.stringify(violations)}`,
          status: 'open',
          riskScore: 8
        });
      }
    } catch (_) {
      // Do not block moderation response if report persistence fails.
    }

    return res.status(400).json({
      success: false,
      message: 'Content blocked due to child safety policy (POCSO compliance)',
      violations
    });
  };
};

module.exports = {
  moderateTextFields
};
