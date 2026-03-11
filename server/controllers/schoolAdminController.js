const User = require('../models/User');
const School = require('../models/School');
const ActivitySubmission = require('../models/ActivitySubmission');
const AdminAuditLog = require('../models/AdminAuditLog');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../services/smsService');

// Simple Memory Cache for heavy aggregations
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function setCache(key, value) {
    cache.set(key, {
        value,
        expiry: Date.now() + CACHE_TTL
    });
}

// Helper to ensure admin has a school
const getAdminSchool = async (req) => {
    const admin = await User.findById(req.user.id).select('profile');
    if (!admin || !admin.profile || !admin.profile.school) {
        throw new Error('Admin school is not completely defined');
    }
    return admin.profile.school;
};

// @desc    Get dashboard metrics for school
// @route   GET /api/school-admin/dashboard
// @access  Private/SchoolAdmin
exports.getDashboard = async (req, res) => {
    try {
        const school = await getAdminSchool(req);
        const cacheKey = `school-dashboard:${school}`;

        // Async audit logging (don't block the response)
        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_DASHBOARD',
            resourceScope: `school:${school}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        const cachedData = getCached(cacheKey);
        if (cachedData) {
            return res.json({ success: true, data: cachedData, cached: true });
        }

        const [userCounts, impactAgg, activityCount, leaderboardAgg] = await Promise.all([
            // 1. Get total students and teachers
            User.aggregate([
                { $match: { 'profile.school': school } },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 2. Get total impact and EcoPoints for the school specifically
            User.aggregate([
                { $match: { role: 'student', 'profile.school': school } },
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
            ]),
            // 3. Get total activities for the school
            ActivitySubmission.aggregate([
                { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
                { $unwind: '$userInfo' },
                { $match: { 'userInfo.profile.school': school } },
                { $count: "count" }
            ]),
            // 4. Calculate School Leaderboard Rank globally
            User.aggregate([
                { $match: { role: 'student', 'profile.school': { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: '$profile.school',
                        totalEcoPoints: { $sum: '$gamification.ecoPoints' }
                    }
                },
                { $sort: { totalEcoPoints: -1 } },
                // Use denseRank or standard index mapping; simplistically mapping in Javascript after small payload
            ])
        ]);

        // Format Counts
        let totalStudents = 0;
        let totalTeachers = 0;
        userCounts.forEach(c => {
            if (c._id === 'student') totalStudents = c.count;
            if (c._id === 'teacher') totalTeachers = c.count;
        });

        const totalActivities = activityCount.length > 0 ? activityCount[0].count : 0;

        // Format Impact
        const impact = impactAgg.length > 0 ? impactAgg[0] : { totalEcoPoints: 0, co2Prevented: 0, treesPlanted: 0, waterSaved: 0, plasticReduced: 0 };

        // Format Leaderboard Position
        let leaderboardPosition = 0;
        const rankIndex = leaderboardAgg.findIndex(s => s._id === school);
        if (rankIndex !== -1) {
            leaderboardPosition = rankIndex + 1;
        }

        // Determine recent activity count (e.g. last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivityCount = await ActivitySubmission.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
            { $unwind: '$userInfo' },
            { $match: { 'userInfo.profile.school': school } },
            { $count: "count" }
        ]);

        const responseData = {
            schoolName: school,
            totalStudents,
            totalTeachers,
            totalActivities,
            totalEcoPoints: impact.totalEcoPoints,
            totalImpact: {
                co2Prevented: impact.co2Prevented,
                treesPlanted: impact.treesPlanted,
                waterSaved: impact.waterSaved,
                plasticReduced: impact.plasticReduced
            },
            leaderboardPosition,
            recentActivityCount: recentActivityCount.length > 0 ? recentActivityCount[0].count : 0
        };

        setCache(cacheKey, responseData);

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('School Admin getDashboard error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all students in school
// @route   GET /api/school-admin/students
// @access  Private/SchoolAdmin
exports.getStudents = async (req, res) => {
    try {
        const school = await getAdminSchool(req);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const query = { role: 'student', 'profile.school': school };

        const students = await User.find(query)
            .select('name email profile.grade gamification active createdAt')
            .skip(startIndex)
            .limit(limit)
            .sort({ 'gamification.ecoPoints': -1 }); // Rank by default

        const total = await User.countDocuments(query);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_STUDENTS',
            resourceScope: `school:${school}`,
            details: { page, limit },
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        res.json({
            success: true,
            count: students.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: students
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all teachers in school
// @route   GET /api/school-admin/teachers
// @access  Private/SchoolAdmin
exports.getTeachers = async (req, res) => {
    try {
        const school = await getAdminSchool(req);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const query = { role: 'teacher', 'profile.school': school };

        const teachers = await User.find(query)
            .select('name email active createdAt')
            .skip(startIndex)
            .limit(limit)
            .sort({ name: 1 });

        const total = await User.countDocuments(query);

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_TEACHERS',
            resourceScope: `school:${school}`,
            details: { page, limit },
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        res.json({
            success: true,
            count: teachers.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: teachers
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get detailed impact metrics for school
// @route   GET /api/school-admin/impact
// @access  Private/SchoolAdmin
exports.getImpactMetrics = async (req, res) => {
    try {
        const school = await getAdminSchool(req);

        const impactAgg = await User.aggregate([
            { $match: { role: 'student', 'profile.school': school } },
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

        AdminAuditLog.create({
            adminId: req.user.id,
            action: 'VIEW_IMPACT',
            resourceScope: `school:${school}`,
            ipAddress: req.ip
        }).catch(err => console.error('Audit Log Error:', err.message));

        res.json({
            success: true,
            data
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get school leaderboard position globally
// @route   GET /api/school-admin/leaderboard-position
// @access  Private/SchoolAdmin
exports.getLeaderboardPosition = async (req, res) => {
    try {
        const school = await getAdminSchool(req);

        const leaderboardAgg = await User.aggregate([
            { $match: { role: 'student', 'profile.school': { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$profile.school',
                    totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                    totalCO2: { $sum: '$environmentalImpact.co2Prevented' }
                }
            },
            { $sort: { totalEcoPoints: -1 } }
        ]);

        let position = 0;
        const index = leaderboardAgg.findIndex(s => s._id === school);
        let schoolData = leaderboardAgg[index];

        if (index !== -1) {
            position = index + 1;
        } else {
            schoolData = { totalEcoPoints: 0, totalCO2: 0 };
        }

        res.json({
            success: true,
            data: {
                schoolName: school,
                position,
                totalSchools: leaderboardAgg.length,
                points: schoolData.totalEcoPoints,
                co2: schoolData.totalCO2
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get activity verification metrics
// @route   GET /api/school-admin/activity-metrics
// @access  Private/SchoolAdmin
exports.getActivityMetrics = async (req, res) => {
    try {
        const school = await getAdminSchool(req);

        const metricsAgg = await ActivitySubmission.aggregate([
            // 1. Join user to get the school
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
            { $unwind: '$userInfo' },
            // 2. Filter by this admin's school
            { $match: { 'userInfo.profile.school': school } },
            // 3. Group by status
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        let pending = 0;
        let approved = 0;
        let rejected = 0;

        metricsAgg.forEach(m => {
            if (m._id === 'pending') pending = m.count;
            if (m._id === 'approved') approved = m.count;
            if (m._id === 'rejected') rejected = m.count;
        });

        const totalProcessed = approved + rejected;
        const approvalRate = totalProcessed > 0 ? ((approved / totalProcessed) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                pending,
                approved,
                rejected,
                approvalRate: parseFloat(approvalRate)
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const school = await getAdminSchool(req);
        const { name, email, grade, section, rollNumber, parentPhone, parentEmail } = req.body;
        const password = `Eco@${rollNumber}`;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Student already exists with this email' });
        }

        const student = await User.create({
            name,
            email,
            password,
            role: 'student',
            section,
            rollNumber,
            parentPhone,
            parentEmail,
            firstLogin: true,
            profile: {
                school,
                grade: String(grade),
                section,
            }
        });

        await sendSms({
            phone: String(parentPhone || '').replace(/\D/g, '').slice(-10),
            message: `Welcome to EcoKids! Your child ${name} is registered. Login: ${email} Password: ${password} - EcoKids India`
        });

        return res.status(201).json({
            success: true,
            email,
            password,
            studentId: student._id
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.bulkCreateStudents = async (req, res) => {
    try {
        const school = await getAdminSchool(req);
        const csv = req.file?.buffer?.toString('utf8') || '';
        if (!csv.trim()) {
            return res.status(400).json({ success: false, message: 'CSV file is required' });
        }

        const [headerLine, ...rows] = csv.split(/\r?\n/).filter(Boolean);
        const headers = headerLine.split(',').map((h) => h.trim());
        const required = ['name', 'email', 'grade', 'section', 'rollNumber', 'parentPhone'];
        const missingHeaders = required.filter((h) => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return res.status(400).json({ success: false, message: `Missing CSV columns: ${missingHeaders.join(', ')}` });
        }

        let created = 0;
        let failed = 0;
        const errors = [];

        for (const row of rows) {
            const cols = row.split(',').map((c) => c.trim());
            const payload = headers.reduce((acc, h, idx) => ({ ...acc, [h]: cols[idx] || '' }), {});
            const password = `Eco@${payload.rollNumber}`;

            try {
                const exists = await User.findOne({ email: payload.email });
                if (exists) {
                    failed += 1;
                    errors.push({ email: payload.email, reason: 'Already exists' });
                    continue;
                }

                await User.create({
                    name: payload.name,
                    email: payload.email,
                    password,
                    role: 'student',
                    section: payload.section,
                    rollNumber: payload.rollNumber,
                    parentPhone: payload.parentPhone,
                    firstLogin: true,
                    profile: {
                        school,
                        grade: String(payload.grade),
                        section: payload.section,
                    }
                });

                created += 1;
            } catch (error) {
                failed += 1;
                errors.push({ email: payload.email, reason: error.message });
            }
        }

        return res.json({ success: true, created, failed, errors });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.generateQrForStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const token = jwt.sign(
            { studentId: student._id.toString(), type: 'qr-login' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const loginUrl = `https://ecokids.in/qr-login?token=${token}`;
        const qrCode = await QRCode.toDataURL(loginUrl);

        return res.json({ success: true, qrCode, token, loginUrl });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
