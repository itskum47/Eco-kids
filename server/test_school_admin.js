const mongoose = require('mongoose');

async function runTest() {
    console.log('🧪 Starting Phase 3B School Admin Portal E2E Test...');
    try {
        const baseUrl = 'http://localhost:5001/api';

        await mongoose.connect('mongodb://localhost:27017/ecokids');
        const User = require('./models/User');

        // 1. Setup School Admin Account
        const adminEmail = `verify.admin.${Date.now()}@school.edu`;
        const aRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Principal Skinner',
                email: adminEmail,
                password: 'Password123!',
                role: 'student' // register as student first, we'll force the role
            })
        });
        const aData = await aRes.json();

        // Force role and school via mongo to bypass auth controller limitations
        await User.updateOne({ email: adminEmail }, {
            $set: { 'profile.school': 'Springfield Elementary', role: 'school_admin' }
        });

        // Re-login to get updated JWT
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'Password123!' })
        });
        const { token: adminToken } = await loginRes.json();
        console.log('✅ Created School Admin for Springfield Elementary');

        // 2. Fetch Dashboard
        const dashRes = await fetch(`${baseUrl}/school-admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (!dashRes.ok) throw new Error(`Dashboard fetch failed: ${await dashRes.text()}`);
        const dashData = await dashRes.json();
        console.log(`✅ Fetched Dashboard. Found ${dashData.data.totalStudents} students and ${dashData.data.totalTeachers} teachers.`);

        // 3. Fetch Students List
        const stdsRes = await fetch(`${baseUrl}/school-admin/students`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const stdsData = await stdsRes.json();
        console.log(`✅ Fetched Students list: ${stdsData.count} returned on page 1`);

        // 4. Verify RBAC Isolation
        console.log('🔒 Testing RBAC Role Isolation...');

        // Setup a "student" dummy user
        const studentDummyRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Hacker Student',
                email: `hacker.${Date.now()}@school.edu`,
                password: 'Password123!',
                role: 'student'
            })
        });
        const hackerData = await studentDummyRes.json();
        const hackerToken = hackerData.token;

        const rbacRes = await fetch(`${baseUrl}/school-admin/dashboard`, {
            headers: { Authorization: `Bearer ${hackerToken}` }
        });

        if (rbacRes.status !== 403) {
            throw new Error(`Security Failure: Student was able to access School Admin dashboard! Status: ${rbacRes.status}`);
        }
        console.log('✅ RBAC isolated access successfully. Student access denied with 403 Forbidden.');

        console.log('🎉 ALL PHASE 3B VERIFICATION TESTS PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTest();
