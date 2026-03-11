const EngagementEvent = require('../models/EngagementEvent');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const School = require('../models/School');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const logger = require('../utils/logger');

// @desc    Get engagement funnel metrics
// @route   GET /api/reporting/funnel
// @access  Private/Admin
exports.getEngagementFunnel = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const funnel = await EngagementEvent.getFunnelMetrics(from, to);

        res.status(200).json({
            success: true,
            data: funnel
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export environmental impact report as CSV
// @route   GET /api/reporting/export
// @access  Private/Admin,District_Admin,State_Admin
exports.exportReport = async (req, res, next) => {
    try {
        const { format = 'csv', type = 'environmental_impact', from, to } = req.query;

        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);

        let data;

        if (type === 'environmental_impact') {
            const matchStage = { status: 'approved' };
            if (from || to) matchStage.createdAt = dateFilter;

            data = await ActivitySubmission.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { school: '$school', activityType: '$activityType' },
                        count: { $sum: 1 },
                        uniqueStudents: { $addToSet: '$user' }
                    }
                },
                {
                    $project: {
                        school: '$_id.school',
                        activityType: '$_id.activityType',
                        submissions: '$count',
                        uniqueStudents: { $size: '$uniqueStudents' },
                        _id: 0
                    }
                },
                { $sort: { school: 1, activityType: 1 } }
            ]);
        } else if (type === 'user_engagement') {
            data = await User.aggregate([
                { $match: { role: 'student', isActive: true } },
                {
                    $group: {
                        _id: '$profile.school',
                        totalStudents: { $sum: 1 },
                        avgEcoPoints: { $avg: '$gamification.ecoPointsTotal' },
                        avgStreak: { $avg: '$gamification.streakDays' },
                        totalTreesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
                        totalCo2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                        totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type. Use: environmental_impact or user_engagement'
            });
        }

        if (format === 'csv') {
            if (data.length === 0) {
                return res.status(200).send('No data found for the specified criteria');
            }

            // Simple CSV generation
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(val =>
                    typeof val === 'string' ? `"${val}"` : val
                ).join(',')
            );

            const csv = [headers, ...rows].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=ecokids-${type}-report.csv`);
            return res.status(200).send(csv);
        }

        // Default JSON
        res.status(200).json({
            success: true,
            reportType: type,
            period: { from, to },
            count: data.length,
            data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track engagement event
// @route   POST /api/reporting/track
// @access  Private
exports.trackEvent = async (req, res, next) => {
    try {
        const { event, metadata } = req.body;

        if (!event) {
            return res.status(400).json({
                success: false,
                message: 'Event name is required'
            });
        }

        await EngagementEvent.create({
            userId: req.user._id,
            event,
            metadata: metadata || {},
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
};

exports.exportSchoolReportCsv = async (req, res, next) => {
    try {
        const { schoolId } = req.params;
        const { format = 'csv' } = req.query;

        if (format !== 'csv') {
            return res.status(400).json({
                success: false,
                message: 'Only csv format is supported'
            });
        }

        const schoolFilter = mongoose.Types.ObjectId.isValid(schoolId)
            ? {
                $or: [
                    { 'profile.schoolId': new mongoose.Types.ObjectId(schoolId) },
                    { 'profile.school': schoolId }
                ]
            }
            : { 'profile.school': schoolId };

        const students = await User.find({ role: 'student', ...schoolFilter })
            .select('name gamification lastLogin updatedAt')
            .lean();

        const studentIds = students.map((student) => student._id);

        const submissionStats = await ActivitySubmission.aggregate([
            {
                $match: {
                    user: { $in: studentIds },
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$user',
                    activitiesCompleted: { $sum: 1 },
                    lastSubmissionAt: { $max: '$createdAt' }
                }
            }
        ]);

        const statsByUserId = submissionStats.reduce((acc, row) => {
            acc[row._id.toString()] = row;
            return acc;
        }, {});

        const rows = students.map((student) => {
            const stat = statsByUserId[student._id.toString()] || {};
            const lastActiveCandidates = [
                stat.lastSubmissionAt,
                student.lastLogin,
                student.updatedAt
            ].filter(Boolean);

            const lastActive = lastActiveCandidates.length
                ? new Date(Math.max(...lastActiveCandidates.map((date) => new Date(date).getTime()))).toISOString()
                : '';

            return {
                studentName: student.name || 'Unknown',
                totalPoints: student.gamification?.ecoPoints || 0,
                activitiesCompleted: stat.activitiesCompleted || 0,
                badgesEarned: student.gamification?.badges?.length || 0,
                lastActive
            };
        });

        const parser = new Parser({
            fields: ['studentName', 'totalPoints', 'activitiesCompleted', 'badgesEarned', 'lastActive']
        });
        const csv = parser.parse(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="school-report.csv"');
        return res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// @desc    Get NGO impact summary report (NGO Coordinator only)
// @route   GET /api/reporting/ngo/impact-summary
// @access  Private/NGO_COORDINATOR
exports.getNGOImpactSummary = async (req, res, next) => {
    try {
        const { from, to, schoolId } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);

        // Build school filter (NGO coordinators can filter by school)
        let schoolFilter = {};
        if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
            schoolFilter.school = mongoose.Types.ObjectId(schoolId);
        }

        // Aggregate total students across all (or filtered) schools
        const totalStudents = await User.countDocuments({
            role: 'student',
            isActive: true,
            deletedAt: { $eq: null },
            ...schoolFilter
        });

        // Count approved activities (total environmental impact)
        const activityStats = await ActivitySubmission.aggregate([
            {
                $match: {
                    status: 'approved',
                    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                    ...schoolFilter
                }
            },
            {
                $group: {
                    _id: '$activityType',
                    count: { $sum: 1 },
                    uniqueStudents: { $addToSet: '$user' }
                }
            },
            {
                $project: {
                    activityType: '$_id',
                    submissionsCount: '$count',
                    uniqueStudents: { $size: '$uniqueStudents' },
                    _id: 0
                }
            },
            { $sort: { submissionsCount: -1 } }
        ]);

        const totalActivities = activityStats.reduce((sum, stat) => sum + stat.submissionsCount, 0);

        // Find top schools by activity submission count
        const topSchools = await ActivitySubmission.aggregate([
            {
                $match: {
                    status: 'approved',
                    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
                }
            },
            {
                $group: {
                    _id: '$school',
                    submissionsCount: { $sum: 1 },
                    uniqueStudents: { $addToSet: '$user' }
                }
            },
            {
                $lookup: {
                    from: 'schools',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'schoolData'
                }
            },
            {
                $project: {
                    schoolId: '$_id',
                    schoolName: { $arrayElemAt: ['$schoolData.name', 0] },
                    submissionsCount: 1,
                    uniqueStudents: { $size: '$uniqueStudents' },
                    _id: 0
                }
            },
            { $sort: { submissionsCount: -1 } },
            { $limit: 10 }
        ]);

        // Aggregate SDG impact by activity type
        const sdgImpactMap = {
            'tree-planting': [13, 15],
            'plastic-reduction': [12],
            'water-saving': [6],
            'energy-saving': [7, 13],
            'waste-recycling': [12],
            'biodiversity-survey': [15],
            'composting': [12, 15]
        };

        const sdgImpact = {};
        activityStats.forEach(stat => {
            const goals = sdgImpactMap[stat.activityType] || [];
            goals.forEach(goal => {
                if (!sdgImpact[goal]) {
                    sdgImpact[goal] = 0;
                }
                sdgImpact[goal] += stat.submissionsCount;
            });
        });

        // Log this NGO report access
        await AuditLog.create({
            action: 'NGO_REPORT_GENERATED',
            actor: req.user._id,
            target: req.user._id,
            metadata: {
                reportType: 'ngo_impact_summary',
                period: { from, to },
                schoolId: schoolId || 'all'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalActivities,
                activitiesByType: activityStats,
                topSchools,
                sdgImpact,
                period: { from: from || 'all-time', to: to || 'now' },
                generatedAt: new Date(),
                generatedBy: req.user._id
            }
        });
    } catch (error) {
        logger.error(`[NGO Report] Error generating NGO impact summary:`, error);
        next(error);
    }
};
