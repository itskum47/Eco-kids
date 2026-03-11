const { Queue } = require("bullmq");
const { bullmqRedisClient } = require("../services/cacheService");

const cloudinaryCleanupQueue = new Queue("cloudinary-cleanup", {
    connection: bullmqRedisClient,
});

module.exports = cloudinaryCleanupQueue;
