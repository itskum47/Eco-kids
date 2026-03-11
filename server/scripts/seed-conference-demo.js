const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const User = require('../models/User');
const School = require('../models/School');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const ActivitySubmission = require('../models/ActivitySubmission');
const ActivityFeed = require('../models/ActivityFeed');
const SchoolAggregate = require('../models/SchoolAggregate');
const InterSchoolChallenge = require('../models/InterSchoolChallenge');
const DailyChallenge = require('../models/DailyChallenge');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids-india';
const DEMO_PASSWORD = 'Demo@123';
const shouldReset = process.argv.includes('--reset');

const SCHOOLS = [
  {
    name: 'Delhi Public School',
    district: 'South East Delhi',
    state: 'Delhi',
    code: 'DEMO-DPS-2026',
    principalContact: {
      name: 'Principal DPS',
      email: 'principal.dps@demo.ecokids.in',
      phone: '9899001201'
    }
  },
  {
    name: 'Kendriya Vidyalaya',
    district: 'South West Delhi',
    state: 'Delhi',
    code: 'DEMO-KV-2026',
    principalContact: {
      name: 'Principal KV',
      email: 'principal.kv@demo.ecokids.in',
      phone: '9899001202'
    }
  },
  {
    name: 'Sarvodaya Vidyalaya',
    district: 'North West Delhi',
    state: 'Delhi',
    code: 'DEMO-SV-2026',
    principalContact: {
      name: 'Principal SV',
      email: 'principal.sv@demo.ecokids.in',
      phone: '9899001203'
    }
  }
];

