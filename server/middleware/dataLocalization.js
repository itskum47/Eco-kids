const logger = require('../utils/logger');

const INDIA_PRIMARY_REGION = process.env.DATA_RESIDENCY_REGION || 'ap-south-1';
const ENFORCE_REGION = process.env.ENFORCE_INDIA_DATA_RESIDENCY === 'true';

const dataLocalizationGuard = (req, res, next) => {
  const runtimeRegion = process.env.AWS_REGION || process.env.STORAGE_REGION || INDIA_PRIMARY_REGION;

  res.setHeader('X-Data-Residency', 'India');
  res.setHeader('X-Data-Region', runtimeRegion);
  res.setHeader('X-Data-Compliance', 'DPDP-2023');

  if (ENFORCE_REGION && runtimeRegion !== INDIA_PRIMARY_REGION) {
    logger.error({ runtimeRegion, expectedRegion: INDIA_PRIMARY_REGION }, 'Data residency violation detected');
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable due to data residency policy enforcement',
      dataResidency: {
        country: 'India',
        expectedRegion: INDIA_PRIMARY_REGION,
        actualRegion: runtimeRegion
      }
    });
  }

  return next();
};

module.exports = {
  dataLocalizationGuard,
  INDIA_PRIMARY_REGION
};
