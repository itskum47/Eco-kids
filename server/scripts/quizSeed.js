require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const User = require('../models/User');

const QUIZZES = [
    {
        title: 'Solar Energy Basics',
        description: 'Test your understanding of Solar power generation in India.',
        category: 'renewable-energy',
        difficulty: 'easy',
        timeLimit: 5,
        gradeLevel: ['3', '4', '5', '6'],
        ecoPointsReward: 15,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Solar panels convert energy from what source?', questionType: 'multiple-choice', options: [{ optionText: 'The Moon', isCorrect: false }, { optionText: 'The Sun', isCorrect: true }, { optionText: 'Wind', isCorrect: false }, { optionText: 'Water', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'India is home to one of the largest solar parks in the world in Rajasthan. True or False?', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Waste Segregation Master Drill',
        description: 'Do you know which bin your trash belongs in?',
        category: 'waste-management',
        difficulty: 'medium',
        timeLimit: 8,
        gradeLevel: ['4', '5', '6', '7', '8'],
        ecoPointsReward: 20,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'What color bin is generally used for wet/biodegradable waste in India?', questionType: 'multiple-choice', options: [{ optionText: 'Red', isCorrect: false }, { optionText: 'Blue', isCorrect: false }, { optionText: 'Green', isCorrect: true }, { optionText: 'Yellow', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'E-waste (electronic waste) can be thrown in the dry waste blue bin.', questionType: 'true-false', correctAnswer: 'False', options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }], points: 5 }
        ]
    },
    {
        title: 'The Great Indian Bustard Mini-Quiz',
        description: 'Recall facts about this critically endangered Indian bird.',
        category: 'biodiversity',
        difficulty: 'hard',
        timeLimit: 5,
        gradeLevel: ['6', '7', '8', '9'],
        ecoPointsReward: 25,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Which state is the primary stronghold of the Great Indian Bustard?', questionType: 'multiple-choice', options: [{ optionText: 'Kerala', isCorrect: false }, { optionText: 'Rajasthan', isCorrect: true }, { optionText: 'Assam', isCorrect: false }, { optionText: 'Odisha', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'The GIB is an excellent flyer and migrates thousands of kilometers.', questionType: 'true-false', correctAnswer: 'False', options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }], points: 5 }
        ]
    },
    {
        title: 'Monsoon Dynamics',
        description: 'Test your knowledge on how the Indian monsoon affects our climate.',
        category: 'climate-change',
        difficulty: 'medium',
        timeLimit: 8,
        gradeLevel: ['5', '6', '7', '8'],
        ecoPointsReward: 20,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Which wind system brings most of the rain to the Indian subcontinent?', questionType: 'multiple-choice', options: [{ optionText: 'Northeast Monsoon', isCorrect: false }, { optionText: 'Southwest Monsoon', isCorrect: true }, { optionText: 'Western Disturbances', isCorrect: false }, { optionText: 'Trade Winds', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'A strong El Niño year usually leads to above average rainfall in India.', questionType: 'true-false', correctAnswer: 'False', options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }], points: 5 }
        ]
    },
    {
        title: 'Ganga Action Plan Basics',
        description: 'How much do you know about India\'s efforts to clean the National River?',
        category: 'water-conservation',
        difficulty: 'medium',
        timeLimit: 6,
        gradeLevel: ['8', '9', '10'],
        ecoPointsReward: 20,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'What is the heavily polluting industry often clustered along the Ganga in Kanpur?', questionType: 'multiple-choice', options: [{ optionText: 'IT Parks', isCorrect: false }, { optionText: 'Leather Tanneries', isCorrect: true }, { optionText: 'Automotive', isCorrect: false }, { optionText: 'Steel Plants', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'The current flagship program to clean the river is called Namami Gange.', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Forest Types of India',
        description: 'Match the flora to the correct regions in India.',
        category: 'forest-conservation',
        difficulty: 'hard',
        timeLimit: 10,
        gradeLevel: ['9', '10', '11', '12'],
        ecoPointsReward: 30,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Silent Valley National Park is known for which type of forest?', questionType: 'multiple-choice', options: [{ optionText: 'Tropical Evergreen', isCorrect: true }, { optionText: 'Desert Scrub', isCorrect: false }, { optionText: 'Alpine Tundra', isCorrect: false }, { optionText: 'Deciduous', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'The Sundarbans are the largest mangrove forests in the world.', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Project Tiger Review',
        description: 'A quiz covering India\'s most famous conservation program.',
        category: 'biodiversity',
        difficulty: 'easy',
        timeLimit: 5,
        gradeLevel: ['4', '5', '6', '7'],
        ecoPointsReward: 15,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'In what year was Project Tiger launched?', questionType: 'multiple-choice', options: [{ optionText: '1947', isCorrect: false }, { optionText: '1973', isCorrect: true }, { optionText: '1990', isCorrect: false }, { optionText: '2005', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'Project Tiger has resulted in an increase in the tiger population in India.', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Air Quality Index check',
        description: 'Can you decode the colors and numbers of the AQI scale?',
        category: 'air-pollution',
        difficulty: 'medium',
        timeLimit: 8,
        gradeLevel: ['7', '8', '9', '10'],
        ecoPointsReward: 22,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Which AQI range is considered "Good" (green)?', questionType: 'multiple-choice', options: [{ optionText: '0-50', isCorrect: true }, { optionText: '51-100', isCorrect: false }, { optionText: '101-200', isCorrect: false }, { optionText: '300+', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'PM 2.5 refers to particulate matter that is 2.5 meters in diameter.', questionType: 'true-false', correctAnswer: 'False', options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }], points: 5 }
        ]
    },
    {
        title: 'Natural Farming Concepts',
        description: 'Testing knowledge on Zero Budget Natural Farming practices in India.',
        category: 'soil-health',
        difficulty: 'hard',
        timeLimit: 12,
        gradeLevel: ['10', '11', '12'],
        ecoPointsReward: 35,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'Which of the following describes ZBNF (Zero Budget Natural Farming)?', questionType: 'multiple-choice', options: [{ optionText: 'Farming using heavy chemical fertilizers on a budget', isCorrect: false }, { optionText: 'Farming without utilizing any credit or chemical fertilizers', isCorrect: true }, { optionText: 'Farming only in greenhouses', isCorrect: false }, { optionText: 'Farming completely done by AI robots', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'Earthworms are considered harmful to soil health in natural farming.', questionType: 'true-false', correctAnswer: 'False', options: [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: true }], points: 5 }
        ]
    },
    {
        title: 'Plastic Pollution Awareness',
        description: 'Quiz on single-use plastics and alternative Indian traditions.',
        category: 'waste-management',
        difficulty: 'easy',
        timeLimit: 6,
        gradeLevel: ['2', '3', '4', '5'],
        ecoPointsReward: 15,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'What is a traditional, biodegradable alternative to plastic cups often used in India?', questionType: 'multiple-choice', options: [{ optionText: 'Styrofoam', isCorrect: false }, { optionText: 'Kulhad (clay cup)', isCorrect: true }, { optionText: 'Wax paper lined cups', isCorrect: false }, { optionText: 'Tetrapaks', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'Single-use plastic bags can take hundreds of years to decompose.', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Coastal Defense Systems',
        description: 'Understand the role of mangroves in protecting coastlines.',
        category: 'water-conservation',
        difficulty: 'medium',
        timeLimit: 8,
        gradeLevel: ['6', '7', '8', '9'],
        ecoPointsReward: 25,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'How do mangroves protect inland areas during cyclones?', questionType: 'multiple-choice', options: [{ optionText: 'By absorbing storm surge energy with complex root systems', isCorrect: true }, { optionText: 'By producing strong winds to push the storm back', isCorrect: false }, { optionText: 'By raising the land height through volcanic activity', isCorrect: false }, { optionText: 'Mangroves do not protect against cyclones', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'Mangrove forests store massive amounts of "blue carbon".', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    },
    {
        title: 'Wind Energy Facts',
        description: 'Basic introduction to another powerful renewable energy source.',
        category: 'renewable-energy',
        difficulty: 'easy',
        timeLimit: 5,
        gradeLevel: ['3', '4', '5', '6'],
        ecoPointsReward: 15,
        status: 'published',
        questions: [
            { questionNumber: 1, questionText: 'What machine is used to convert wind into electricity?', questionType: 'multiple-choice', options: [{ optionText: 'Wind Turbine', isCorrect: true }, { optionText: 'Solar Panel', isCorrect: false }, { optionText: 'Water Wheel', isCorrect: false }, { optionText: 'Diesel Generator', isCorrect: false }], points: 5 },
            { questionNumber: 2, questionText: 'Wind energy is considered a renewable resource because the wind will keep blowing.', questionType: 'true-false', correctAnswer: 'True', options: [{ optionText: 'True', isCorrect: true }, { optionText: 'False', isCorrect: false }], points: 5 }
        ]
    }
];

async function seedQuizzes() {
    try {
        await connectDB();
        console.log('Connected to database.');

        let author = await User.findOne({ role: 'admin' });
        if (!author) {
            author = await User.findOne({});
        }

        if (!author) {
            author = await User.create({
                name: 'EcoSystem Admin',
                email: 'admin_quizzes@ecokids.in',
                password: 'Password123!',
                role: 'admin',
                isEmailVerified: true
            });
        }

        // Try to get at least one Topic to associate quizzes with
        let someTopic = await Topic.findOne();
        if (!someTopic && QUIZZES.length > 0) {
            // Fallback: create a dummy topic if none exists
            someTopic = await Topic.create({
                title: 'Dummy Topic for Quizzes',
                description: 'Need a topic reference',
                content: 'Dummy content',
                category: 'climate-change',
                author: author._id
            });
        }

        await Quiz.deleteMany({});
        console.log('Cleared existing quizzes.');

        const quizzesWithTopicAndAuthor = QUIZZES.map((q, idx) => {
            const quiz = {
                ...q,
                // Just mapping all to identical topic for simplicity, usually you'd match up
                topic: someTopic._id,
                author: author._id,
                publishedAt: new Date()
            };

            // Ensure at least 3 questions per quiz so total seeded questions exceed 30.
            if (quiz.questions.length < 3) {
                quiz.questions.push({
                    questionNumber: 3,
                    questionText: `Demo question for ${quiz.title}: choose the best eco action.`,
                    questionType: 'multiple-choice',
                    options: [
                        { optionText: 'Reduce, Reuse, Recycle', isCorrect: true },
                        { optionText: 'Burn mixed waste', isCorrect: false },
                        { optionText: 'Waste clean water', isCorrect: false },
                        { optionText: 'Ignore pollution', isCorrect: false }
                    ],
                    points: 5
                });
            }

            return quiz;
        });

        let createdCount = 0;
        for (const q of quizzesWithTopicAndAuthor) {
            await Quiz.create(q);
            createdCount++;
        }
        console.log(`Successfully seeded ${createdCount} quizzes!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding quizzes:', err);
        process.exit(1);
    }
}

seedQuizzes();
