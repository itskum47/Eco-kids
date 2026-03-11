const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const AdminAuditLog = require('../models/AdminAuditLog');
const AuditLog = require('../models/AuditLog');

const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');

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
            return res.json({ success: true, data: cachedData, cached: true });
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

        res.json({ success: true, data: responseData, cached: false });

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

        res.json({
            success: true,
            count: schoolsAgg.length,
            data: schoolsAgg
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

        const impactAgg = await User.aggregate([
            { $match: { role: 'student', 'profile.state': state, 'profile.district': district } },
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

        // 1. Calculate total VEI (weighted environmental impact score)
        const veiAgg = await User.aggregate([
            { $match: { role: 'student', 'profile.state': state, 'profile.district': district } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    co2: { $sum: '$environmentalImpact.co2Prevented' },
                    trees: { $sum: '$environmentalImpact.treesPlanted' },
                    water: { $sum: '$environmentalImpact.waterSaved' },
                    plastic: { $sum: '$environmentalImpact.plasticReduced' },
                    energy: { $sum: '$environmentalImpact.energySaved' },
                    activities: { $sum: '$environmentalImpact.activitiesCompleted' },
                    totalEP: { $sum: '$gamification.ecoPoints' }
                }
            }
        ]);

        // 2. Count Active Students (at least 1 approved submission in last 30 days)
        const activeStudentIds = await ActivitySubmission.distinct('user', {
            status: 'approved',
            verifiedAt: { $gte: thirtyDaysAgo }
        });

        // Filter to only students in this district
        const activeInDistrict = await User.countDocuments({
            _id: { $in: activeStudentIds },
            role: 'student',
            'profile.state': state,
            'profile.district': district
        });

        const veiData = veiAgg.length > 0 ? veiAgg[0] : {
            totalStudents: 0, co2: 0, trees: 0, water: 0, plastic: 0, energy: 0, activities: 0, totalEP: 0
        };

        // VEI Score = weighted composite (CO2*10 + Trees*5 + Water*2 + Plastic*3 + Energy*2)
        const veiScore = (veiData.co2 * 10) + (veiData.trees * 5) + (veiData.water * 2) + (veiData.plastic * 3) + (veiData.energy * 2);
        const asm = activeInDistrict;
        const veiPerAsm = asm > 0 ? Math.round((veiScore / asm) * 100) / 100 : 0;

        res.json({
            success: true,
            data: {
                veiScore,
                activeStudentsMonthly: asm,
                veiPerAsm,
                totalStudents: veiData.totalStudents,
                totalEcoPoints: veiData.totalEP,
                totalActivities: veiData.activities,
                breakdown: {
                    co2Prevented: veiData.co2,
                    treesPlanted: veiData.trees,
                    waterSaved: veiData.water,
                    plasticReduced: veiData.plastic,
                    energySaved: veiData.energy
                },
                calculatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('VEI/ASM calculation error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
