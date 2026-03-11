const ActivitySubmission = require('../models/ActivitySubmission');

exports.requireIdempotencyKey = async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

    if (!idempotencyKey) {
        return res.status(400).json({
            success: false,
            message: "Idempotency-Key header is required for this operation."
        });
    }

    try {
        const existingSubmission = await ActivitySubmission.findOne({ idempotencyKey });

        if (existingSubmission) {
            return res.status(409).json({
                success: false,
                message: "Duplicate submission. An activity with this Idempotency-Key has already been processed.",
                data: existingSubmission
            });
        }

        req.idempotencyKey = idempotencyKey;
        next();
    } catch (error) {
        console.error('[Idempotency Middleware] Error:', error);
        res.status(500).json({ success: false, message: "Idempotency check failed." });
    }
};
