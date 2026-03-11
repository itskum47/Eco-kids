const mongoose = require('mongoose');
const ParentalConsent = require('../models/ParentalConsent');
const User = require('../models/User');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the test student
    const student = await User.findOne({ email: 'student@ecokids.com' });
    if (!student) {
      console.log('Student not found');
      process.exit(1);
    }
    
    // Upsert parental consent
    const consent = await ParentalConsent.findOneAndUpdate(
      { studentId: student._id },
      {
        studentId: student._id,
        parentName: 'Parent Name',
        parentPhone: '+919876543210',
        parentEmail: 'parent@example.com',
        consentStatus: 'approved',
        consentMethod: 'admin',
        consentTimestamp: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Parental consent created/updated for student');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
