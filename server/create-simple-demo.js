const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const hash = await bcrypt.hash('Demo@123', 10);

    // Delete existing demo users
    await User.deleteMany({ 
      email: { 
        $in: [
          'student@ecokids.com',
          'teacher@ecokids.com', 
          'admin@ecokids.com'
        ]
      }
    });

    // Create new demo users
    await User.insertMany([
      { 
        name: 'Arjun Student', 
        email: 'student@ecokids.com', 
        password: hash, 
        role: 'student', 
        profile: { grade: '8', school: 'Demo School', city: 'Mumbai', state: 'Maharashtra' }, 
        isActive: true 
      },
      { 
        name: 'Demo Teacher', 
        email: 'teacher@ecokids.com', 
        password: hash, 
        role: 'teacher', 
        profile: { school: 'Demo School', city: 'Mumbai', state: 'Maharashtra' },
        isActive: true 
      },
      { 
        name: 'Demo Admin', 
        email: 'admin@ecokids.com', 
        password: hash, 
        role: 'school_admin', 
        profile: { school: 'Demo School', city: 'Mumbai', state: 'Maharashtra' },
        isActive: true 
      }
    ]);

    console.log('\n✅ Demo users created successfully!\n');
    console.log('Login credentials:');
    console.log('   Student: student@ecokids.com / Demo@123');
    console.log('   Teacher: teacher@ecokids.com / Demo@123');
    console.log('   Admin:   admin@ecokids.com / Demo@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoUsers();
