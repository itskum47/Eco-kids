const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const { creditReward, rollbackReward } = require('../utils/ecoPointsManager');
const { checkAndAwardBadges } = require('../utils/badgeEngine');
const { checkLevelUp } = require('../utils/levelEngine');
const { incrementMissionProgress } = require('./missionController');
const rewardValues = require('../constants/rewardValues');
const AuditLog = require('../models/AuditLog');
const { calculateImpact } = require('../utils/impactCalculator');
const mongoose = require('mongoose');
const { gamificationQueue } = require('../queues/gamificationQueue');

// @desc    Get pending submissions for teacher's school
// @route   GET /api/teacher/submissions/pending
// @access  Private/Teacher
exports.getPendingSubmissions = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await User.findById(teacherId);

        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        // Find all pending submissions where the student's school matches the teacher's school
        const pendingSubmissions = await ActivitySubmission.find({ status: 'pending' })
            .populate({
                path: 'user',
                select: 'name profile.school profile.grade',
                match: { 'profile.school': teacher.profile.school }
            })
            .sort({ createdAt: -1 });

        // Filter out submissions where the populated user is null (didn't match school)
        const filteredSubmissions = pendingSubmissions.filter(sub => sub.user !== null);

        res.json({
            success: true,
            count: filteredSubmissions.length,
            data: filteredSubmissions
        });
    } catch (error) {
        console.error('Teacher getPendingSubmissions error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving pending submissions.' });
    }
};