const ACCOUNTS = [
  {
    key: 'state_admin',
    name: 'State Admin Delhi',
    email: 'stateadmin@demo.ecokids.in',
    role: 'state_admin',
    schoolKey: 'Delhi Public School',
    profile: { district: 'Central Delhi', city: 'New Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'district_admin',
    name: 'District Admin Delhi',
    email: 'districtadmin@demo.ecokids.in',
    role: 'district_admin',
    schoolKey: 'Delhi Public School',
    profile: { district: 'South East Delhi', city: 'New Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'school_admin',
    name: 'School Admin DPS',
    email: 'schooladmin@demo.ecokids.in',
    role: 'school_admin',
    schoolKey: 'Delhi Public School',
    profile: { district: 'South East Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'teacher_1',
    name: 'Riya Mehta',
    email: 'teacher1@demo.ecokids.in',
    role: 'teacher',
    schoolKey: 'Delhi Public School',
    profile: { district: 'South East Delhi', city: 'Delhi', state: 'Delhi', language: 'english', bio: 'Eco club mentor' }
  },
  {
    key: 'teacher_2',
    name: 'Vikram Rao',
    email: 'teacher2@demo.ecokids.in',
    role: 'teacher',
    schoolKey: 'Kendriya Vidyalaya',
    profile: { district: 'South West Delhi', city: 'Delhi', state: 'Delhi', language: 'english', bio: 'Science teacher' }
  },
  {
    key: 'student_1',
    name: 'Arjun Sharma',
    email: 'student1@demo.ecokids.in',
    role: 'student',
    schoolKey: 'Delhi Public School',
    profile: { grade: '9', district: 'South East Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_2',
    name: 'Priya Patel',
    email: 'student2@demo.ecokids.in',
    role: 'student',
    schoolKey: 'Delhi Public School',
    profile: { grade: '8', district: 'South East Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_3',
    name: 'Neha Verma',
    email: 'student3@demo.ecokids.in',
    role: 'student',
    schoolKey: 'Kendriya Vidyalaya',
    profile: { grade: '7', district: 'South West Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_4',
    name: 'Kabir Singh',
    email: 'student4@demo.ecokids.in',
    role: 'student',
    schoolKey: 'Sarvodaya Vidyalaya',
    profile: { grade: '10', district: 'North West Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  },
  {
    key: 'student_5',
    name: 'Aisha Khan',
    email: 'student5@demo.ecokids.in',
    role: 'student',
    schoolKey: 'Sarvodaya Vidyalaya',
    profile: { grade: '6', district: 'North West Delhi', city: 'Delhi', state: 'Delhi', language: 'english' }
  }
];

const activityTypes = [
  'tree-planting',
  'waste-recycling',
  'water-saving',
  'energy-saving',
  'plastic-reduction',
  'composting',
  'biodiversity-survey'
];

const allDemoBadges = [
  { badgeId: 'badge-first-action', name: 'First Action Hero' },
  { badgeId: 'badge-green-rookie', name: 'Green Rookie' },
  { badgeId: 'badge-recycling-ranger', name: 'Recycling Ranger' },
  { badgeId: 'badge-water-warrior', name: 'Water Warrior' },
  { badgeId: 'badge-energy-saver', name: 'Energy Saver' },
  { badgeId: 'badge-planet-protector', name: 'Planet Protector' },
  { badgeId: 'badge-streak-master', name: 'Streak Master' },
  { badgeId: 'badge-quiz-whiz', name: 'Quiz Whiz' },
  { badgeId: 'badge-eco-influencer', name: 'Eco Influencer' },
  { badgeId: 'badge-climate-champion', name: 'Climate Champion' }
];

const pointsMap = {
  'tree-planting': 35,
  'waste-recycling': 22,
  'water-saving': 18,
  'energy-saving': 20,
  'plastic-reduction': 24,
  'composting': 28,
  'biodiversity-survey': 26
};

function mulberry32(seed) {
  let t = seed;
  return function next() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
}

async function resetConferenceData() {
  const demoEmails = ACCOUNTS.map((a) => a.email);
  const demoCodes = SCHOOLS.map((s) => s.code);

  const demoUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
  const userIds = demoUsers.map((u) => u._id);

  const demoSchools = await School.find({ code: { $in: demoCodes } }).select('_id');
  const schoolIds = demoSchools.map((s) => s._id);

  if (userIds.length > 0) {
    await ActivitySubmission.deleteMany({ user: { $in: userIds } });
    await ActivityFeed.deleteMany({ studentId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  }

  if (schoolIds.length > 0) {
    await SchoolAggregate.deleteMany({ schoolId: { $in: schoolIds } });
    await InterSchoolChallenge.deleteMany({ 'schools.schoolId': { $in: schoolIds } });
    await School.deleteMany({ _id: { $in: schoolIds } });
  }

  await DailyChallenge.deleteMany({ title: { $regex: '^Conference Demo Challenge' } });

  console.log('Reset complete for existing conference demo data.');
}

async function upsertSchools() {
  const map = new Map();

  for (const schoolData of SCHOOLS) {
    const school = await School.findOneAndUpdate(
      { code: schoolData.code },
      { $set: schoolData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    map.set(schoolData.name, school);
  }

  return map;
}

async function upsertUsers(schoolsMap) {
  const users = {};

  for (const account of ACCOUNTS) {
    const school = schoolsMap.get(account.schoolKey);

    const update = {
      name: account.name,
      role: account.role,
      profile: {
        ...account.profile,
        school: school.name,
        schoolId: school._id
      },
      isActive: true
    };

    let user = await User.findOne({ email: account.email }).select('+password');

    if (!user) {
      user = new User({
        ...update,
        email: account.email,
        password: DEMO_PASSWORD
      });
      await user.save();
    } else {
      user.name = update.name;
      user.role = update.role;
      user.profile = update.profile;
      user.isActive = true;
      await user.save();
    }

    users[account.key] = user;
  }

  return users;
}

async function ensureQuizAndTopic(authorId) {
  let topic = await Topic.findOne({ slug: 'conference-demo-topic' });

  if (!topic) {
    topic = await Topic.create({
      title: 'Conference Demo Topic',
      description: 'Core sustainability concepts for conference walkthrough.',
      content: 'This topic is seeded for demo quiz attempts and reporting validation.',
      category: 'climate-change',
      difficulty: 'beginner',
      gradeLevel: ['6', '7', '8', '9', '10'],
      learningObjectives: ['Understand sustainability basics'],
      keyTakeaways: ['Individual actions create measurable impact'],
      author: authorId,
      status: 'published',
      publishedAt: new Date()
    });
  }

  let quiz = await Quiz.findOne({ slug: 'conference-demo-quiz' });

  if (!quiz) {
    quiz = await Quiz.create({
      title: 'Conference Demo Quiz',
      slug: 'conference-demo-quiz',
      description: 'Seeded quiz for validating attempt analytics.',
      topic: topic._id,
      category: 'climate-change',
      difficulty: 'easy',
      gradeLevel: ['6', '7', '8', '9', '10'],
      questions: [
        {
          questionNumber: 1,
          questionText: 'Which action reduces plastic waste the most?',
          questionType: 'multiple-choice',
          options: [
            { optionText: 'Using reusable bottle', isCorrect: true },
            { optionText: 'Buying bottled water', isCorrect: false },
            { optionText: 'Using plastic cups daily', isCorrect: false },
            { optionText: 'Burning plastic', isCorrect: false }
          ],
          points: 1,
          explanation: 'Reusable bottles reduce repeated plastic consumption.'
        },
        {
          questionNumber: 2,
          questionText: 'Planting trees helps to reduce ______ in the atmosphere.',
          questionType: 'fill-blank',
          correctAnswer: 'carbon dioxide',
          points: 1
        },
        {
          questionNumber: 3,
          questionText: 'Turning off unused lights saves energy.',
          questionType: 'true-false',
          options: [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false }
          ],
          points: 1
        }
      ],
      scoring: {
        totalPoints: 3,
        passingScore: 60,
        showCorrectAnswers: true,
        allowRetakes: true,
        maxAttempts: 1000
      },
      ecoPointsReward: 15,
      status: 'published',
      publishedAt: new Date(),
      author: authorId,
      lastModifiedBy: authorId
    });
  }

  return quiz;
}

async function seedActivities(users) {
  const rng = mulberry32(20260307);
  const students = [users.student_1, users.student_2, users.student_3, users.student_4, users.student_5];
  const teachers = [users.teacher_1, users.teacher_2];
  const totalActivities = 500;

  await ActivitySubmission.deleteMany({ idempotencyKey: { $regex: '^conference-demo-' } });

  const submissions = [];
  const approvedCounts = new Map();

  for (const s of students) {
    approvedCounts.set(String(s._id), 0);
  }

  for (let i = 0; i < totalActivities; i++) {
    const student = students[i % students.length];
    const teacher = teachers[i % teachers.length];
    const type = activityTypes[i % activityTypes.length];
    const now = new Date();
    const createdAt = new Date(now.getTime() - randInt(rng, 0, 29) * 24 * 60 * 60 * 1000 - randInt(rng, 0, 8 * 60 * 60 * 1000));

    const statusRoll = rng();
    const status = statusRoll < 0.86 ? 'approved' : statusRoll < 0.95 ? 'pending' : 'rejected';

    const lat = 28.40 + rng() * 0.6;
    const lng = 76.80 + rng() * 0.7;

    submissions.push({
      user: student._id,
      schoolId: student.profile.schoolId,
      idempotencyKey: `conference-demo-${i + 1}`,
      fileHash: `conference-hash-${i + 1}`,
      pHash: `conference-phash-${(100000 + i).toString(16)}`,
      geoLocation: {
        lat,
        lng,
        accuracy: randInt(rng, 5, 18),
        timestamp: createdAt
      },
      activityType: type,
      evidence: {
        imageUrl: `https://cdn.demo.ecokids.in/proofs/activity-${i + 1}.jpg`,
        publicId: `conference-demo/activity-${i + 1}`,
        description: `Conference seed ${type} submission #${i + 1}`,
        location: {
          latitude: lat,
          longitude: lng
        }
      },
      status,
      reviewedBy: status === 'pending' ? undefined : teacher._id,
      verifiedBy: status === 'approved' ? teacher._id : undefined,
      reviewedAt: status === 'pending' ? undefined : new Date(createdAt.getTime() + randInt(rng, 2, 48) * 60 * 60 * 1000),
      impactApplied: status === 'approved',
      rejectionReason: status === 'rejected' ? 'Insufficient proof visibility.' : undefined,
      school: student.profile.school,
      district: student.profile.district,
      state: student.profile.state,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randInt(rng, 1, 12) * 60 * 60 * 1000)
    });

    if (status === 'approved') {
      approvedCounts.set(String(student._id), approvedCounts.get(String(student._id)) + 1);
    }
  }

  await ActivitySubmission.insertMany(submissions, { ordered: true });

  const feedItems = submissions
    .filter((s) => s.status === 'approved')
    .slice(0, 280)
    .map((s, idx) => {
      const student = students.find((x) => String(x._id) === String(s.user));
      return {
        studentId: s.user,
        studentName: student ? student.name : 'Demo Student',
        activityType: s.activityType,
        pointsEarned: pointsMap[s.activityType] + (idx % 8),
        createdAt: s.createdAt
      };
    });

  await ActivityFeed.deleteMany({ studentId: { $in: students.map((s) => s._id) } });
  if (feedItems.length > 0) {
    await ActivityFeed.insertMany(feedItems, { ordered: true });
  }

  return { approvedCounts, totalActivities };
}

async function seedQuizAttempts(quiz, users) {
  const rng = mulberry32(90311);
  const students = [users.student_1, users.student_2, users.student_3, users.student_4, users.student_5];
  const totalAttempts = 300;

  quiz.attempts = [];

  for (let i = 0; i < totalAttempts; i++) {
    const student = students[i % students.length];
    const correct = randInt(rng, 1, 3);
    const percentage = Math.round((correct / 3) * 100);

    const startedAt = new Date(Date.now() - randInt(rng, 0, 29) * 24 * 60 * 60 * 1000 - randInt(rng, 0, 4 * 60 * 60 * 1000));
    const timeSpent = randInt(rng, 80, 360);

    quiz.attempts.push({
      user: student._id,
      attemptNumber: Math.floor(i / students.length) + 1,
      startedAt,
      completedAt: new Date(startedAt.getTime() + timeSpent * 1000),
      answers: [],
      score: {
        correct,
        total: 3,
        percentage,
        points: correct
      },
      timeSpent,
      status: 'completed',
      feedback: percentage >= 60 ? 'Good job!' : 'Review and retry.',
      certificateIssued: percentage >= 90
    });
  }

  quiz.analytics.totalAttempts = totalAttempts;
  quiz.analytics.completedAttempts = totalAttempts;
  quiz.analytics.averageScore = Math.round(
    quiz.attempts.reduce((sum, a) => sum + (a.score?.percentage || 0), 0) / totalAttempts
  );
  quiz.analytics.averageTimeSpent = Math.round(
    quiz.attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAttempts
  );

  await quiz.save();
  return totalAttempts;
}

async function seedLeaderboardAndBadges(users, activityMetrics) {
  const studentTargets = [
    { user: users.student_1, points: 4250, name: 'Arjun Sharma' },
    { user: users.student_2, points: 3890, name: 'Priya Patel' },
    { user: users.student_3, points: 3325, name: 'Neha Verma' },
    { user: users.student_4, points: 2980, name: 'Kabir Singh' },
    { user: users.student_5, points: 2715, name: 'Aisha Khan' }
  ];

  for (const row of studentTargets) {
    const approved = activityMetrics.approvedCounts.get(String(row.user._id)) || 0;

    row.user.gamification.ecoPoints = row.points;
    row.user.gamification.level = Math.floor(row.points / 100) + 1;
    row.user.gamification.badges = allDemoBadges.map((b, idx) => ({
      badgeId: b.badgeId,
      name: b.name,
      earnedAt: new Date(Date.now() - (idx + 1) * 86400000)
    }));

    row.user.ecoPointsTotal = row.points;
    row.user.ecoCoins = Math.floor(row.points / 10);
    row.user.environmentalImpact.activitiesCompleted = approved;
    row.user.environmentalImpact.treesPlanted = Math.floor(approved * 0.38);
    row.user.environmentalImpact.waterSaved = approved * 15;
    row.user.environmentalImpact.plasticReduced = approved * 6;
    row.user.environmentalImpact.energySaved = approved * 9;
    row.user.environmentalImpact.co2Prevented = approved * 2.1;
    row.user.environmentalImpact.lastImpactUpdate = new Date();

    await row.user.save();
  }
}

async function seedSchoolChallenge(users, schoolsMap) {
  const schools = Array.from(schoolsMap.values());
  const dps = schools.find((s) => s.name === 'Delhi Public School');
  const kv = schools.find((s) => s.name === 'Kendriya Vidyalaya');
  const sv = schools.find((s) => s.name === 'Sarvodaya Vidyalaya');

  await InterSchoolChallenge.deleteMany({ title: 'Delhi Green Sprint Challenge' });

  const now = new Date();
  const challenge = await InterSchoolChallenge.create({
    title: 'Delhi Green Sprint Challenge',
    description: 'Inter-school eco action sprint for conference demo.',
    challengeType: 'activities',
    targetMetric: 'activities_completed',
    schools: [
      {
        schoolId: dps._id,
        schoolName: dps.name,
        totalScore: 34,
        participantCount: 5
      },
      {
        schoolId: kv._id,
        schoolName: kv.name,
        totalScore: 29,
        participantCount: 4
      },
      {
        schoolId: sv._id,
        schoolName: sv.name,
        totalScore: 27,
        participantCount: 4
      }
    ],
    startsAt: new Date(now.getTime() - 5 * 86400000),
    endsAt: new Date(now.getTime() + 10 * 86400000),
    status: 'active',
    createdBy: users.school_admin._id,
    rules: {
      minParticipants: 3,
      maxSchools: 10,
      pointsMultiplier: 1,
      difficultyTier: 'medium',
      bonusConditions: [
        {
          condition: 'first_to_50',
          bonusPoints: 100,
          description: 'First school to 50 approved activities gets bonus.'
        }
      ],
      timeBonuses: []
    }
  });

  return challenge;
}

async function seedDailyChallenges(users) {
  const students = [users.student_1, users.student_2, users.student_3, users.student_4, users.student_5];
  const now = new Date();
  const created = [];

  await DailyChallenge.deleteMany({ title: { $regex: '^Conference Demo Challenge' } });

  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 86400000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const challengeDate = `${y}-${m}-${d}`;

    const completedBy = students.map((s) => ({
      user: s._id,
      completedAt: new Date(date.getTime() + 18 * 60 * 60 * 1000)
    }));

    const challenge = await DailyChallenge.create({
      title: `Conference Demo Challenge Day ${7 - i}`,
      description: 'Complete one verified eco activity today.',
      ecoPointsReward: 50,
      challengeDate,
      expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      completedBy
    });

    created.push(challenge);
  }

  return created;
}

async function updateSchoolAggregates(schoolsMap) {
  const schools = Array.from(schoolsMap.values());

  for (const school of schools) {
    const students = await User.find({ role: 'student', 'profile.schoolId': school._id }).select('ecoPointsTotal');
    const activitiesCompleted = await ActivitySubmission.countDocuments({ schoolId: school._id, status: 'approved' });

    const totalEcoPoints = students.reduce((sum, u) => sum + (u.ecoPointsTotal || 0), 0);

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
  }
}

function printCredentials() {
  console.log('\nDemo Credentials (all accounts use the same password):');
  console.log(`Password: ${DEMO_PASSWORD}`);
  for (const account of ACCOUNTS) {
    console.log(`- ${account.email} / ${DEMO_PASSWORD}`);
  }
}

async function seedConferenceDemo() {
  try {
    await connectDB();

    if (shouldReset) {
      await resetConferenceData();
    }

    const schoolsMap = await upsertSchools();
    const users = await upsertUsers(schoolsMap);

    const quiz = await ensureQuizAndTopic(users.teacher_1._id);
    const activityMetrics = await seedActivities(users);
    const attempts = await seedQuizAttempts(quiz, users);

    await seedLeaderboardAndBadges(users, activityMetrics);
    const challenge = await seedSchoolChallenge(users, schoolsMap);
    const daily = await seedDailyChallenges(users);
    await updateSchoolAggregates(schoolsMap);

    console.log('\nConference demo data seeded successfully.');
    console.log(`Schools: 3`);
    console.log(`Accounts: 10`);
    console.log(`Activities (30-day spread): ${activityMetrics.totalActivities}`);
    console.log(`Quiz attempts: ${attempts}`);
    console.log(`Leaderboard targets: Arjun Sharma 4250, Priya Patel 3890`);
    console.log(`Challenge progress: ${challenge.title} at 34/50`);
    console.log(`Daily challenges completed: ${daily.length} days`);
    console.log(`All badges awarded to demo students: ${allDemoBadges.length} badges each`);

    printCredentials();
  } catch (error) {
    console.error('Failed to seed conference demo:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedConferenceDemo();
}

module.exports = seedConferenceDemo;
