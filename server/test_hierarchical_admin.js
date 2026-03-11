const mongoose = require('mongoose');
const User = require('./models/User');
const EcoPointsManager = require('./utils/ecoPointsManager');
require('dotenv').config();

// We will use standard fetch with generic endpoints
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/ecokids', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

async function createHierarchy() {
    console.log('🧪 Starting Phase 3C E2E Verification Script...');
    await connectDB();

    // Clear existing Phase 3C seeds
    await User.deleteMany({ email: { $regex: 'testing3c' } });

    // 1. Create State Admin (State: Punjab)
    const stateAdmin = await User.create({
        name: 'State Admin Punjab',
        email: 'state_admin@testing3c.com',
        password: 'password123',
        role: 'state_admin',
        profile: {
            state: 'Punjab'
        },
        active: true
    });
    console.log('✅ State Admin created');

    // 2. Create District Admins (Districts: Ludhiana, Amritsar)
    const ludhianaAdmin = await User.create({
        name: 'District Admin Ludhiana',
        email: 'ludhiana_admin@testing3c.com',
        password: 'password123',
        role: 'district_admin',
        profile: {
            state: 'Punjab',
            district: 'Ludhiana'
        },
        active: true
    });

    const amritsarAdmin = await User.create({
        name: 'District Admin Amritsar',
        email: 'amritsar_admin@testing3c.com',
        password: 'password123',
        role: 'district_admin',
        profile: {
            state: 'Punjab',
            district: 'Amritsar'
        },
        active: true
    });
    console.log('✅ District Admins created (Ludhiana, Amritsar)');

    // 3. Create Schools (Ludhiana: School A, School B | Amritsar: School C)
    const seedStudent = async (name, state, district, school, points) => {
        const student = await User.create({
            name,
            email: `${name.replace(/\s+/g, '')}@testing3c.com`,
            password: 'password123',
            role: 'student',
            profile: { state, district, school },
            active: true
        });
        // Add points via direct update to avoid dependency issues in verification script
        await User.updateOne({ _id: student._id }, {
            $inc: { 'gamification.ecoPoints': points }
        });
        return student;
    };

    await seedStudent('Ludhiana Student 1', 'Punjab', 'Ludhiana', 'School A', 100);
    await seedStudent('Ludhiana Student 2', 'Punjab', 'Ludhiana', 'School B', 50);
    await seedStudent('Amritsar Student 1', 'Punjab', 'Amritsar', 'School C', 200);
    console.log('✅ Students seeded explicitly into hierarchical bounds');

    console.log('⏳ Attempting Login and API resolution...');

    // Helper login function
    const login = async (email) => {
        const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' })
        });
        const data = await res.json();
        return data.token;
    };

    // 4. Test State Admin View
    const stateToken = await login('state_admin@testing3c.com');
    let res = await fetch('http://localhost:5001/api/state-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${stateToken}` }
    });
    let stateRes = await res.json();
    if (!stateRes.success || stateRes.data.totalStudents !== 3 || stateRes.data.totalDistricts !== 2) {
        console.error('❌ State Admin Hierarchy fetch failed bounding box scope.', stateRes);
        process.exit(1);
    } else {
        console.log('✅ State Admin sees exactly 3 students and 2 districts across all bounds');
    }

    // 5. Test District Admin (Ludhiana) View 
    const ludhianaToken = await login('ludhiana_admin@testing3c.com');
    res = await fetch('http://localhost:5001/api/district-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${ludhianaToken}` }
    });
    let distRes = await res.json();
    if (!distRes.success || distRes.data.totalStudents !== 2 || distRes.data.totalSchools !== 2) {
        console.error('❌ District Admin Ludhiana leaked bounding box scope.', distRes);
        process.exit(1);
    } else {
        console.log('✅ District Admin (Ludhiana) isolated strictly to 2 students and 2 schools');
    }

    // 6. Test District Admin (Amritsar) View 
    const amritsarToken = await login('amritsar_admin@testing3c.com');
    res = await fetch('http://localhost:5001/api/district-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${amritsarToken}` }
    });
    distRes = await res.json();
    if (!distRes.success || distRes.data.totalStudents !== 1 || distRes.data.totalSchools !== 1) {
        console.error('❌ District Admin Amritsar leaked bounding box scope.', distRes);
        process.exit(1);
    } else {
        console.log('✅ District Admin (Amritsar) isolated strictly to 1 student and 1 school');
    }

    // 7. Verify Caching is Active (2nd request should be instant and flagged as cached)
    res = await fetch('http://localhost:5001/api/district-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${amritsarToken}` }
    });
    distRes = await res.json();
    if (!distRes.cached) {
        console.error('❌ Cache did not trigger on subsequent fetch');
        process.exit(1);
    } else {
        console.log('✅ 5-minute Memory Cache triggered correctly intercepting DB call');
    }

    console.log('🎉 ALL PHASE 3C VERIFICATION TESTS PASSED!');
    process.exit(0);
}

createHierarchy().catch(e => {
    console.error(e);
    process.exit(1);
});
