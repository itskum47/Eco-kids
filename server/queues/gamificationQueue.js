const { Queue } = require('bullmq');
const { queueRedis } = require('../services/cacheService');

// Instantiate the Gamification Background Queue referencing our hardened Redis configuration
const gamificationQueue = new Queue('GamificationPipeline', {
    connection: queueRedis
});

// Dead Letter Queue for permanently failed jobs (DPDP Act Compliance: Drop PII after 24H)
const deadLetterQueue = new Queue('GamificationDLQ', {
    connection: queueRedis,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: { age: 24 * 3600 }
    }
});

module.exports = { gamificationQueue, deadLetterQueue };
