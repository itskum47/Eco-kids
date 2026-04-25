const User = require('../models/User');

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function extractScoreComponentsFromUser(user = {}) {
  const verifiedPoints = asNumber(user?.gamification?.ecoPoints ?? user?.ecoPointsTotal ?? 0);

  const impactBonus = asNumber(
    user?.gamification?.scoreBreakdown?.impactBonus ??
      user?.scoreBreakdown?.impactBonus ??
      0
  );

  const consistencyBonus = asNumber(
    user?.gamification?.scoreBreakdown?.consistencyBonus ??
      user?.scoreBreakdown?.consistencyBonus ??
      0
  );

  const fraudPenalty = asNumber(
    user?.gamification?.scoreBreakdown?.fraudPenalty ??
      user?.scoreBreakdown?.fraudPenalty ??
      0
  );

  const score = verifiedPoints + impactBonus + consistencyBonus - fraudPenalty;

  return {
    verifiedPoints,
    impactBonus,
    consistencyBonus,
    fraudPenalty,
    score,
  };
}

async function getScoreComponentsForUserId(userId) {
  const user = await User.findById(userId)
    .select('gamification.ecoPoints ecoPointsTotal gamification.scoreBreakdown scoreBreakdown')
    .lean();

  if (!user) return null;
  return extractScoreComponentsFromUser(user);
}

module.exports = {
  extractScoreComponentsFromUser,
  getScoreComponentsForUserId,
};
