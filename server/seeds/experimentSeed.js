const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Generic Experiment Schema for Seeding
const ExperimentSchema = new mongoose.Schema({
    title: String,
    slug: String,
    category: String,
    minGrade: Number,
    maxGrade: Number,
    safety: String,
    ecoPointsReward: Number,
    estimatedTimeMinutes: Number,
    thumbnail: String,
    description: String,
    materials: [String],
    steps: [{ instruction: String, timeEstimate: String }],
    scienceExplanation: String,
    isActive: Boolean
});

const Experiment = mongoose.models.Experiment || mongoose.model('Experiment', ExperimentSchema);

const seedExperiments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecokids');
        console.log('MongoDB connected. Clearing existing experiments...');
        await Experiment.deleteMany({});

        const experiments = [];
        const categories = ['Waste', 'Water', 'Energy', 'Climate', 'Biodiversity'];
        const safetyMap = {
            1: 'adult', 2: 'adult', 3: 'adult',
            4: 'friend', 5: 'friend', 6: 'friend',
            7: 'solo', 8: 'solo', 9: 'solo', 10: 'solo', 11: 'solo', 12: 'solo'
        };

        for (let grade = 1; grade <= 12; grade++) {
            categories.forEach(cat => {
                const isAdvanced = grade > 6;

                experiments.push({
                    title: `Class ${grade}: ${cat} Lab Practical`,
                    slug: `${cat.toLowerCase()}-lab-class-${grade}-${Math.random().toString(36).substring(7)}`,
                    category: cat,
                    minGrade: grade,
                    maxGrade: grade,
                    safety: safetyMap[grade],
                    ecoPointsReward: 30 + (grade * 10),
                    estimatedTimeMinutes: 15 + (grade * 2),
                    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&fit=crop',
                    description: `Conduct a hands-on ${cat.toLowerCase()} experiment scaled for Class ${grade} curriculum capabilities.`,
                    materials: [
                        isAdvanced ? 'pH testing strips' : 'Plastic cups',
                        isAdvanced ? 'Graduated cylinders' : 'Water bucket',
                        'Safety goggles'
                    ],
                    steps: [
                        { instruction: 'Prepare the station and gather all resources.', timeEstimate: '5 min' },
                        { instruction: `Perform the ${cat.toLowerCase()} measurement protocol.`, timeEstimate: '10 min' },
                        { instruction: 'Record your findings on paper.', timeEstimate: '5 min' },
                        { instruction: 'Clean up the workspace.', timeEstimate: '5 min' }
                    ],
                    scienceExplanation: `At a Class ${grade} level, the science of ${cat.toLowerCase()} involves understanding how small scale chemical or physical reactions parallel massive planetary earth systems.`,
                    isActive: true
                });
            });
        }

        console.log(`Prepared ${experiments.length} experiments. Inserting...`);
        await Experiment.insertMany(experiments);
        console.log('✅ Successfully seeded 60 Experiments (5 per Grade 1-12) into the database!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding experiments:', error);
        process.exit(1);
    }
};

seedExperiments();
