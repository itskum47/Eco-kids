const mongoose = require('mongoose');
require('dotenv').config();

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Reset submission back to 'submitted'
  const expResult = await db.collection('experiments').updateOne(
    { 'submissions._id': new mongoose.Types.ObjectId('699c429e4c5fd54518c2b297') },
    { $set: { 'submissions.$.status': 'submitted' } }
  );
  console.log('Submission reset:', expResult.modifiedCount, 'doc(s) updated');

  // Zero out student's environmental impact for a clean before/after delta
  const userResult = await db.collection('users').updateOne(
    { email: 'student@ecokids.com' },
    {
      $set: {
        'environmentalImpact.activitiesCompleted': 0,
        'environmentalImpact.co2Prevented': 0,
        'environmentalImpact.waterSaved': 0,
        'environmentalImpact.treesPlanted': 0,
        'environmentalImpact.plasticReduced': 0,
        'environmentalImpact.energySaved': 0
      }
    }
  );
  console.log('Student impact zeroed:', userResult.modifiedCount, 'doc(s) updated');
  process.exit(0);
}

reset().catch(err => { console.error(err); process.exit(1); });
