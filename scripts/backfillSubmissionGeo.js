const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const ActivitySubmission = require('../server/models/ActivitySubmission');
const User = require('../server/models/User');

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecokids');
    console.log("Connected to DB, starting geo backfill...");

    const submissions = await ActivitySubmission.find({
        school: { $exists: false }
    }).populate("user");

    let updatedCount = 0;
    for (const submission of submissions) {
        if (!submission.user || !submission.user.profile) continue;

        submission.school = submission.user.profile.school;
        submission.district = submission.user.profile.district;
        submission.state = submission.user.profile.state;

        await submission.save();
        updatedCount++;
    }

    console.log(`Backfill completed! Updated ${updatedCount} submissions.`);
    process.exit(0);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
