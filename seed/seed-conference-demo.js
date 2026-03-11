const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../server/.env') });
dotenv.config();

const User = require('../server/models/User');
const School = require('../server/models/School');
const ActivitySubmission = require('../server/models/ActivitySubmission');
const ActivityFeed = require('../server/models/ActivityFeed');
const SchoolAggregate = require('../server/models/SchoolAggregate');
const ParentalConsent = require('../server/models/ParentalConsent');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids-india';
const DEMO_PASSWORD = 'Demo@123';

const ACTIVITY_TYPES = [
  'tree-planting',
  'waste-recycling',
  'water-saving',
  'energy-saving',
  'plastic-reduction',
  'composting',
  'biodiversity-survey'
];

const ACTIVITY_POINTS = {
  'tree-planting': 35,
  'waste-recycling': 22,
  'water-saving': 18,
  'energy-saving': 20,
  'plastic-reduction': 24,
  'composting': 28,
  'biodiversity-survey': 26
};

const SCHOOLS = [
  {
    name: 'Greenfield Public School, Rohini',
    district: 'North West Delhi',
    state: 'Delhi',
    code: 'DEL-NWD-1001',
    principalContact: {
      name: 'Dr. Meera Khanna',
      email: 'principal.greenfield@demo.ecokids.in',
      phone: '9899001001'
    }
  },
  {
    name: 'Sarvodaya Bal Vidyalaya, Dwarka',
    district: 'South West Delhi',
    state: 'Delhi',
    code: 'DEL-SWD-1002',
    principalContact: {
      name: 'Mr. Arvind Rana',
      email: 'principal.sarvodaya@demo.ecokids.in',
      phone: '9899001002'
    }
  },
  {
    name: 'Delhi Model Senior Secondary School, Lajpat Nagar',
    district: 'South East Delhi',
    state: 'Delhi',
    code: 'DEL-SED-1003',
    principalContact: {
      name: 'Ms. Nandita Roy',
      email: 'principal.model@demo.ecokids.in',
      phone: '9899001003'
    }
  }
];

