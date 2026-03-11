const mongoose = require('mongoose');

async function runTest() {
    console.log('🧪 Starting Phase 3A Teacher Operational Portal E2E Test...');
    try {
        const baseUrl = 'http://localhost:5001/api';

        // 1. Create Teacher
        const tRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Verify Teacher',
                email: `verify.teacher.${Date.now()}@school.edu`,
                password: 'Password123!',
                role: 'teacher'
            })
        });

        if (!tRes.ok) throw new Error(`Teacher creation failed: ${await tRes.text()}`);
        const tData = await tRes.json();
        const teacherToken = tData.token;

        await mongoose.connect('mongodb://localhost:27017/ecokids');
        const User = require('./models/User');
        const ActivitySubmission = require('./models/ActivitySubmission');

        const teacherEmail = tData.user.email;
        await User.updateOne({ email: teacherEmail }, {
            $set: { 'profile.school': 'Springfield Elementary', active: true, role: 'teacher' }
        });
        console.log('✅ Created and configured Teacher account');

        // Re-login to get updated JWT with 'teacher' role
        const tLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: teacherEmail, password: 'Password123!' })
        });
        const tLoginData = await tLoginRes.json();
        const teacherTokenUpdated = tLoginData.token;

        // 2. Create Student in same school
        const studentEmail = `verify.student.${Date.now()}@school.edu`;
        const sRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Verify Student',
                email: studentEmail,
                password: 'Password123!',
                role: 'student',
                age: 12,
                grade: '6'
            })
        });

        if (!sRes.ok) throw new Error(`Student creation failed: ${await sRes.text()}`);
        const sData = await sRes.json();
        const studentToken = sData.token;
        const studentId = sData.user._id;

        await User.updateOne({ email: studentEmail }, {
            $set: { 'profile.school': 'Springfield Elementary' }
        });
        console.log('✅ Created Student account in same school');

        // 3. Submit Activity as student
        const subRes = await fetch(`${baseUrl}/activity/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                activityType: 'tree-planting',
                description: 'Planted an oak tree in my test backyard',
                location: 'Backyard',
                date: new Date().toISOString(),
                imageUrl: 'https://example.com/tree.jpg'
            })
        });

        if (!subRes.ok) throw new Error(`Student submission failed: ${await subRes.text()}`);
        const subData = await subRes.json();
        const submissionId = subData.data._id;
        console.log('✅ Student submitted activity [ID:', submissionId, ']');

        // 4. Get Teacher Pending Submissions
        const pendingRes = await fetch(`${baseUrl}/teacher/submissions/pending`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${teacherTokenUpdated}` }
        });

        if (!pendingRes.ok) throw new Error(`Failed to fetch pending queue: ${await pendingRes.text()}`);
        const pendingData = await pendingRes.json();
        console.log(`✅ Teacher retrieved pending submissions Queue: ${pendingData.count} items found`);

        const foundSub = pendingData.data.find(s => s._id === submissionId);
        if (!foundSub) throw new Error('Submission not found in teacher queue!');

        // 5. Teacher Approves Submission
        const approveRes = await fetch(`${baseUrl}/teacher/submissions/${submissionId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherTokenUpdated}`
            }
        });

        if (!approveRes.ok) throw new Error(`Approval failed: ${await approveRes.text()}`);
        const approveData = await approveRes.json();
        console.log('✅ Teacher successfully approved submission! Response Status:', approveData.data.status);

        // 6. Verify Gamification triggers
        const verifyRes = await fetch(`${baseUrl}/gamification/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });

        if (!verifyRes.ok) throw new Error(`Verify gamification failed: ${await verifyRes.text()}`);
        const verifyData = await verifyRes.json();
        console.log('✅ Verified Gamification for Student:');
        console.log('   - EcoPoints:', verifyData.data.ecoPoints);
        console.log('   - Level:', verifyData.data.level);

        if (verifyData.data.ecoPoints === 0) {
            throw new Error('Gamification points were not awarded properly on approval!');
        }

        console.log('🎉 ALL PHASE 3A VERIFICATION TESTS PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTest();
