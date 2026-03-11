const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids';
const PASSWORD = 'Demo@123';

const MISSING_ADMINS = [
  {
    name: 'State Admin',
    email: 'state.admin@ecokids.demo',
    role: 'state_admin',
    profile: {
      school: 'State Education Board',
      city: 'Delhi',
      state: 'Delhi',
      language: 'english',
      bio: 'State level administrator'
    }
  },
  {
    name: 'District Admin',
    email: 'district.admin@ecokids.demo',
    role: 'district_admin',
    profile: {
      school: 'Delhi District',
      city: 'Delhi',
      state: 'Delhi',
      district: 'Central Delhi',
      language: 'english',
      bio: 'District level administrator'
    }
  },
  {
    name: 'School Admin DPS',
    email: 'school.admin@dps-delhi.demo',
    role: 'school_admin',
    profile: {
      school: 'Delhi Public School',
      city: 'Delhi',
      state: 'Delhi',
      language: 'english',
      bio: 'School administrator for DPS Delhi'
    }
  }
];

async function createMissingAdmins() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const admin of MISSING_ADMINS) {
      const existing = await User.findOne({ email: admin.email });
      
      if (existing) {
        console.log(`⏭️  ${admin.email} already exists`);
      } else {
        await User.create({
          ...admin,
          password: PASSWORD,
          isActive: true
        });
        console.log(`✅ Created ${admin.role}: ${admin.email} / ${PASSWORD}`);
      }
    }

    console.log('\n✨ Admin accounts are ready!');
    console.log('\n📋 Login credentials:');
    console.log('   State Admin:    state.admin@ecokids.demo / Demo@123');
    console.log('   District Admin: district.admin@ecokids.demo / Demo@123');
    console.log('   School Admin:   school.admin@dps-delhi.demo / Demo@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createMissingAdmins();
