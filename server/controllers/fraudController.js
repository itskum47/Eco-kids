const FraudFlag = require('../models/FraudFlag');
const ActivitySubmission = require('../models/ActivitySubmission');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get pending fraud flags
// @route   GET /api/fraud/flags
// @access  Private/Admin
exports.getFraudFlags = async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status !== 'all') {
            filter.resolution = status;
        }

        const flags = await FraudFlag.find(filter)
            .sort({ confidence: -1, createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('submissionId', 'activityType evidence status createdAt geoLocation pHash')
            .populate('userId', 'name email profile.school profile.grade')
            .populate('reviewedBy', 'name')
            .lean();

        const total = await FraudFlag.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: flags.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: flags
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get fraud summary statistics
// @route   GET /api/fraud/summary
// @access  Private/Admin
exports.getFraudSummary = async (req, res, next) => {
    try {
        const [summary, pendingCount] = await Promise.all([
            FraudFlag.getSummary(),
            FraudFlag.countPending()
        ]);

        res.status(200).json({
            success: true,
            data: {
                pendingCount,
                breakdown: summary
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve a fraud flag
// @route   PATCH /api/fraud/flags/:id/resolve
// @access  Private/Admin
exports.resolveFraudFlag = async (req, res, next) => {
    try {
        const { resolution, reviewNotes } = req.body;

        if (!resolution || !['dismissed', 'confirmed', 'escalated'].includes(resolution)) {
            return res.status(400).json({
                success: false,
                message: 'Resolution must be: dismissed, confirmed, or escalated'
            });
        }

        const flag = await FraudFlag.findById(req.params.id);
        if (!flag) {
            return res.status(404).json({
                success: false,
                message: 'Fraud flag not found'
            });
        }

        if (flag.resolution !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Flag already resolved as: ${flag.resolution}`
            });
        }

        flag.resolution = resolution;
        flag.reviewedBy = req.user._id;
        flag.reviewedAt = new Date();
        flag.reviewNotes = reviewNotes || '';
        await flag.save();

        // If confirmed: reject the associated submission
        if (resolution === 'confirmed' && flag.submissionId) {
            await ActivitySubmission.findByIdAndUpdate(
                flag.submissionId,
                {
                    status: 'rejected',
                    rejectionReason: `Fraud detected: ${flag.flagType}`
                }
            );
        }

        await logAuditEvent({
            actorId: req.user._id.toString(),
            actorRole: req.user.role,
            action: 'FRAUD_FLAG_RESOLVED',
            targetType: 'FRAUD_FLAG',
            targetId: flag._id.toString(),
            metadata: {
                flagType: flag.flagType,
                resolution,
                submissionId: flag.submissionId?.toString()
            },
            req,
            status: 'success'
        }).catch(() => { });

        res.status(200).json({
            success: true,
            message: `Fraud flag resolved as: ${resolution}`,
            data: flag
        });
    } catch (error) {
        next(error);
    }
};