// @desc    Approve an activity submission
// @route   PUT /api/teacher/submissions/:id/approve
// @desc    Update a submission status (approve/reject)
// @route   PATCH /api/teacher/submissions/:id
// @access  Private/Teacher
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await User.findById(teacherId);

        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }

        let submission = await ActivitySubmission.findById(id).populate('user');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        if (!submission.user || submission.user.profile.school !== teacher.profile.school) {
            return res.status(403).json({ success: false, message: 'Not authorized to update for this student.' });
        }

        if (submission.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Submission is already ${submission.status}` });
        }

        submission.status = status;
        submission.verifiedBy = teacherId;
        submission.verifiedAt = Date.now();
        submission.verificationNotes = req.body.notes || `${status === 'approved' ? 'Approved' : 'Rejected'} by teacher.`;

        if (status === 'approved') {
            const studentId = submission.user._id;

            if (!submission.impactApplied) {
                const impact = calculateImpact(submission.activityType);

                await User.findByIdAndUpdate(studentId, {
                    $inc: {
                        'environmentalImpact.treesPlanted': impact.treesPlanted || 0,
                        'environmentalImpact.co2Prevented': impact.co2Prevented || 0,
                        'environmentalImpact.waterSaved': impact.waterSaved || 0,
                        'environmentalImpact.plasticReduced': impact.plasticReduced || 0,
                        'environmentalImpact.energySaved': impact.energySaved || 0,
                        'environmentalImpact.activitiesCompleted': 1
                    }
                });

                submission.impactApplied = true;

                // Idempotent reward credit — deterministic key prevents double-crediting
                await creditReward({
                    userId: studentId,
                    points: rewardValues.ACTIVITY_APPROVED,
                    reason: 'Activity submission approved by teacher',
                    idempotencyKey: `${studentId}:${submission._id}:ACTIVITY_APPROVED`,
                    sourceId: submission._id,
                    sourceModel: 'ActivitySubmission',
                    action: 'EP_CREDIT'
                });

                await checkLevelUp(studentId);
                await checkAndAwardBadges(studentId);

                // Non-blocking mission progress increment
                incrementMissionProgress(studentId, 'submit_activity', submission.activityType)
                    .catch(err => console.error('Mission progress error:', err));
            }
        }

        await submission.save();

        // Audit Trailing (Non-blocking)
        AuditLog.create({
            actorId: teacherId,
            actorRole: 'teacher',
            action: status === 'approved' ? 'APPROVED_SUBMISSION' : 'REJECTED_SUBMISSION',
            targetType: 'SUBMISSION',
            targetId: submission._id,
            ipAddress: req.ip,
            metadata: {
                studentId: submission.user._id,
                activityType: submission.activityType,
                timeTakenMs: req.body.timeTakenMs || 0
            }
        }).catch(err => console.error('Silent AuditLog Error:', err));

        res.json({
            success: true,
            message: `Submission ${status} successfully.`,
            data: submission
        });
    } catch (error) {
        console.error('Teacher updateSubmissionStatus error:', error);
        res.status(500).json({ success: false, message: 'Server error updating submission.' });
    }
};

// @desc    Get all students for teacher's school
// @route   GET /api/teacher/students
// @access  Private/Teacher
exports.getTeacherStudents = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        const students = await User.find({
            role: 'student',
            'profile.school': teacher.profile.school
        }).select('name email profile.grade gamification.ecoPoints gamification.level gamification.streak active status');

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Teacher getStudents error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving students.' });
    }
}

// @desc    Get teacher class impact (aggregated)
// @route   GET /api/teacher/class-impact
// @access  Private/Teacher
exports.getClassImpact = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        const agg = await User.aggregate([
            { $match: { role: 'student', 'profile.school': teacher.profile.school } },
            {
                $group: {
                    _id: null,
                    totalEcoPoints: { $sum: '$gamification.ecoPoints' },
                    totalLevel: { $sum: '$gamification.level' },
                    totalTrees: { $sum: '$environmentalImpact.treesPlanted' },
                    totalCo2: { $sum: '$environmentalImpact.co2Prevented' },
                    totalWater: { $sum: '$environmentalImpact.waterSaved' },
                    totalPlastic: { $sum: '$environmentalImpact.plasticReduced' },
                    totalEnergy: { $sum: '$environmentalImpact.energySaved' },
                    totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' },
                    studentCount: { $sum: 1 }
                }
            }
        ]);

        const impact = agg.length > 0 ? agg[0] : null;

        res.json({
            success: true,
            data: impact || {
                totalEcoPoints: 0, totalTrees: 0, totalCo2: 0,
                totalWater: 0, totalPlastic: 0, totalEnergy: 0,
                totalActivities: 0, studentCount: 0
            }
        });
    } catch (error) {
        console.error('Teacher class impact error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving class impact.' });
    }
}

// @desc    Get Teacher Dashboard KPIs
// @route   GET /api/teacher/dashboard
// @access  Private/Teacher
exports.getTeacherDashboard = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        const school = teacher.profile.school;

        const [studentsCount, pendingApprovalsCount] = await Promise.all([
            User.countDocuments({ role: 'student', 'profile.school': school }),
            // More complex count for submissions: need to join or assume since submission has user refs,
            // easiest way is to find submissions that populate a matching user and filter, or denormalize school on submission.
            // Since we didn't denormalize school on ActivitySubmission in Phase 1, we fetch all pending and filter in memory.
            // In production at massive scale, we should add school to ActivitySubmission schema, but this works for 100k scale efficiently if handled via aggregate.
            ActivitySubmission.aggregate([
                { $match: { status: 'pending' } },
                { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
                { $unwind: '$userInfo' },
                { $match: { 'userInfo.profile.school': school } },
                { $count: "count" }
            ])
        ]);

        const agg = await User.aggregate([
            { $match: { role: 'student', 'profile.school': school } },
            { $group: { _id: null, totalEcoPoints: { $sum: '$gamification.ecoPoints' } } }
        ]);

        res.json({
            success: true,
            data: {
                studentsCount,
                pendingApprovalsCount: pendingApprovalsCount.length > 0 ? pendingApprovalsCount[0].count : 0,
                totalClassEcoPoints: agg.length > 0 ? agg[0].totalEcoPoints : 0
            }
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving dashboard KPIs.' });
    }
}

// @desc    Assign a module to a class/grade
// @route   POST /api/teacher/assignments
// @access  Private/Teacher
exports.createAssignment = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher || !teacher.profile || !teacher.profile.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        const Assignment = require('../models/Assignment');
        const { grade, section = 'A', moduleId, moduleMode, title, description, dueDate, deadline, fileUrl } = req.body;
        const normalizedGrade = String(grade || '').trim();
        const normalizedDueDate = dueDate || deadline;

        if (!title || !description || !normalizedGrade || !normalizedDueDate) {
            return res.status(400).json({ success: false, message: 'title, description, grade and dueDate are required.' });
        }

        if (new Date(normalizedDueDate) <= new Date()) {
            return res.status(400).json({ success: false, message: 'Due date must be a future date.' });
        }

        const students = await User.find({
            role: 'student',
            'profile.school': teacher.profile.school,
            'profile.grade': normalizedGrade
        }).select('_id');

        const assignment = await Assignment.create({
            teacherId: req.user.id,
            schoolId: teacher.profile.school, // strict binding to teacher's school
            grade: normalizedGrade,
            section,
            moduleId,
            moduleMode,
            title,
            description,
            deadline: normalizedDueDate,
            dueDate: normalizedDueDate,
            fileUrl,
            recipients: students.map((student) => ({
                studentId: student._id,
                status: 'pending'
            }))
        });

        // 🛡 Audit Trailing (Non-blocking)
        AuditLog.create({
            actorId: req.user.id,
            actorRole: 'teacher',
            action: 'CREATED_ASSIGNMENT',
            targetType: 'TASK',
            targetId: assignment._id,
            ipAddress: req.ip,
            metadata: { title, moduleId, grade: normalizedGrade }
        }).catch(err => console.error('Silent AuditLog Error:', err));

        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error creating assignment.' });
    }
}

// @desc    Get assignments for a teacher
// @route   GET /api/teacher/assignments
// @access  Private/Teacher
exports.getAssignments = async (req, res) => {
    try {
        const Assignment = require('../models/Assignment');
        const assignments = await Assignment.find({ teacherId: req.user.id }).sort('-createdAt').lean();
        const enriched = assignments.map((assignment) => {
            const recipients = Array.isArray(assignment.recipients) ? assignment.recipients : [];
            const completedStudents = recipients.filter((item) => item.status === 'submitted').length;
            return {
                ...assignment,
                dueDate: assignment.dueDate || assignment.deadline,
                metrics: {
                    totalStudents: recipients.length,
                    completedStudents
                }
            };
        });
        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving assignments.' });
    }
}

exports.batchApproveActivities = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { submissionIds, decision } = req.body;

        if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
            return res.status(400).json({ success: false, message: 'submissionIds must be a non-empty array' });
        }

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: "decision must be 'approved' or 'rejected'" });
        }

        const teacher = await User.findById(req.user.id).select('profile.school');
        if (!teacher?.profile?.school) {
            return res.status(400).json({ success: false, message: 'Teacher school not defined.' });
        }

        session.startTransaction();

        const submissions = await ActivitySubmission.find({
            _id: { $in: submissionIds },
            status: 'pending'
        })
            .populate('user', 'profile.school')
            .session(session);

        if (submissions.length !== submissionIds.length) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'One or more submissions are missing or not pending' });
        }

        const unauthorized = submissions.some((submission) => submission.user?.profile?.school !== teacher.profile.school);
        if (unauthorized) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: 'Cannot update submissions outside your school' });
        }

        const now = new Date();

        await ActivitySubmission.updateMany(
            { _id: { $in: submissionIds } },
            {
                $set: {
                    status: decision,
                    verifiedBy: req.user.id,
                    reviewedBy: req.user.id,
                    reviewedAt: now,
                    impactApplied: decision === 'approved'
                }
            },
            { session }
        );

        await session.commitTransaction();

        if (decision === 'approved') {
            const uniqueUserIds = [...new Set(submissions.map((submission) => submission.user?._id?.toString()).filter(Boolean))];
            await Promise.all(
                uniqueUserIds.map((userId) => gamificationQueue.add('check-badges', { userId }))
            );
        }

        return res.status(200).json({
            success: true,
            message: `Batch ${decision} completed`,
            data: {
                updatedCount: submissionIds.length,
                decision
            }
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error('Teacher batchApproveActivities error:', error);
        return res.status(500).json({ success: false, message: 'Server error in batch approval' });
    } finally {
        await session.endSession();
    }
};