const ACCOUNTS = [
  {
    key: 'state_admin',
    name: 'State Admin Delhi',
    email: 'stateadmin@demo.ecokids.in',
    role: 'state_admin',
    schoolIndex: 0,
    profile: { city: 'New Delhi', district: 'Central Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'district_admin',
    name: 'District Admin Delhi',
    email: 'districtadmin@demo.ecokids.in',
    role: 'district_admin',
    schoolIndex: 0,
    profile: { city: 'New Delhi', district: 'North West Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'school_admin',
    name: 'School Admin Greenfield',
    email: 'schooladmin@demo.ecokids.in',
    role: 'school_admin',
    schoolIndex: 0,
    profile: { city: 'Delhi', district: 'North West Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'teacher_1',
    name: 'Ritu Sharma',
    email: 'teacher1@demo.ecokids.in',
    role: 'teacher',
    schoolIndex: 0,
    profile: { city: 'Delhi', district: 'North West Delhi', state: 'Delhi', language: 'english', bio: 'Eco-club coordinator' }
  },
  {
    key: 'teacher_2',
    name: 'Faizan Ali',
    email: 'teacher2@demo.ecokids.in',
    role: 'teacher',
    schoolIndex: 1,
    profile: { city: 'Delhi', district: 'South West Delhi', state: 'Delhi', language: 'english', bio: 'Science educator' }
  },
  {
    key: 'student_1',
    name: 'Aarav Singh',
    email: 'student1@demo.ecokids.in',
    role: 'student',
    schoolIndex: 0,
    profile: { grade: '6', city: 'Delhi', district: 'North West Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_2',
    name: 'Diya Kapoor',
    email: 'student2@demo.ecokids.in',
    role: 'student',
    schoolIndex: 0,
    profile: { grade: '7', city: 'Delhi', district: 'North West Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_3',
    name: 'Kabir Mehta',
    email: 'student3@demo.ecokids.in',
    role: 'student',
    schoolIndex: 1,
    profile: { grade: '8', city: 'Delhi', district: 'South West Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_4',
    name: 'Ananya Iyer',
    email: 'student4@demo.ecokids.in',
    role: 'student',
    schoolIndex: 2,
    profile: { grade: '9', city: 'Delhi', district: 'South East Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_5',
    name: 'Rehan Khan',
    email: 'student5@demo.ecokids.in',
    role: 'student',
    schoolIndex: 2,
    profile: { grade: '10', city: 'Delhi', district: 'South East Delhi', state: 'Delhi', language: 'english' }
  }
];

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

const buildDescription = (activityType, index) => {
  const templates = {
    'tree-planting': ['Planted neem sapling in school ground', 'Planted tulsi near classroom window', 'Planted native tree with eco-club'],
    'waste-recycling': ['Segregated dry/wet waste at home', 'Recycled notebooks and paper', 'Conducted recycling drive in class'],
    'water-saving': ['Fixed leaking tap with parent support', 'Used bucket instead of shower', 'Saved water in school wash area'],
    'energy-saving': ['Turned off unused fans and lights', 'Conducted no-electricity lunch break', 'Tracked home electricity savings'],
    'plastic-reduction': ['Used steel bottle all day', 'Avoided single-use plastic in canteen', 'Ran plastic-free awareness poster activity'],
    'composting': ['Created kitchen waste compost pit', 'Added leaf litter to compost bin', 'Maintained compost moisture and logs'],
    'biodiversity-survey': ['Documented 6 bird species near school', 'Surveyed pollinators in garden', 'Recorded tree diversity in campus']
  };

  const values = templates[activityType];
  return `${values[index % values.length]} (demo activity #${index + 1})`;
};

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
}

async function cleanupPreviousDemoData() {
  const demoEmails = ACCOUNTS.map((a) => a.email);
  const demoCodes = SCHOOLS.map((s) => s.code);

  const existingUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
  const userIds = existingUsers.map((u) => u._id);

  const existingSchools = await School.find({ code: { $in: demoCodes } }).select('_id');
  const schoolIds = existingSchools.map((s) => s._id);

  if (userIds.length > 0) {
    await ActivitySubmission.deleteMany({ user: { $in: userIds } });
    await ActivityFeed.deleteMany({ studentId: { $in: userIds } });
    await ParentalConsent.deleteMany({ studentId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  }

  if (schoolIds.length > 0) {
    await SchoolAggregate.deleteMany({ schoolId: { $in: schoolIds } });
    await School.deleteMany({ _id: { $in: schoolIds } });
  }
}

async function createSchools() {
  const created = [];
  for (const school of SCHOOLS) {
    const doc = await School.create(school);
    created.push(doc);
  }
  return created;
}

async function createUsers(schools) {
  const usersByKey = {};

  for (const account of ACCOUNTS) {
    const school = schools[account.schoolIndex];
    const payload = {
      name: account.name,
      email: account.email,
      password: DEMO_PASSWORD,
      role: account.role,
      profile: {
        ...account.profile,
        school: school.name,
        schoolId: school._id
      },
      gamification: {
        ecoPoints: 0,
        level: 1,
        badges: [],
        streak: {
          current: randomInt(mulberry32(account.name.length * 23), 2, 18),
          longest: randomInt(mulberry32(account.name.length * 29), 10, 45),
          lastActivity: new Date()
        }
      },
      environmentalImpact: {
        treesPlanted: 0,
        co2Prevented: 0,
        waterSaved: 0,
        plasticReduced: 0,
        energySaved: 0,
        activitiesCompleted: 0,
        lastImpactUpdate: new Date()
      },
      ecoPointsTotal: 0,
      ecoCoins: 0,
      isActive: true
    };

    usersByKey[account.key] = await User.create(payload);
  }

  return usersByKey;
}

async function createParentalConsents(usersByKey) {
  const studentKeys = Object.keys(usersByKey).filter((k) => k.startsWith('student_'));

  for (let i = 0; i < studentKeys.length; i++) {
    const key = studentKeys[i];
    await ParentalConsent.create({
      studentId: usersByKey[key]._id,
      parentName: `Parent of ${usersByKey[key].name}`,
      parentPhone: `98${String(91000000 + i).padStart(8, '0')}`,
      consentStatus: 'approved',
      consentMethod: 'admin',
      consentTimestamp: new Date(Date.now() - randomInt(mulberry32(i + 11), 5, 40) * 86400000),
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'conference-seed-script/1.0',
        verificationAttempts: 1
      }
    });
  }
}

async function createConferenceActivities(usersByKey, schools) {
  const rng = mulberry32(20260307);
  const students = Object.keys(usersByKey)
    .filter((k) => k.startsWith('student_'))
    .map((k) => usersByKey[k]);

  const teachers = [usersByKey.teacher_1, usersByKey.teacher_2];
  const totalActivities = 500;

  const submissions = [];
  const pointsByStudent = new Map();
  const approvedCountByStudent = new Map();

  for (const student of students) {
    pointsByStudent.set(String(student._id), 0);
    approvedCountByStudent.set(String(student._id), 0);
  }

  for (let i = 0; i < totalActivities; i++) {
    const student = students[i % students.length];
    const activityType = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
    const school = schools.find((s) => String(s._id) === String(student.profile.schoolId));

    const statusRoll = rng();
    const status = statusRoll < 0.82 ? 'approved' : statusRoll < 0.94 ? 'pending' : 'rejected';
    const teacher = teachers[i % teachers.length];

    const createdAt = new Date(Date.now() - randomInt(rng, 2, 70) * 86400000 - randomInt(rng, 0, 7000000));
    const lat = 28.55 + rng() * 0.35;
    const lng = 76.95 + rng() * 0.45;

    submissions.push({
      user: student._id,
      schoolId: school._id,
      idempotencyKey: `conf-demo-${i + 1}`,
      fileHash: `hash-conf-${i + 1}`,
      pHash: `phash-${(100000 + i).toString(16)}`,
      geoLocation: {
        lat,
        lng,
        accuracy: randomInt(rng, 4, 20),
        timestamp: createdAt
      },
      activityType,
      evidence: {
        imageUrl: `https://cdn.demo.ecokids.in/conference/activity-${i + 1}.jpg`,
        publicId: `conference/activity-${i + 1}`,
        description: buildDescription(activityType, i),
        location: {
          latitude: lat,
          longitude: lng
        }
      },
      status,
      reviewedBy: status === 'pending' ? undefined : teacher._id,
      verifiedBy: status === 'approved' ? teacher._id : undefined,
      reviewedAt: status === 'pending' ? undefined : new Date(createdAt.getTime() + randomInt(rng, 7200000, 172800000)),
      impactApplied: status === 'approved',
      rejectionReason: status === 'rejected' ? 'Evidence is unclear. Please resubmit with clearer image.' : undefined,
      school: school.name,
      district: school.district,
      state: school.state,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randomInt(rng, 3600000, 86400000))
    });

    if (status === 'approved') {
      const basePoints = ACTIVITY_POINTS[activityType];
      const bonus = randomInt(rng, 0, 12);
      const total = basePoints + bonus;
      pointsByStudent.set(String(student._id), pointsByStudent.get(String(student._id)) + total);
      approvedCountByStudent.set(
        String(student._id),
        approvedCountByStudent.get(String(student._id)) + 1
      );
    }
  }

  await ActivitySubmission.insertMany(submissions, { ordered: true });

  const approvedFeed = submissions
    .filter((s) => s.status === 'approved')
    .slice(0, 320)
    .map((s, idx) => {
      const student = students.find((u) => String(u._id) === String(s.user));
      const points = ACTIVITY_POINTS[s.activityType] + (idx % 9);
      return {
        studentId: s.user,
        studentName: student ? student.name : 'Demo Student',
        activityType: s.activityType,
        pointsEarned: points,
        createdAt: s.createdAt
      };
    });

  if (approvedFeed.length > 0) {
    await ActivityFeed.insertMany(approvedFeed, { ordered: true });
  }

  return { pointsByStudent, approvedCountByStudent, totalActivities };
}

async function updateUserGamification(usersByKey, metrics) {
  const studentUsers = Object.keys(usersByKey)
    .filter((k) => k.startsWith('student_'))
    .map((k) => usersByKey[k]);

  const badgesByRank = [
    { badgeId: 'badge-leaf-guardian', name: 'Leaf Guardian' },
    { badgeId: 'badge-water-saver', name: 'Water Saver' },
    { badgeId: 'badge-recycle-ranger', name: 'Recycle Ranger' },
    { badgeId: 'badge-energy-ninja', name: 'Energy Ninja' },
    { badgeId: 'badge-earth-ally', name: 'Earth Ally' }
  ];

  const sorted = studentUsers
    .map((u) => ({
      user: u,
      points: metrics.pointsByStudent.get(String(u._id)) || 0,
      approved: metrics.approvedCountByStudent.get(String(u._id)) || 0
    }))
    .sort((a, b) => b.points - a.points);

  for (let i = 0; i < sorted.length; i++) {
    const { user, points, approved } = sorted[i];
    const level = Math.max(1, Math.floor(points / 100) + 1);

    user.gamification.ecoPoints = points;
    user.gamification.level = level;
    user.gamification.badges = [
      {
        badgeId: badgesByRank[Math.min(i, badgesByRank.length - 1)].badgeId,
        name: badgesByRank[Math.min(i, badgesByRank.length - 1)].name,
        earnedAt: new Date(Date.now() - (i + 2) * 86400000)
      }
    ];

    user.ecoPointsTotal = points;
    user.ecoCoins = Math.floor(points / 10);
    user.environmentalImpact.activitiesCompleted = approved;
    user.environmentalImpact.treesPlanted = Math.floor(approved * 0.35);
    user.environmentalImpact.waterSaved = approved * 12;
    user.environmentalImpact.plasticReduced = approved * 4;
    user.environmentalImpact.energySaved = approved * 7;
    user.environmentalImpact.co2Prevented = approved * 1.8;
    user.environmentalImpact.lastImpactUpdate = new Date();

    await user.save();
  }
}

async function updateSchoolAggregates(schools) {
  for (const school of schools) {
    const students = await User.find({
      role: 'student',
      'profile.schoolId': school._id
    }).select('_id ecoPointsTotal');

    const studentIds = students.map((s) => s._id);
    const activitiesCompleted = await ActivitySubmission.countDocuments({
      schoolId: school._id,
      status: 'approved'
    });

    const totalEcoPoints = students.reduce((sum, s) => sum + (s.ecoPointsTotal || 0), 0);

    await SchoolAggregate.findOneAndUpdate(
      { schoolId: school._id },
      {
        schoolId: school._id,
        totalEcoPoints,
        studentCount: students.length,
        activitiesCompleted,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    if (studentIds.length > 0) {
      await ActivitySubmission.updateMany(
        { schoolId: school._id, user: { $in: studentIds } },
        { $set: { school: school.name, district: school.district, state: school.state } }
      );
    }
  }
}

function printSummary(schools, usersByKey, metrics) {
  const students = Object.keys(usersByKey)
    .filter((k) => k.startsWith('student_'))
    .map((k) => usersByKey[k]);

  console.log('\nConference Demo Seed Complete');
  console.log('----------------------------------------');
  console.log(`Schools created: ${schools.length}`);
  console.log(`Accounts created: ${Object.keys(usersByKey).length}`);
  console.log(`Activity submissions created: ${metrics.totalActivities}`);

  const approved = Array.from(metrics.approvedCountByStudent.values()).reduce((a, b) => a + b, 0);
  console.log(`Approved activities: ${approved}`);
  console.log(`Pending/Rejected activities: ${metrics.totalActivities - approved}`);

  console.log('\nDemo Credentials (all use same password):');
  console.log(`Password: ${DEMO_PASSWORD}`);
  ACCOUNTS.forEach((a) => {
    console.log(`- ${a.role.padEnd(14)} ${a.email}`);
  });

  const leaderboard = students
    .map((s) => ({ name: s.name, points: s.gamification.ecoPoints }))
    .sort((a, b) => b.points - a.points);

  console.log('\nTop Student Leaderboard Snapshot:');
  leaderboard.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.name} - ${entry.points} pts`);
  });
}

async function seedConferenceDemo() {
  try {
    await connectDB();
    await cleanupPreviousDemoData();

    const schools = await createSchools();
    const usersByKey = await createUsers(schools);

    await createParentalConsents(usersByKey);

    const metrics = await createConferenceActivities(usersByKey, schools);
    await updateUserGamification(usersByKey, metrics);
    await updateSchoolAggregates(schools);

    printSummary(schools, usersByKey, metrics);
  } catch (error) {
    console.error('Failed to seed conference demo data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedConferenceDemo();
}

module.exports = seedConferenceDemo;
