const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const School = require('../models/School');
const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const { calculateImpact } = require('../utils/impactCalculator');

const PILOT_DISTRICT = 'Ludhiana';
const PILOT_STATE = 'Punjab';

const schoolsToSeed = [
    { name: 'Government Primary School, Model Town', code: '03090100101' },
    { name: 'Government Senior Secondary School, Sarabha Nagar', code: '03090100201' },
    { name: 'Government Primary School, BRS Nagar', code: '03090100301' },
    { name: 'Government Model Senior Secondary School, Miller Ganj', code: '03090100401' },
    { name: 'Government Senior Secondary School, Haibowal Kalan', code: '03090100501' }
];

async function seedPilot() {
    const args = process.argv.slice(2);
    if (!args.includes('--force')) {
        console.error('🛑 ERR: Refusing to run. Must pass --force to explicitly run this seed.');
        process.exit(1);
    }

    try {
        console.log('🌱 Starting Pilot Seeder...');
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('📦 Connected to Database.');

        let createdSchools = 0;
        let createdTeachers = 0;
        let createdStudents = 0;
        let createdSubmissions = 0;

        for (let i = 0; i < schoolsToSeed.length; i++) {
            const schoolData = schoolsToSeed[i];

            // 1. Seed School
            let school = await School.findOne({ code: schoolData.code });
            if (!school) {
                school = await School.create({
                    name: schoolData.name,
                    code: schoolData.code,
                    district: PILOT_DISTRICT,
                    state: PILOT_STATE
                });
                createdSchools++;
            }

            // 2. Seed Teacher
            const teacherEmail = `teacher_${school.code}@punjab.gov.in`;
            const tempPassword = `Teacher@${crypto.randomBytes(3).toString('hex')}`;
            let teacher = await User.findOne({ email: teacherEmail });

            if (!teacher) {
                teacher = await User.create({
                    name: `Teacher ${schoolData.name.split(',')[0]}`,
                    email: teacherEmail,
                    password: tempPassword,
                    role: 'teacher',
                    profile: {
                        school: school.name,
                        schoolId: school._id,
                        district: PILOT_DISTRICT,
                        state: PILOT_STATE
                    }
                });
                createdTeachers++;
                console.log(`✅ Teacher Created -> School: ${school.code} | Email: ${teacherEmail} | TempPass: ${tempPassword}`);
            }

            // 3. Seed 10 Students per school
            for (let j = 1; j <= 10; j++) {
                const studentEmail = `student_${school.code}_${j}@punjab.gov.in`;
                let student = await User.findOne({ email: studentEmail });
                if (!student) {
                    student = await User.create({
                        name: `Student ${j}`,
                        email: studentEmail,
                        password: `Student@${school.code}`,
                        role: 'student',
                        profile: {
                            school: school.name,
                            schoolId: school._id,
                            district: PILOT_DISTRICT,
                            state: PILOT_STATE,
                            grade: String((j % 5) + 4) // Random grades 4-8
                        }
                    });
                    createdStudents++;

                    // 4. Seed 1 Approved Submission for the FIRST student in each school, to populate dashboard
                    if (j === 1) {
                        const existingSub = await ActivitySubmission.findOne({ user: student._id });
                        if (!existingSub) {
                            const sub = await ActivitySubmission.create({
                                user: student._id,
                                activityType: 'tree-planting',
                                evidence: {
                                    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
                                    publicId: 'sample',
                                    description: 'Planted a neem sapling on school grounds'
                                },
                                sdgTag: 'SDG 15',
                                status: 'approved',
                                verifiedBy: teacher._id,
                                impactApplied: true
                            });

                            const impact = calculateImpact(sub.activityType);
                            await User.findByIdAndUpdate(student._id, {
                                $inc: {
                                    'environmentalImpact.treesPlanted': impact.treesPlanted || 0,
                                    'environmentalImpact.co2Prevented': impact.co2Prevented || 0,
                                    'environmentalImpact.activitiesCompleted': 1,
                                    'gamification.ecoPoints': 50
                                }
                            });
                            createdSubmissions++;
                        }
                    }
                }
            }
        }

        console.log(`\n🎉 Seed Execution Complete!`);
        console.log(`----------------------------------`);
        console.log(`Schools Added/Verified: ${createdSchools} (Total 5)`);
        console.log(`Teachers Added/Verified: ${createdTeachers} (Total 5)`);
        console.log(`Students Added/Verified: ${createdStudents} (Total 50)`);
        console.log(`Approved Submissions Added: ${createdSubmissions} (Total 5)`);
        console.log(`----------------------------------`);
        console.log(`Idempotent constraints executed safely.\n`);

        process.exit(0);

    } catch (err) {
        console.error('❌ FATAL SEED ERR:', err);
        process.exit(1);
    }
}

seedPilot();
