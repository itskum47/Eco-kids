const cloudinary = require("../config/cloudinary");
const FailedDeletion = require("../models/FailedDeletion");
const { createBreaker } = require("../utils/circuitBreaker");
const logger = require("../utils/logger");

const cloudinaryDestroyer = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId);
};

const cloudinaryBreaker = createBreaker(cloudinaryDestroyer, 'Cloudinary');

const deleteImage = async (publicId) => {
    if (!publicId) return;

    try {
        await cloudinaryBreaker.fire(publicId);
        logger.info(`[Cloudinary] Successfully destroyed ${publicId}`);
    } catch (error) {
        logger.error("[Cloudinary] Deletion failed or Circuit Open:", error);

        // Save failed deletion for retry (Fallback via Cron/Dead-Letter)
        await FailedDeletion.create({
            publicId,
            failedAt: new Date(),
            retryCount: 0
        });
    }
};

module.exports = { deleteImage };
