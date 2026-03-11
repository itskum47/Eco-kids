require("dotenv").config();
const connectDB = require("../config/database");
const cloudinaryCleanupQueue = require("../queues/cloudinaryCleanupQueue");

// Initialize and explicitly start the worker process so it can consume from the queue
require("./cloudinaryCleanupWorker");

// Connect to database before adding scheduled jobs
connectDB().then(async () => {
    console.log("Database connected for Cloudinary cleanup worker");

    // Schedule the recurring job in BullMQ
    await cloudinaryCleanupQueue.add(
        "retry-failed-deletions",
        {},
        {
            jobId: "cloudinary-cleanup-cron",
            repeat: {
                every: 5 * 60 * 1000 // every 5 minutes
            },
            removeOnComplete: true,
            removeOnFail: false
        }
    );

    console.log("Cloudinary cleanup BullMQ scheduled job initialized successfully");
}).catch(err => {
    console.error("Failed to connect database for cleanup worker:", err);
    process.exit(1);
});
