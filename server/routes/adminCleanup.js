const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const FailedDeletion = require("../models/FailedDeletion");
const DeletionDeadLetter = require("../models/DeletionDeadLetter");
const { getCleanupHealth } = require("../workers/cleanupHealthProbe");

const router = express.Router();

const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30
});

router.get("/cleanup-health", protect, authorize("admin", "superadmin"), adminLimiter, async (req, res) => {
    try {
        const pending = await FailedDeletion.countDocuments();
        const deadLetters = await DeletionDeadLetter.countDocuments();
        const workerHealth = getCleanupHealth();

        res.json({
            pendingCleanup: pending,
            permanentFailures: deadLetters,
            workerLastRun: workerHealth.lastRun,
            workerStatus: workerHealth.status
        });
    } catch (error) {
        console.error("[Admin Health Route] Failed to fetch cleanup health metrics", error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
