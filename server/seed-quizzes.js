const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
const Topic = require('./models/Topic');

dotenv.config();

const seedQuizzes = async () => {
    try {
        console.log('🌱 Starting quiz seeder...');

        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids',
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        console.log('✅ Connected to MongoDB');

        // Get any user
        let authorId = null;
        const anyUser = await User.findOne({});
        if (anyUser) {
            authorId = anyUser._id;
        } else {
            console.warn('⚠️ No user found!');
            authorId = new mongoose.Types.ObjectId();
        }

        // Ensure a topic exists
        let defaultTopic = await Topic.findOne({});
        if (!defaultTopic) {
            defaultTopic = await Topic.create({
                title: 'General Environmental Science',
                slug: 'general-environmental-science',
                description: 'A mix of various eco-friendly topics.',
                content: 'Basic content for environmental science.',
                category: 'climate-change',
                gradeLevel: ['6', '7', '8'],
                status: 'published',
                author: authorId
            });
            console.log('✅ Created dummy Topic for quizzes');
        }

        // Clear existing quizzes
        await Quiz.deleteMany({});
        console.log('🗑️  Cleared existing quizzes');

        const sampleQuizzes = [
            {
                title: 'Water Conservation Hero',
                slug: 'water-conservation-hero',
                description: 'Test your knowledge on how to save water at home and school!',
                objective: 'Learn practical ways to conserve water daily.',
                category: 'water-conservation',
                difficulty: 'easy',
                status: 'published',
                featured: true,
                author: authorId,
                topic: defaultTopic._id,
                timeLimit: 15,
                passingScore: 60,
                ecoPointsReward: 100,
                questions: [
                    {
                        questionNumber: 1,
                        questionType: 'multiple-choice',
                        questionText: 'Should you leave the tap running while brushing your teeth?',
                        options: [
                            { optionText: 'Yes', isCorrect: false, explanation: 'Leaving the tap running wastes a lot of water.' },
                            { optionText: 'No', isCorrect: true, explanation: 'Turning off the tap saves gallons of water every day!' },
                            { optionText: 'Only in the morning', isCorrect: false, explanation: 'Water should be saved at all times.' }
                        ],
                        points: 10
                    }
                ]
            },
            {
                title: 'Recycling Master',
                slug: 'recycling-master',
                description: 'Do you know which bin your trash goes into? Take this quiz to find out!',
                objective: 'Understand the basics of waste segregation and recycling.',
                category: 'waste-management',
                difficulty: 'medium',
                status: 'published',
                featured: true,
                author: authorId,
                topic: defaultTopic._id,
                timeLimit: 20,
                passingScore: 70,
                ecoPointsReward: 150,
                questions: [
                    {
                        questionNumber: 1,
                        questionType: 'multiple-choice',
                        questionText: 'Which bin should an empty plastic bottle go into?',
                        options: [
                            { optionText: 'Wet Waste Bin', isCorrect: false, explanation: 'Wet waste is for organic material.' },
                            { optionText: 'Dry Waste / Recycling Bin', isCorrect: true, explanation: 'Plastic is recyclable dry waste.' },
                            { optionText: 'Hazardous Waste Bin', isCorrect: false, explanation: 'Plastic bottles are not hazardous.' }
                        ],
                        points: 10
                    }
                ]
            },
            {
                title: 'Solar Energy Explorer',
                slug: 'solar-energy-explorer',
                description: 'Learn about the power of the sun and how it gives us clean energy.',
                objective: 'Discover the benefits of renewable solar energy.',
                category: 'renewable-energy',
                difficulty: 'hard',
                status: 'published',
                featured: false,
                author: authorId,
                topic: defaultTopic._id,
                timeLimit: 25,
                passingScore: 80,
                ecoPointsReward: 200,
                questions: [
                    {
                        questionNumber: 1,
                        questionType: 'multiple-choice',
                        questionText: 'What do solar panels convert sunlight into?',
                        options: [
                            { optionText: 'Heat', isCorrect: false, explanation: 'While they get warm, their main job is generating electricity.' },
                            { optionText: 'Electricity', isCorrect: true, explanation: 'Solar panels (photovoltaic cells) convert sunlight directly into electricity.' },
                            { optionText: 'Wind', isCorrect: false, explanation: 'Wind turbines generate wind energy, not solar panels.' }
                        ],
                        points: 10
                    }
                ]
            }
        ];

        await Quiz.insertMany(sampleQuizzes);
        console.log(`✅ Seeded ${sampleQuizzes.length} quizzes successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding quizzes:', error);
        process.exit(1);
    }
};

seedQuizzes();
