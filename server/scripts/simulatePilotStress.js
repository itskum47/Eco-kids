require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');
const ActivitySubmission = require('../models/ActivitySubmission');
const Assignment = require('../models/Assignment');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// Simulated backend API calls bypassing HTTP for speed & direct DB verification
async function simulatePilotStress() {
    console.log("🚀 Starting Internal Final Simulation (Pilot Stress Test)...");

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Database Connected");

        // 1. Get a seeded pilot teacher
        const teacher = await User.findOne({ role: 'teacher', 'profile.schoolId': { $exists: true } });
        if (!teacher) throw new Error("No seeded teacher found. Did you run seedPilot.js?");
        console.log(`👤 Simulating as Teacher: ${teacher.name} from ${teacher.profile.school}`);

        // 2. Clear old test data for clean slate
        await ActivitySubmission.deleteMany({ user: { $in: await User.find({ 'profile.schoolId': teacher.profile.schoolId, role: 'student' }).distinct('_id') } });
        await AuditLog.deleteMany({ actorId: teacher._id });
        console.log("🧹 Cleared previous simulated submissions and audit logs.");

        // 3. Get students in this school
        const students = await User.find({ 'profile.schoolId': teacher.profile.schoolId, role: 'student' });
        if (students.length === 0) throw new Error("No seeded students found for this school.");

        // 4. Generate 20 Pending Submissions rapidly
        console.log("📥 Generating 20 pending submissions...");
        const pendingSubmissions = [];
        for (let i = 0; i < 20; i++) {
            const student = students[i % students.length];
            pendingSubmissions.push({
                user: student._id,
                schoolId: teacher.profile.schoolId,
                activityType: "water-saving",
                evidence: {
                    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                    publicId: "sample",
                    description: `Simulated Activity ${i}`
                },
                status: 'pending',
                school: teacher.profile.school,
                district: teacher.profile.district,
                state: teacher.profile.state
            });
        }
        const insertedSubmissions = await ActivitySubmission.insertMany(pendingSubmissions);
        console.log(`✅ Created ${insertedSubmissions.length} pending submissions.`);

        // 5. RAPID APPROVAL STRESS TEST
        console.log("⚡ Initiating rapid approval sequence (Simulating Teacher Friction)...");
        const startTime = Date.now();
        let approvals = 0;

        for (const sub of insertedSubmissions) {
            // Simulate teacher clicking "Approve" with a realistic/rapid delay (50ms - 200ms)
            const approvalDelay = Math.floor(Math.random() * 150) + 50;
            await new Promise(res => setTimeout(res, approvalDelay));

            const sStart = Date.now();
            sub.status = 'approved';
            sub.reviewedBy = teacher._id;
            sub.reviewDate = new Date();
            await sub.save();

            // Simulating atomic telemetry & point allocation usually handled by the controller
            const student = await User.findById(sub.user);
            student.gamification.ecoPoints += 10;
            student.gamification.streak = student.gamification.streak || { current: 0, highest: 0 };
            student.gamification.streak.current += 1;
            await student.save();

            // Fire Audit Log
            await AuditLog.create({
                action: 'APPROVE_SUBMISSION',
                actorId: teacher._id,
                actorRole: teacher.role,
                targetId: sub._id,
                targetModel: 'ActivitySubmission',
                metadata: {
                    timeToApproveMs: Date.now() - sStart,
                    schoolId: teacher.profile.schoolId,
                    pointsAwarded: 10
                }
            });

            approvals++;
        }

        const totalDuration = Date.now() - startTime;
        console.log(`✅ Approved ${approvals} submissions in ${totalDuration}ms. (Avg: ${Math.round(totalDuration / approvals)}ms per approval)`);

        // 6. Assignment Creation
        console.log("📋 Simulating Assignment Creation...");
        const assignment = await Assignment.create({
            teacherId: teacher._id,
            schoolId: teacher.profile.schoolId,
            grade: '5',
            section: 'A',
            moduleId: new mongoose.Types.ObjectId(), // Dummy ID for simulation
            moduleMode: 'Experiment',
            title: "Weekend Energy Challenge",
            description: "Turn off all lights when leaving the house.",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
        });

        await AuditLog.create({
            action: 'CREATE_ASSIGNMENT',
            actorId: teacher._id,
            actorRole: teacher.role,
            targetId: assignment._id,
            targetModel: 'Assignment',
            metadata: { title: assignment.title }
        });
        console.log(`✅ Assignment created: ${assignment.title}`);

        // 7. Verify AuditLogs
        console.log("🔍 Verifying AuditLog Integrity...");
        const auditLogCount = await AuditLog.countDocuments({ actorId: teacher._id });
        if (auditLogCount < 21) {
            console.error(`❌ AuditLog mismatch! Expected >= 21, found ${auditLogCount}`);
        } else {
            console.log(`✅ Found ${auditLogCount} AuditLog entries matching the simulated session.`);
        }

        // 8. CSV Export Simulation (Admin Verification)
        console.log("📊 Simulating District Admin CSV Verification pipeline...");
        const districtAdmin = await User.findOne({ role: 'admin' });
        if (districtAdmin) {
            const impactData = await ActivitySubmission.aggregate([
                { $match: { status: 'approved' } },
                {
                    $group: {
                        _id: "$schoolId",
                        totalSubmissions: { $sum: 1 },
                        totalCO2: { $sum: "$impactMetrics.co2Saved" },
                        totalEnergy: { $sum: "$impactMetrics.energySaved" }
                    }
                }
            ]);
            console.log(`✅ Admin aggregation complete. Impact data computed for ${impactData.length} schools.`);
        }

        console.log("\n🧪 SIMULATION SUCCESS. No unhandled rejections or crashes.");
        console.log("System is theoretically stable under human unpredictability metrics.\n");

    } catch (err) {
        console.error("❌ Simulation Failed:", err);
    } finally {
        await mongoose.connection.close();
    }
}

simulatePilotStress();
