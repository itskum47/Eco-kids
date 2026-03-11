const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./models/User');

const createDemoUsers = async () => {
  try {
    console.log('🌱 Creating demo users...');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids';
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    const domains = ['ecokids.test', 'ecokids.com'];

    for (const domain of domains) {
      const studentEmail = `student@${domain}`;
      const teacherEmail = `teacher@${domain}`;
      const adminEmail = `admin@${domain}`;

      const existingStudent = await User.findOne({ email: studentEmail });
      const existingTeacher = await User.findOne({ email: teacherEmail });
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (!existingStudent) {
        await User.create({
          name: 'Demo Student',
          email: studentEmail,
          password: 'password123',
          role: 'student',
          profile: {
            grade: '5',
            school: 'Demo School',
            city: 'Mumbai',
            state: 'Maharashtra',
            language: 'english'
          },
          isActive: true
        });
        console.log(`✅ Created Student: ${studentEmail} / password123`);
      } else {
        console.log(`⏭️  Student user already exists: ${studentEmail}`);
      }

      if (!existingTeacher) {
        await User.create({
          name: 'Demo Teacher',
          email: teacherEmail,
          password: 'password123',
          role: 'teacher',
          profile: {
            school: 'Demo School',
            city: 'Mumbai',
            state: 'Maharashtra',
            language: 'english',
            bio: 'Environmental Science Teacher'
          },
          isActive: true
        });
        console.log(`✅ Created Teacher: ${teacherEmail} / password123`);
      } else {
        console.log(`⏭️  Teacher user already exists: ${teacherEmail}`);
      }

      if (!existingAdmin) {
        await User.create({
          name: 'Demo Admin',
          email: adminEmail,
          password: 'password123',
          role: 'school_admin',
          profile: {
            school: 'EcoKids India',
            city: 'Delhi',
            state: 'Delhi',
            language: 'english',
            bio: 'Platform Administrator'
          },
          isActive: true
        });
        console.log(`✅ Created Admin: ${adminEmail} / password123`);
      } else {
        console.log(`⏭️  Admin user already exists: ${adminEmail}`);
      }
    }

    console.log('\n✨ Demo users are ready!');
    console.log('\n📋 Login credentials:');
    console.log('   Student: student@ecokids.test / password123');
    console.log('   Teacher: teacher@ecokids.test / password123');
    console.log('   Admin:   admin@ecokids.test / password123');
    console.log('   (also available with @ecokids.com)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
};

// Run the seed function
createDemoUsers();
