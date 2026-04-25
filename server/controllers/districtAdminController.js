const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const AdminAuditLog = require('../models/AdminAuditLog');
const AuditLog = require('../models/AuditLog');

const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responseEnvelope');
const {
    getDistrictImpactSummary,
    getDistrictVeiAsm,
} = require('../services/reportingMetricsService');

// Helper to ensure admin has valid district scope
const getAdminDistrictScope = async (req) => {
    const admin = await User.findById(req.user.id).select('profile');
    if (!admin || !admin.profile || !admin.profile.state || !admin.profile.district) {
        throw new Error('Admin district or state scope is not completely defined');
    }
    return { state: admin.profile.state, district: admin.profile.district };
};

// @desc    Get dashboard metrics for district
// @route   GET /api/district-admin/dashboard
// @access  Private/DistrictAdmin
exports.getDashboard = async (req, res) => {
    try {
        const { state, district } = await getAdminDistrictScope(req);
        const cacheKey = `district-dashboard:${state}:${district}`;

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_DASHBOARD',
            resourceScope: `district:${state}:${district}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        // 2. Check Redis Cache
        const cachedData = await cacheService.get(cacheKey, 'admin-dashboards');
        if (cachedData) {
            logger.info(`[Redis] District Dashboard loaded strictly from Cache for ${district}`);
            return sendSuccess(res, { data: cachedData, meta: { cached: true } });
        }

        const [userStatsAgg, schoolCountAgg, impactAgg] = await Promise.all([
            // 1. Get total students and teachers
            User.aggregate([
                { $match: { 'profile.state': state, 'profile.district': district } },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 2. Get distinct schools
            User.aggregate([
                { $match: { 'profile.state': state, 'profile.district': district, 'profile.school': { $exists: true, $ne: '' } } },
                { $group: { _id: '$profile.school' } },
                { $count: "count" }
            ]),
            // 3. Get total impact and EcoPoints
            User.aggregate([
                { $match: { role: 'student', 'profile.state': state, 'profile.district': district } },
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

        const totalSchools = schoolCountAgg.length > 0 ? schoolCountAgg[0].count : 0;
        const impact = impactAgg.length > 0 ? impactAgg[0] : { totalEcoPoints: 0, co2Prevented: 0, treesPlanted: 0, waterSaved: 0, plasticReduced: 0 };

        const responseData = {
            districtName: district,
            stateName: state,
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

        // Write to Redis
        await cacheService.set(cacheKey, responseData, 300, 'admin-dashboards');

        sendSuccess(res, { data: responseData, meta: { cached: false } });

    } catch (error) {
        console.error('District Admin getDashboard error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get aggregate list of schools in district
// @route   GET /api/district-admin/schools
// @access  Private/DistrictAdmin
exports.getSchools = async (req, res) => {
    try {
        const { state, district } = await getAdminDistrictScope(req);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_SCHOOLS',
            resourceScope: `district:${state}:${district}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const schoolsAgg = await User.aggregate([
            { $match: { 'profile.state': state, 'profile.district': district, role: 'student', 'profile.school': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$profile.school',
                    schoolId: { $first: '$profile.schoolId' }, // For UDISE code column
                    studentCount: { $sum: 1 },
                    totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                    co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                    waterSaved: { $sum: '$environmentalImpact.waterSaved' },
                    energySaved: { $sum: '$environmentalImpact.energySaved' },
                    plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
                    totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' }
                }
            },
            { $sort: { totalEcoPoints: -1 } }
        ]);

        sendSuccess(res, {
            data: {
                count: schoolsAgg.length,
                rows: schoolsAgg
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get detailed impact metrics for district
// @route   GET /api/district-admin/impact
// @access  Private/DistrictAdmin
exports.getImpactMetrics = async (req, res) => {
    try {
        const { state, district } = await getAdminDistrictScope(req);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_IMPACT',
            resourceScope: `district:${state}:${district}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const data = await getDistrictImpactSummary({ state, district });

        sendSuccess(res, { data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get VEI/ASM North Star Metric (Verified Environmental Impact per Active Student per Month)
// @route   GET /api/district-admin/vei-asm
// @access  Private/DistrictAdmin
exports.getVeiAsm = async (req, res) => {
    try {
        const { state, district } = await getAdminDistrictScope(req);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_VEI_ASM',
            resourceScope: `district:${state}:${district}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const veiData = await getDistrictVeiAsm({ state, district, thirtyDaysAgo });

        sendSuccess(res, {
            data: {
                ...veiData
            }
        });

    } catch (error) {
        logger.error('VEI/ASM calculation error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
