const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const verifyDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecokids');
        console.log('--- MongoDB Verification Check ---');

        // Dynamic loading to handle missing models gracefully
        let counts = {};

        try { const Quiz = require('../models/Quiz'); counts.Quizzes = await Quiz.countDocuments({}); } catch (e) { counts.Quizzes = 'Model not found/Error' }
        try { const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({}, { strict: false })); counts.Topics = await Topic.countDocuments({}); } catch (e) { counts.Topics = 'Error' }
        try { const Game = mongoose.models.Game || mongoose.model('Game', new mongoose.Schema({}, { strict: false })); counts.Games = await Game.countDocuments({}); } catch (e) { counts.Games = 'Error' }
        try { const Experiment = mongoose.models.Experiment || mongoose.model('Experiment', new mongoose.Schema({}, { strict: false })); counts.Experiments = await Experiment.countDocuments({}); } catch (e) { counts.Experiments = 'Error' }

        console.log(counts);

        const success = Object.values(counts).every(c => c >= 60);
        if (success) {
            console.log('✅ VERIFICATION PASSED: All collections have at least 60 documents.');
        } else {
            console.log('❌ VERIFICATION WARNING: Some collections may be missing documents.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification failed', err);
        process.exit(1);
    }
}

verifyDatabase();
