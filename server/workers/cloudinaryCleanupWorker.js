const { Worker } = require("bullmq");
const { bullmqRedisClient } = require("../services/cacheService");
const FailedDeletion = require("../models/FailedDeletion");
const DeletionDeadLetter = require("../models/DeletionDeadLetter");
const cloudinary = require("../config/cloudinary");
const { markCleanupRun } = require("./cleanupHealthProbe");

const worker = new Worker(
    "cloudinary-cleanup",
    async () => {
        markCleanupRun();
        console.log("[CleanupWorker] Starting cleanup cycle");

        const failed = await FailedDeletion.find().limit(10);

        for (const item of failed) {
            if (item.retryCount >= item.maxRetries) {
                console.error(`[CleanupWorker] Archiving permanently failed ${item.publicId}`);

                await DeletionDeadLetter.create({
                    storageKey: item.publicId,
                    failedAt: new Date(),
                    retryCount: item.retryCount,
                    lastError: "Exceeded max retry limit"
                });

                await item.deleteOne();
                continue;
            }

            await new Promise(resolve => setTimeout(resolve, 200));

            try {
                await cloudinary.uploader.destroy(item.publicId);
                console.log(`[CleanupWorker] Deleted ${item.publicId}`);
                await item.deleteOne();
            } catch (err) {
                console.error(`[CleanupWorker] Failed ${item.publicId}`);
                item.retryCount++;
                await item.save();
            }
        }
    },
    {
        connection: bullmqRedisClient,
        concurrency: 1,
        lockDuration: 5 * 60 * 1000 // 5 minutes
    }
);

worker.on("completed", job => {
    console.log(`[CleanupWorker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`[CleanupWorker] Job ${job.id} failed`, err);
});

worker.on("error", err => {
    console.error("[CleanupWorker] Worker error", err);
});

console.log("Cloudinary cleanup worker running");

module.exports = worker;
