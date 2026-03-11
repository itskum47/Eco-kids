const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const School = require('../models/School');
const asyncHandler = require('../middleware/async');

// @desc    Government reporting data (NEP 2020 + SDG alignment)
// @route   GET /api/reports/government
exports.governmentReport = asyncHandler(async (req, res) => {
    const { state, district, startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const locationFilter = {};
    if (state) locationFilter['profile.state'] = state;
    if (district) locationFilter['profile.district'] = district;

    const [userMetrics, activityMetrics, schoolCount] = await Promise.all([
        User.aggregate([
            { $match: { role: 'student', isActive: true, ...locationFilter } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                    avgLevel: { $avg: '$gamification.level' },
                    totalTreesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
                    totalCO2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
                    totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' },
                    totalPlasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
                    totalEnergySaved: { $sum: '$environmentalImpact.energySaved' },
                    totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' },
                }
            },
        ]),
        ActivitySubmission.aggregate([
            { $match: { status: 'approved', ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) } },
            {
                $group: {
                    _id: '$activityType',
                    count: { $sum: 1 },
                }
            },
        ]),
        School.countDocuments(state ? { 'location.state': state } : {}),
    ]);

    const metrics = userMetrics[0] || {};

    const report = {
        generatedAt: new Date().toISOString(),
        period: { startDate: startDate || 'inception', endDate: endDate || 'present' },
        scope: { state: state || 'all', district: district || 'all' },

        nep2020Alignment: {
            experientialLearning: true,
            environmentalAwareness: true,
            communityEngagement: metrics.totalActivities > 0,
            digitalLiteracy: true,
            localContentIntegration: true,
        },

        sdgMapping: {
            'SDG 4 - Quality Education': { aligned: true, evidence: `${metrics.totalStudents || 0} students engaged in environmental learning` },
            'SDG 13 - Climate Action': { aligned: true, evidence: `${(metrics.totalCO2Prevented || 0).toFixed(1)}kg CO₂ prevented` },
            'SDG 15 - Life on Land': { aligned: true, evidence: `${metrics.totalTreesPlanted || 0} trees planted` },
        },

        impactMetrics: {
            schoolsOnboarded: schoolCount,
            activeStudents: metrics.totalStudents || 0,
            activitiesCompleted: metrics.totalActivities || 0,
            treesPlanted: metrics.totalTreesPlanted || 0,
            co2PreventedKg: parseFloat((metrics.totalCO2Prevented || 0).toFixed(1)),
            waterSavedLiters: parseFloat((metrics.totalWaterSaved || 0).toFixed(1)),
            plasticReducedKg: parseFloat((metrics.totalPlasticReduced || 0).toFixed(1)),
            energySavedKwh: parseFloat((metrics.totalEnergySaved || 0).toFixed(1)),
        },

        activityBreakdown: activityMetrics.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {}),

        averageStudentLevel: parseFloat((metrics.avgLevel || 0).toFixed(1)),
        totalEcoPoints: metrics.totalEcoPoints || 0,
    };

    // CSV export
    if (req.query.format === 'csv') {
        const rows = [
            ['Metric', 'Value'],
            ['Schools Onboarded', report.impactMetrics.schoolsOnboarded],
            ['Active Students', report.impactMetrics.activeStudents],
            ['Activities Completed', report.impactMetrics.activitiesCompleted],
            ['Trees Planted', report.impactMetrics.treesPlanted],
            ['CO2 Prevented (kg)', report.impactMetrics.co2PreventedKg],
            ['Water Saved (L)', report.impactMetrics.waterSavedLiters],
            ['Plastic Reduced (kg)', report.impactMetrics.plasticReducedKg],
            ['Energy Saved (kWh)', report.impactMetrics.energySavedKwh],
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename=ecokids-government-report-${Date.now()}.csv`);
        return res.send(csv);
    }

    res.json({ success: true, data: report });
});

// @desc    Grant application data package
// @route   GET /api/reports/grant-application
exports.grantApplication = asyncHandler(async (req, res) => {
    const [totalStudents, totalSchools, totalActivities] = await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        School.countDocuments(),
        ActivitySubmission.countDocuments({ status: 'approved' }),
    ]);

    const impactAgg = await User.aggregate([
        { $match: { role: 'student' } },
        {
            $group: {
                _id: null,
                co2: { $sum: '$environmentalImpact.co2Prevented' },
                trees: { $sum: '$environmentalImpact.treesPlanted' },
                water: { $sum: '$environmentalImpact.waterSaved' },
            }
        },
    ]);

    const impact = impactAgg[0] || {};

    res.json({
        success: true,
        data: {
            platformName: 'EcoKids India',
            type: 'Gamified Environmental Education Platform',
            alignment: ['NEP 2020', 'SDG 4', 'SDG 13', 'SDG 15', 'DPDP Act 2023'],
            reach: {
                schools: totalSchools,
                students: totalStudents,
                verifiedActivities: totalActivities,
            },
            environmentalImpact: {
                co2PreventedKg: parseFloat((impact.co2 || 0).toFixed(1)),
                treesPlanted: impact.trees || 0,
                waterSavedLiters: parseFloat((impact.water || 0).toFixed(1)),
            },
            technology: {
                stack: 'React + Node.js + MongoDB + Redis',
                compliance: ['DPDP Act 2023', 'COPPA-aligned', 'Parental consent'],
                infrastructure: ['PWA', 'Offline-capable', 'Low-bandwidth optimized'],
            },
            generatedAt: new Date().toISOString(),
        },
    });
});
