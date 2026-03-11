const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const AdminAuditLog = require('../models/AdminAuditLog');

const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');

// Helper to ensure admin has valid state scope
const getAdminStateScope = async (req) => {
    const admin = await User.findById(req.user.id).select('profile');
    if (!admin || !admin.profile || !admin.profile.state) {
        throw new Error('Admin state scope is not completely defined');
    }
    return admin.profile.state;
};

// @desc    Get dashboard metrics for state
// @route   GET /api/state-admin/dashboard
// @access  Private/StateAdmin
exports.getDashboard = async (req, res) => {
    try {
        const state = await getAdminStateScope(req);
        const cacheKey = `state-dashboard:${state}`;

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_DASHBOARD',
            resourceScope: `state:${state}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const cachedData = await cacheService.get(cacheKey, 'admin-dashboards');
        if (cachedData) {
            logger.info(`[Redis] State Dashboard loaded strictly from Cache for ${state}`);
            return res.json({ success: true, data: cachedData, cached: true });
        }

        const [userStatsAgg, objectCountsAgg, impactAgg] = await Promise.all([
            // 1. Get total students and teachers
            User.aggregate([
                { $match: { 'profile.state': state } },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 2. Get distinct districts and schools
            User.aggregate([
                { $match: { 'profile.state': state, 'profile.school': { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: null,
                        districts: { $addToSet: '$profile.district' },
                        schools: { $addToSet: '$profile.school' }
                    }
                }
            ]),
            // 3. Get total impact and EcoPoints
            User.aggregate([
                { $match: { role: 'student', 'profile.state': state } },
                {
                    $group: {
                        _id: null,
                        totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
                        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
                        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' }
                    }
                }
            ])
        ]);

        let totalStudents = 0;
        let totalTeachers = 0;
        userStatsAgg.forEach(c => {
            if (c._id === 'student') totalStudents = c.count;
            if (c._id === 'teacher') totalTeachers = c.count;
        });

        const totalDistricts = objectCountsAgg.length > 0 ? objectCountsAgg[0].districts.length : 0;
        const totalSchools = objectCountsAgg.length > 0 ? objectCountsAgg[0].schools.length : 0;
        const impact = impactAgg.length > 0 ? impactAgg[0] : { totalEcoPoints: 0, co2Prevented: 0, treesPlanted: 0, waterSaved: 0, plasticReduced: 0 };

        const responseData = {
            stateName: state,
            totalDistricts,
            totalSchools,
            totalStudents,
            totalTeachers,
            totalEcoPoints: impact.totalEcoPoints,
            totalImpact: {
                co2Prevented: impact.co2Prevented,
                treesPlanted: impact.treesPlanted,
                waterSaved: impact.waterSaved,
                plasticReduced: impact.plasticReduced
            }
        };

        await cacheService.set(cacheKey, responseData, 300, 'admin-dashboards');

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('State Admin getDashboard error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get aggregate list of districts in state
// @route   GET /api/state-admin/districts
// @access  Private/StateAdmin
exports.getDistricts = async (req, res) => {
    try {
        const state = await getAdminStateScope(req);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_DISTRICTS',
            resourceScope: `state:${state}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const districtsAgg = await User.aggregate([
            { $match: { 'profile.state': state, role: 'student', 'profile.district': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$profile.district',
                    studentCount: { $sum: 1 },
                    totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                    co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                    schools: { $addToSet: '$profile.school' }
                }
            },
            {
                $project: {
                    districtName: '$_id',
                    studentCount: 1,
                    totalEcoPoints: 1,
                    co2Prevented: 1,
                    schoolCount: { $size: '$schools' }
                }
            },
            { $sort: { totalEcoPoints: -1 } }
        ]);

        res.json({
            success: true,
            count: districtsAgg.length,
            data: districtsAgg
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get detailed impact metrics for state
// @route   GET /api/state-admin/impact
// @access  Private/StateAdmin
exports.getImpactMetrics = async (req, res) => {
    try {
        const state = await getAdminStateScope(req);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_IMPACT',
            resourceScope: `state:${state}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const impactAgg = await User.aggregate([
            { $match: { role: 'student', 'profile.state': state } },
            {
                $group: {
                    _id: null,
                    co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                    treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
                    waterSaved: { $sum: '$environmentalImpact.waterSaved' },
                    plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
                    energySaved: { $sum: '$environmentalImpact.energySaved' },
                    totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' }
                }
            }
        ]);

        const data = impactAgg.length > 0 ? impactAgg[0] : {
            co2Prevented: 0, treesPlanted: 0, waterSaved: 0, plasticReduced: 0, energySaved: 0, totalActivities: 0
        };
        delete data._id;

        res.json({
            success: true,
            data
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
