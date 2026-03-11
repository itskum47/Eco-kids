const WeeklyMission = require('../models/WeeklyMission');
const UserMissionProgress = require('../models/UserMissionProgress');
const { creditReward } = require('../utils/ecoPointsManager');
const logger = require('../utils/logger');

/**
 * @desc    Get current active missions with user progress
 * @route   GET /api/missions/current
 * @access  Private
 */
exports.getCurrentMissions = async (req, res) => {
    try {
        const now = new Date();
        const missions = await WeeklyMission.find({
            isActive: true,
            startsAt: { $lte: now },
            endsAt: { $gte: now }
        }).lean();

        if (!missions.length) {
            return res.json({ success: true, data: [] });
        }

        // Fetch user progress for each mission
        const missionIds = missions.map(m => m._id);
        const progressDocs = await UserMissionProgress.find({
            userId: req.user.id,
            missionId: { $in: missionIds }
        }).lean();

        const progressMap = {};
        progressDocs.forEach(p => { progressMap[p.missionId.toString()] = p; });

        const enriched = missions.map(mission => {
            const progress = progressMap[mission._id.toString()];
            return {
                ...mission,
                progress: progress ? {
                    objectives: mission.objectives.map(obj => {
                        const progObj = progress.objectives.find(
                            po => po.objectiveId.toString() === obj._id.toString()
                        );
                        return {
                            ...obj,
                            current: progObj ? progObj.current : 0,
                            completed: progObj ? progObj.completed : false
                        };
                    }),
                    allObjectivesCompleted: progress.allObjectivesCompleted,
                    rewardClaimed: progress.rewardClaimed,
                    completedAt: progress.completedAt
                } : {
                    objectives: mission.objectives.map(obj => ({
                        ...obj, current: 0, completed: false
                    })),
                    allObjectivesCompleted: false,
                    rewardClaimed: false,
                    completedAt: null
                }
            };
        });

        res.json({ success: true, data: enriched });
    } catch (error) {
        logger.error('getMissions error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching missions.' });
    }
};

/**
 * @desc    Get user's progress on a specific mission
 * @route   GET /api/missions/:id/progress
 * @access  Private
 */
exports.getMissionProgress = async (req, res) => {
    try {
        const mission = await WeeklyMission.findById(req.params.id).lean();
        if (!mission) {
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        let progress = await UserMissionProgress.findOne({
            userId: req.user.id,
            missionId: req.params.id
        }).lean();

        if (!progress) {
            // Auto-initialize progress if not exists
            progress = {
                objectives: mission.objectives.map(obj => ({
                    objectiveId: obj._id,
                    current: 0,
                    completed: false,
                    completedAt: null
                })),
                allObjectivesCompleted: false,
                rewardClaimed: false,
                completedAt: null
            };
        }

        res.json({ success: true, data: { mission, progress } });
    } catch (error) {
        logger.error('getMissionProgress error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching mission progress.' });
    }
};

/**
 * @desc    Claim reward for a completed mission
 * @route   POST /api/missions/:id/claim
 * @access  Private
 */
exports.claimMissionReward = async (req, res) => {
    try {
        const mission = await WeeklyMission.findById(req.params.id);
        if (!mission) {
            return res.status(404).json({ success: false, message: 'Mission not found.' });
        }

        // Check if mission is still active
        const now = new Date();
        if (now > mission.endsAt) {
            return res.status(400).json({ success: false, message: 'Mission has expired.' });
        }

        // Idempotent claim: findOneAndUpdate with rewardClaimed: false condition
        const progress = await UserMissionProgress.findOneAndUpdate(
            {
                userId: req.user.id,
                missionId: req.params.id,
                allObjectivesCompleted: true,
                rewardClaimed: false
            },
            {
                $set: {
                    rewardClaimed: true,
                    rewardClaimedAt: new Date()
                }
            },
            { new: true }
        );

        if (!progress) {
            // Either not completed or already claimed
            const existing = await UserMissionProgress.findOne({
                userId: req.user.id,
                missionId: req.params.id
            });

            if (existing?.rewardClaimed) {
                return res.status(400).json({ success: false, message: 'Reward already claimed.' });
            }
            return res.status(400).json({ success: false, message: 'Mission not yet completed.' });
        }

        // Credit reward using idempotent engine
        await creditReward({
            userId: req.user.id,
            points: mission.reward.ep,
            reason: `Weekly mission completed: ${mission.title}`,
            idempotencyKey: `${req.user.id}:${mission._id}:MISSION_COMPLETE`,
            sourceId: mission._id,
            sourceModel: 'WeeklyMission',
            action: 'MISSION_COMPLETE'
        });

        res.json({
            success: true,
            message: `Mission completed! Earned ${mission.reward.ep} EcoPoints.`,
            data: { epAwarded: mission.reward.ep, badgeName: mission.reward.badgeName }
        });
    } catch (error) {
        logger.error('claimMissionReward error:', error);
        res.status(500).json({ success: false, message: 'Server error claiming reward.' });
    }
};

/**
 * @desc    Increment mission objective progress (called internally by reward events)
 * @param   {ObjectId} userId
 * @param   {String} action - e.g. 'submit_activity', 'complete_quiz'
 * @param   {String|null} activityType - optional filter
 */
exports.incrementMissionProgress = async (userId, action, activityType = null) => {
    try {
        const now = new Date();
        const activeMissions = await WeeklyMission.find({
            isActive: true,
            startsAt: { $lte: now },
            endsAt: { $gte: now }
        }).lean();

        for (const mission of activeMissions) {
            const matchingObjectives = mission.objectives.filter(obj => {
                if (obj.action !== action) return false;
                if (obj.activityType && obj.activityType !== activityType) return false;
                return true;
            });

            if (matchingObjectives.length === 0) continue;

            // Ensure progress document exists
            let progress = await UserMissionProgress.findOne({
                userId,
                missionId: mission._id
            });

            if (!progress) {
                progress = await UserMissionProgress.create({
                    userId,
                    missionId: mission._id,
                    objectives: mission.objectives.map(obj => ({
                        objectiveId: obj._id,
                        current: 0,
                        completed: false
                    }))
                });
            }

            // Don't update if already claimed
            if (progress.rewardClaimed) continue;

            // Increment matching objectives
            let modified = false;
            for (const obj of matchingObjectives) {
                const progressObj = progress.objectives.find(
                    po => po.objectiveId.toString() === obj._id.toString()
                );
                if (progressObj && !progressObj.completed) {
                    progressObj.current += 1;
                    if (progressObj.current >= obj.target) {
                        progressObj.completed = true;
                        progressObj.completedAt = new Date();
                    }
                    modified = true;
                }
            }

            if (modified) {
                await progress.save();
            }
        }
    } catch (error) {
        // Non-blocking: mission progress failures should not break core flows
        logger.error(`[MissionEngine] Progress increment failed for user ${userId}:`, error);
    }
};

/**
 * @desc    Get all mission definitions (admin)
 * @route   GET /api/missions/all
 * @access  Private/Admin
 */
exports.getAllMissions = async (req, res) => {
    try {
        const missions = await WeeklyMission.find()
            .sort({ year: -1, weekNumber: -1 })
            .lean();
        res.json({ success: true, data: missions });
    } catch (error) {
        logger.error('getAllMissions error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
