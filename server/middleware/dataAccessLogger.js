const logger = require('../utils/logger');

const sensitivePathPrefixes = [
  '/api/v1/privacy',
  '/api/v1/compliance',
  '/api/v1/consent',
  '/api/v1/parent-reports',
  '/api/v1/school-admin',
  '/api/v1/district-admin',
  '/api/v1/state-admin'
];

const dataAccessLogger = (req, res, next) => {
  const isSensitiveRoute = sensitivePathPrefixes.some((prefix) => req.originalUrl.startsWith(prefix));

  if (!isSensitiveRoute) {
    return next();
  }

  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info({
      event: 'data_access',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      actorId: req.user?._id || null,
      actorRole: req.user?.role || 'anonymous',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      dataRegion: process.env.AWS_REGION || process.env.STORAGE_REGION || 'ap-south-1'
    }, 'Sensitive data route access');
  });

  return next();
};

module.exports = { dataAccessLogger };
