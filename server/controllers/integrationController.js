const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const AdminAuditLog = require('../models/AdminAuditLog');
const { Parser } = require('json2csv');

/**
 * Helper to log integration queries into the AdminAuditLog
 * Ensures regulatory compliance for external access bounds.
 */
const logIntegrationAccess = async (integrationKey, endpoint, ipAddress, scopeUsed) => {
    await AdminAuditLog.create({
        organization: integrationKey.organization, // The organization associated with the API key
        action: 'INTEGRATION_ACCESS',
        resourceScope: scopeUsed,
        details: {
            endpoint,
            keyName: integrationKey.name,
            boundScope: integrationKey.scope
        },
        ipAddress
    });
};

/**
 * Builds the secure MongoDB match pipeline enforcing strict API Key scope limits.
 * Keys cannot escalate beyond their bounded state/district limit.
 */
const buildScopeMatch = (integrationKey, requestedQuery = {}) => {
    const match = { ...requestedQuery };
    match.active = true;

    if (integrationKey.scope === 'state') {
        match['profile.state'] = integrationKey.state;
    } else if (integrationKey.scope === 'district') {
        match['profile.state'] = integrationKey.state;
        match['profile.district'] = integrationKey.district;
    }
    // If 'national', no explicit limit is injected, queries the entire subset

    return match;
};

// @desc    Get macro-state aggregated JSON telemetry
// @route   GET /api/integration/state-summary
// @access  Integration (National, State)
exports.getStateImpactSummary = async (req, res) => {
    try {
        if (req.integrationKey.scope === 'district') {
            return res.status(403).json({ success: false, message: 'Scope violation. Key cannot aggregate state-wide metrics.' });
        }

        // Force constraints (e.g., if State key, they must strictly view their own State, not others)
        const matchQuery = buildScopeMatch(req.integrationKey, { role: 'student' });
        if (req.query.state && req.integrationKey.scope === 'national') {
            matchQuery['profile.state'] = req.query.state;
        }

        const impact = await User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$profile.state",
                    totalStudents: { $sum: 1 },
                    schools: { $addToSet: "$profile.school" },
                    co2Prevented: { $sum: "$environmentalImpact.co2Prevented" },
                    treesPlanted: { $sum: "$environmentalImpact.treesPlanted" },
                    waterSaved: { $sum: "$environmentalImpact.waterSaved" },
                    plasticReduced: { $sum: "$environmentalImpact.plasticReduced" },
                    energySaved: { $sum: "$environmentalImpact.energySaved" },
                    activitiesCompleted: { $sum: "$gamification.activitiesCompleted" }
                }
            },
            {
                $project: {
                    state: "$_id",
                    totalStudents: 1,
                    totalSchools: { $size: "$schools" },
                    co2Prevented: 1,
                    treesPlanted: 1,
                    waterSaved: 1,
                    plasticReduced: 1,
                    energySaved: 1,
                    activitiesCompleted: 1,
                    _id: 0
                }
            }
        ]);

        await logIntegrationAccess(req.integrationKey, '/state-summary', req.ip, JSON.stringify(matchQuery));

        res.status(200).json({ success: true, data: impact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Aggregation failed' });
    }
};

// @desc    Get district aggregated JSON telemetry
// @route   GET /api/integration/district-summary
// @access  Integration (All Scopes)
exports.getDistrictImpactSummary = async (req, res) => {
    try {
        const matchQuery = buildScopeMatch(req.integrationKey, { role: 'student' });
        if (req.query.district && req.integrationKey.scope !== 'district') {
            matchQuery['profile.district'] = req.query.district;
        }

        const impact = await User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { district: "$profile.district", state: "$profile.state" },
                    totalStudents: { $sum: 1 },
                    schools: { $addToSet: "$profile.school" },
                    co2Prevented: { $sum: "$environmentalImpact.co2Prevented" },
                    treesPlanted: { $sum: "$environmentalImpact.treesPlanted" },
                    waterSaved: { $sum: "$environmentalImpact.waterSaved" },
                    plasticReduced: { $sum: "$environmentalImpact.plasticReduced" },
                    energySaved: { $sum: "$environmentalImpact.energySaved" },
                    activitiesCompleted: { $sum: "$gamification.activitiesCompleted" }
                }
            },
            {
                $project: {
                    district: "$_id.district",
                    state: "$_id.state",
                    totalStudents: 1,
                    totalSchools: { $size: "$schools" },
                    co2Prevented: 1,
                    treesPlanted: 1,
                    waterSaved: 1,
                    plasticReduced: 1,
                    energySaved: 1,
                    activitiesCompleted: 1,
                    _id: 0
                }
            }
        ]);

        await logIntegrationAccess(req.integrationKey, '/district-summary', req.ip, JSON.stringify(matchQuery));

        res.status(200).json({ success: true, data: impact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Aggregation failed' });
    }
};

