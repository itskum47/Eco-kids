const { Queue } = require('bullmq');
const { bullmqRedisClient } = require('../services/cacheService');

const aiVerificationQueue = new Queue('ai-verification', {
  connection: bullmqRedisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

module.exports = { aiVerificationQueue };
