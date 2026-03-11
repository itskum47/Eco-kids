const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ActivitySubmission = require('../models/ActivitySubmission');
const Assignment = require('../models/Assignment');

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Wait strictly for indexes to build
        await ActivitySubmission.syncIndexes();
        await Assignment.syncIndexes();
        console.log('✅ Indexes synced directly against cluster.');

        // 1. Explain pending submissions for a school
        const submissionExplain = await ActivitySubmission.find({ status: 'pending', schoolId: new mongoose.Types.ObjectId() })
            .lean()
            .explain('executionStats');

        console.log('\n🔍 ActivitySubmission Query Execution Stats (status + schoolId):');
        console.log(`Winning Plan Stage: ${submissionExplain.queryPlanner.winningPlan.stage}`);
        if (submissionExplain.queryPlanner.winningPlan.inputStage) {
            console.log(`Index Name Hit: ${submissionExplain.queryPlanner.winningPlan.inputStage.indexName}`);
        }

        // 2. Explain active assignments for a school
        const today = new Date();
        const assignmentExplain = await Assignment.find({ schoolId: new mongoose.Types.ObjectId(), deadline: { $gte: today } })
            .lean()
            .explain('executionStats');

        console.log('\n🔍 Assignment Query Execution Stats (schoolId + deadline):');
        console.log(`Winning Plan Stage: ${assignmentExplain.queryPlanner.winningPlan.stage}`);
        if (assignmentExplain.queryPlanner.winningPlan.inputStage) {
            console.log(`Index Name Hit: ${assignmentExplain.queryPlanner.winningPlan.inputStage.indexName}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIndexes();
