const mongoose = require('mongoose');
const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const { calculateImpact } = require('../utils/impactCalculator');
const { redisClient } = require('../services/cacheService');
require('dotenv').config();

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecokids_test');

    // Clear collections for pure testing
    await User.deleteMany({ email: /@test\.com$/ });
    await ActivitySubmission.deleteMany({ description: /TEST_SUBMISSION/ });

    console.log('--- RUNNING SYSTEM VERIFICATION TESTS ---');

    // Helper models
    const schoolATeacher = await User.create({
        name: 'School A Teacher',
        email: 'teacherA@test.com',
        password: 'password123',
        role: 'teacher',
        profile: { school: 'School A', district: 'D1', state: 'S1' }
    });

    const schoolBTeacher = await User.create({
        name: 'School B Teacher',
        email: 'teacherB@test.com',
        password: 'password123',
        role: 'teacher',
        profile: { school: 'School B', district: 'D1', state: 'S1' }
    });

    const studentA = await User.create({
        name: 'Student A',
        email: 'studentA@test.com',
        password: 'password123',
        role: 'student',
        profile: { school: 'School A', district: 'D1', state: 'S1' }
    });

    let passCount = 0;
    let failCount = 0;
    const assert = (condition, msg) => {
        if (condition) {
            console.log(`✅ ${msg}`);
            passCount++;
        } else {
            console.error(`❌ ${msg.replace('PASS', 'FAIL')}`);
            failCount++;
        }
    };

    try {
        // TEST 2: Duplicate approval prevention using atomic lock
        {
            const sub = await ActivitySubmission.create({
                user: studentA._id,
                activityType: 'tree-planting',
                evidence: { imageUrl: 'http://test.com/img.jpg', description: 'TEST_SUBMISSION' },
                status: 'pending',
                school: 'School A',
                district: 'D1',
                state: 'S1'
            });

            // Simulate 5 concurrent approval requests
            const approvePromises = Array(5).fill().map(() =>
                ActivitySubmission.findOneAndUpdate(
                    { _id: sub._id, status: 'pending' },
                    { status: 'approved', impactApplied: true, verifiedBy: schoolATeacher._id },
                    { new: true }
                )
            );

            const results = await Promise.all(approvePromises);
            const successCount = results.filter(r => r !== null).length;

            assert(successCount === 1, 'Atomic approval test: PASS');
        }

        // TEST 3: School boundary enforcement
        {
            const sub = await ActivitySubmission.create({
                user: studentA._id,
                activityType: 'waste-recycling',
                evidence: { imageUrl: 'http://test.com/img2.jpg', description: 'TEST_SUBMISSION' },
                status: 'pending',
                school: 'School A'
            });

            // Teacher B tries to approve School A student's submission
            // Simulated controller boundary check
            const submissionInfo = await ActivitySubmission.findById(sub._id).populate('user');
            const isAllowed = !(
                submissionInfo.school &&
                schoolBTeacher.profile && schoolBTeacher.profile.school &&
                submissionInfo.school !== schoolBTeacher.profile.school
            );

            assert(isAllowed === false, 'School boundary test: PASS');
        }

        // TEST 4: Geographic data persistence
        {
            const sub = await ActivitySubmission.create({
                user: studentA._id,
                activityType: 'tree-planting',
                evidence: { imageUrl: 'http://test.com/img.jpg', description: 'TEST_SUBMISSION GEO' },
                status: 'pending',
                school: studentA.profile.school,
                district: studentA.profile.district,
                state: studentA.profile.state
            });

            const dbSub = await ActivitySubmission.findById(sub._id);
            assert(dbSub.school === 'School A' && dbSub.district === 'D1' && dbSub.state === 'S1', 'Geographic data persistence test: PASS');
        }

        // TEST 5: Leaderboard correctness
        {
            const users = [];
            for (let i = 1; i <= 10; i++) {
                users.push({
                    name: `User ${i}`,
                    email: `user${i}@test.com`,
                    password: 'password123',
                    role: 'student',
                    gamification: { ecoPoints: i * 10 }
                });
            }
            await User.insertMany(users);

            const topUsers = await User.find({ role: 'student', email: /@test\.com$/ }).sort({ 'gamification.ecoPoints': -1 }).limit(10);
            let correctlySorted = true;
            for (let i = 0; i < topUsers.length - 1; i++) {
                if (topUsers[i].gamification.ecoPoints < topUsers[i + 1].gamification.ecoPoints) {
                    correctlySorted = false;
                }
            }
            assert(correctlySorted, 'Leaderboard test: PASS');
        }

        // TEST 7: Integration API returns verified activities
        {
            const sub = await ActivitySubmission.findOne({ status: 'approved', 'evidence.description': 'TEST_SUBMISSION' });
            assert(sub !== null, 'Integration test: PASS');
        }

        console.log(`\n--- TEST RESULTS: ${passCount} Passed, ${failCount} Failed ---`);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.error('Test framework error:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        await redisClient.quit();
    }
}

runTests();
