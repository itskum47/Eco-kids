require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const School = require('../models/School');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids';

const schoolsSeed = [
  { name: 'DPS Delhi', schoolCode: 'DPS-DEL', district: 'New Delhi', state: 'Delhi', city: 'Delhi', schoolType: 'Private', board: 'CBSE', principalName: 'Dr. Ramesh Kumar' },
  { name: 'KV Mumbai', schoolCode: 'KV-MUM', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai', schoolType: 'KV', board: 'CBSE', principalName: 'Mrs. Sunita Jain' },
  { name: 'DAV Chandigarh', schoolCode: 'DAV-CHD', district: 'Chandigarh', state: 'Chandigarh', city: 'Chandigarh', schoolType: 'Private', board: 'CBSE', principalName: 'Mr. Gurpreet Singh' },
  { name: "St. Mary's Chennai", schoolCode: 'STM-CHN', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai', schoolType: 'Private', board: 'ICSE', principalName: 'Sr. Mary Thomas' },
  { name: 'Navodaya Bengaluru', schoolCode: 'NAV-BLR', district: 'Bengaluru', state: 'Karnataka', city: 'Bengaluru', schoolType: 'Navodaya', board: 'State Board', principalName: 'Mr. Venkat Rao' },
];

const teacherNames = [
  ['Priya Sharma', 'Science'],
  ['Rajesh Gupta', 'Geography'],
  ['Anita Verma', 'EVS'],
];

const randomEcoPoints = () => Math.floor(50 + Math.random() * 451);
const randomPhone = () => `98${Math.floor(10000000 + Math.random() * 89999999)}`;

const ensureUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email });
  if (existing) return { user: existing, created: false, password: payload.password };
  const user = await User.create(payload);
  return { user, created: true, password: payload.password };
};

const syncScopedProfile = async (email, schoolMeta) => {
  await User.updateOne(
    { email },
    {
      $set: {
        'profile.state': schoolMeta.state,
        'profile.district': schoolMeta.district,
        'profile.school': schoolMeta.name
      }
    }
  );
};

const run = async () => {
  const credentials = [];
  let createdCount = 0;

  try {
    await mongoose.connect(MONGODB_URI);

    const schoolMap = {};
    for (const s of schoolsSeed) {
      let school = await School.findOne({ $or: [{ schoolCode: s.schoolCode }, { code: s.schoolCode }] });
      if (!school) {
        school = await School.create({
          name: s.name,
          district: s.district,
          state: s.state,
          city: s.city,
          board: s.board,
          schoolType: s.schoolType,
          principalName: s.principalName,
          schoolCode: s.schoolCode,
          code: s.schoolCode,
        });
      }
      schoolMap[s.schoolCode] = school;
    }

    for (const s of schoolsSeed) {
      const slug = s.schoolCode.toLowerCase();
      const school = schoolMap[s.schoolCode];

      for (let grade = 1; grade <= 12; grade += 1) {
        for (const sec of ['a', 'b']) {
          const email = `student.g${grade}${sec}@${slug}.ecokids.in`;
          const result = await ensureUser({
            name: `Student G${grade}${sec.toUpperCase()} ${s.name}`,
            email,
            password: 'EcoKids@123',
            role: 'student',
            grade: String(grade),
            section: sec.toUpperCase(),
            rollNumber: `${grade}${sec.toUpperCase()}`,
            schoolCode: s.schoolCode,
            parentPhone: randomPhone(),
            firstLogin: false,
            ecoCoins: randomEcoPoints(),
            gamification: {
              ecoPoints: randomEcoPoints(),
              badges: [{ badgeId: 'eco-starter', name: 'EcoStarter', earnedAt: new Date() }],
            },
            profile: {
              grade: String(grade),
              school: s.name,
              schoolId: school._id,
            },
          });
          if (result.created) createdCount += 1;
          await syncScopedProfile(email, s);
          credentials.push({ email, password: 'EcoKids@123', role: 'student' });
        }
      }

      for (let i = 0; i < teacherNames.length; i += 1) {
        const [name, subject] = teacherNames[i];
        const email = `teacher${i + 1}@${slug}.ecokids.in`;
        const result = await ensureUser({
          name,
          email,
          password: 'Teacher@123',
          role: 'teacher',
          schoolCode: s.schoolCode,
          profile: { school: s.name, schoolId: school._id, bio: subject },
        });
        if (result.created) createdCount += 1;
        await syncScopedProfile(email, s);
        credentials.push({ email, password: 'Teacher@123', role: 'teacher' });
      }

      const adminEmail = `admin@${slug}.ecokids.in`;
      const adminResult = await ensureUser({
        name: s.principalName,
        email: adminEmail,
        password: 'Admin@123',
        role: 'school_admin',
        schoolCode: s.schoolCode,
        profile: { school: s.name, schoolId: school._id },
      });
      if (adminResult.created) createdCount += 1;
      await syncScopedProfile(adminEmail, s);
      credentials.push({ email: adminEmail, password: 'Admin@123', role: 'school_admin' });

      for (const sec of ['a', 'b']) {
        const email = `parent.g6${sec}@${slug}.ecokids.in`;
        const result = await ensureUser({
          name: `Parent G6${sec.toUpperCase()} ${s.name}`,
          email,
          password: 'Parent@123',
          role: 'student',
          linkedStudentEmail: `student.g6${sec}@${slug}.ecokids.in`,
          schoolCode: s.schoolCode,
          profile: { school: s.name, schoolId: school._id },
        });
        if (result.created) createdCount += 1;
        await syncScopedProfile(email, s);
        credentials.push({ email, password: 'Parent@123', role: 'parent-linked' });
      }
    }

    const globalAccounts = [
      {
        email: 'district.admin@ecokids.in',
        password: 'District@123',
        role: 'district_admin',
        name: 'District Admin',
        profile: { state: 'Delhi', district: 'New Delhi' }
      },
      {
        email: 'state.admin@ecokids.in',
        password: 'State@123',
        role: 'state_admin',
        name: 'State Admin',
        profile: { state: 'Delhi' }
      },
      { email: 'superadmin@ecokids.in', password: 'SuperAdmin@123', role: 'admin', name: 'Super Admin' },
    ];

    for (const item of globalAccounts) {
      const result = await ensureUser({
        name: item.name,
        email: item.email,
        password: item.password,
        role: item.role,
        ...(item.profile ? { profile: item.profile } : {})
      });

      // Keep scope fields in sync for existing accounts created before this fix.
      if (item.profile) {
        await User.updateOne(
          { email: item.email },
          {
            $set: {
              'profile.state': item.profile.state,
              ...(item.profile.district ? { 'profile.district': item.profile.district } : {})
            }
          }
        );
      }
      if (result.created) createdCount += 1;
      credentials.push({ email: item.email, password: item.password, role: item.role });
    }

    console.log(`Created/updated credentials: ${credentials.length}`);
    console.log(`Newly created users in this run: ${createdCount}`);
    console.table(credentials);
  } catch (error) {
    console.error('seed-demo-users failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
