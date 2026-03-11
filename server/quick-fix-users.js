const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  
  const hash = await bcrypt.hash('password123', 10);
  
  await User.deleteMany({ email: { $in: ['student@ecokids.com','teacher@ecokids.com','admin@ecokids.com'] }});
  
  await User.insertMany([
    { name: 'Arjun Student', email: 'student@ecokids.com', password: hash, role: 'student', profile: { grade: '8', school: 'Demo School' }, isActive: true, gamification: { ecoPoints: 425, ecoCoins: 5 } },
    { name: 'Demo Teacher', email: 'teacher@ecokids.com', password: hash, role: 'teacher', profile: { school: 'Demo School' }, isActive: true },
    { name: 'Demo Admin', email: 'admin@ecokids.com', password: hash, role: 'school_admin', profile: { school: 'Demo School' }, isActive: true }
  ]);
  
  console.log('✅ Done! Try: student@ecokids.com / password123');
  process.exit();
}).catch(e => { console.error(e.message); process.exit(1); });