// @desc    Get school aggregated JSON telemetry
// @route   GET /api/integration/school-summary
// @access  Integration (All Scopes)
exports.getSchoolImpactSummary = async (req, res) => {
    try {
        const matchQuery = buildScopeMatch(req.integrationKey, { role: 'student' });
        if (req.query.school) {
            matchQuery['profile.school'] = req.query.school;
        }

        const impact = await User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { school: "$profile.school", district: "$profile.district", state: "$profile.state" },
                    totalStudents: { $sum: 1 },
                    co2Prevented: { $sum: "$environmentalImpact.co2Prevented" },
                    treesPlanted: { $sum: "$environmentalImpact.treesPlanted" },
                    waterSaved: { $sum: "$environmentalImpact.waterSaved" },
                    plasticReduced: { $sum: "$environmentalImpact.plasticReduced" },
                    energySaved: { $sum: "$environmentalImpact.energySaved" },
                    activitiesCompleted: { $sum: "$gamification.activitiesCompleted" }
                }
            },
            {
                $project: {
                    school: "$_id.school",
                    district: "$_id.district",
                    state: "$_id.state",
                    totalStudents: 1,
                    co2Prevented: 1,
                    treesPlanted: 1,
                    waterSaved: 1,
                    plasticReduced: 1,
                    energySaved: 1,
                    activitiesCompleted: 1,
                    _id: 0
                }
            }
        ]);

        await logIntegrationAccess(req.integrationKey, '/school-summary', req.ip, JSON.stringify(matchQuery));

        res.status(200).json({ success: true, data: impact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Aggregation failed' });
    }
};

// @desc    Get 100% verified isolated activities
// @route   GET /api/integration/verified-activities
// @access  Integration (All Scopes)
exports.getVerifiedActivities = async (req, res) => {
    try {
        // Only fetch globally approved + verified pipeline data for integrations
        const matchQuery = { status: 'approved', impactApplied: true };

        // Bind API Key constraints
        if (req.integrationKey.scope === 'state') {
            matchQuery.state = req.integrationKey.state;
        } else if (req.integrationKey.scope === 'district') {
            matchQuery.state = req.integrationKey.state;
            matchQuery.district = req.integrationKey.district;
        }

        const limit = parseInt(req.query.limit, 10) || 100;

        const activities = await ActivitySubmission.find(matchQuery)
            .select('-rejectionReason -__v') // Clean output format
            .sort({ createdAt: -1 })
            .limit(Math.min(limit, 1000));   // Hard ceiling for payloads

        await logIntegrationAccess(req.integrationKey, '/verified-activities', req.ip, JSON.stringify(matchQuery));

        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Activity extraction failed' });
    }
};

// @desc    Export a formatted structural CSV of impact arrays
// @route   GET /api/integration/export/csv
// @access  Integration (All Scopes)
exports.exportImpactCSV = async (req, res) => {
    try {
        const matchQuery = buildScopeMatch(req.integrationKey, { role: 'student' });

        const impact = await User.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { school: "$profile.school", district: "$profile.district", state: "$profile.state" },
                    co2Prevented: { $sum: "$environmentalImpact.co2Prevented" },
                    treesPlanted: { $sum: "$environmentalImpact.treesPlanted" },
                    waterSaved: { $sum: "$environmentalImpact.waterSaved" }
                }
            },
            {
                $project: {
                    school: "$_id.school",
                    district: "$_id.district",
                    state: "$_id.state",
                    co2Prevented: 1,
                    treesPlanted: 1,
                    waterSaved: 1,
                    _id: 0
                }
            }
        ]);

        await logIntegrationAccess(req.integrationKey, '/export/csv', req.ip, JSON.stringify(matchQuery));

        // Convert JS Array to CSV
        if (!impact || impact.length === 0) {
            return res.status(404).json({ success: false, message: 'No bounded boundary data found for export' });
        }

        const fields = ['school', 'district', 'state', 'co2Prevented', 'treesPlanted', 'waterSaved'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(impact);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${req.integrationKey.organization.replace(/\s+/g, '_')}_Impact_Export.csv`);
        return res.status(200).send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'CSV extraction pipeline failure' });
    }
};
