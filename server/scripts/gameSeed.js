require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Game = require('../models/Game');
const User = require('../models/User');
const Topic = require('../models/Topic');

const GAMES = [
    {
        title: 'Waste Segregation Master',
        description: 'Sort dropping waste items into the correct wet, dry, and biohazard bins before time runs out!',
        instructions: 'Use the left and right arrow keys to move the bins. Catch the waste in the right bin.',
        category: 'sorting',
        gameType: 'html',
        difficulty: 'medium',
        status: 'published',
        estimatedTime: 5,
        gradeLevel: ['1', '2', '3', '4', '5'],
        environmentalTheme: { topic: 'waste-management', learningObjective: 'Identify dry vs wet waste' },
        indianContext: { setting: 'Indore Streets', characters: ['Swachh Bear'], scenarios: ['Morning waste collection'] }
    },
    {
        title: 'River Cleanup Racer',
        description: 'Navigate your electric boat down the river, collecting plastic debris while dodging wildlife.',
        instructions: 'Swipe left or right to steer. Collect plastic bottles for points.',
        category: 'adventure',
        gameType: 'canvas',
        difficulty: 'easy',
        status: 'published',
        estimatedTime: 10,
        gradeLevel: ['4', '5', '6', '7'],
        environmentalTheme: { topic: 'water-conservation', learningObjective: 'Understand river pollution' },
        indianContext: { setting: 'River Ganga', characters: ['Ganges River Dolphin'], scenarios: ['Avoiding nets'] }
    },
    {
        title: 'Solar Farm Builder',
        description: 'Place solar panels optimally across the grid to maximize energy generation and power the village.',
        instructions: 'Drag and drop solar panel blocks. Avoid shaded areas.',
        category: 'puzzle',
        gameType: 'canvas',
        difficulty: 'hard',
        status: 'published',
        estimatedTime: 15,
        gradeLevel: ['7', '8', '9', '10'],
        environmentalTheme: { topic: 'renewable-energy', learningObjective: 'Maximize solar array placement' },
        indianContext: { setting: 'Thar Desert', characters: ['Village Chief'], scenarios: ['Lighting up a village'] }
    },
    {
        title: 'Smog Buster',
        description: 'Plant trees to reduce the AQI (Air Quality Index) of the city before pollution reaches critical levels.',
        instructions: 'Click empty plots to plant trees. Upgrade mature trees to absorb more smog.',
        category: 'simulation',
        gameType: 'html',
        difficulty: 'medium',
        status: 'published',
        estimatedTime: 12,
        gradeLevel: ['5', '6', '7', '8'],
        environmentalTheme: { topic: 'air-pollution', learningObjective: 'Trees reduce air pollution' },
        indianContext: { setting: 'Delhi NCR', characters: ['Urban Planner'], scenarios: ['Winter smog season'] }
    },
    {
        title: 'Biodiversity Match',
        description: 'Match the flora and fauna of the Western Ghats to reveal the hidden forest spirit.',
        instructions: 'Click tiles to flip them. Match pairs to clear the board.',
        category: 'memory',
        gameType: 'html',
        difficulty: 'easy',
        status: 'published',
        estimatedTime: 3,
        gradeLevel: ['1', '2', '3', '4'],
        environmentalTheme: { topic: 'biodiversity', learningObjective: 'Recognize endemic species' },
        indianContext: { setting: 'Western Ghats', characters: ['Lion-tailed Macaque', 'Malabar Giant Squirrel'], scenarios: [] }
    },
    {
        title: 'Coral Reef Guardian',
        description: 'Protect the coral reefs of Lakshadweep from rising temperatures and plastic waste.',
        instructions: 'Drop cooling pods and waste nets to protect the coral.',
        category: 'adventure',
        gameType: 'canvas',
        difficulty: 'medium',
        status: 'published',
        estimatedTime: 8,
        gradeLevel: ['4', '5', '6', '7', '8'],
        environmentalTheme: { topic: 'water-conservation', learningObjective: 'Understand coral bleaching' },
        indianContext: { setting: 'Lakshadweep', characters: ['Sea Turtle'], scenarios: ['Bleaching event'] }
    },
    {
        title: 'Tiger Trail Pathfinder',
        description: 'Trace safe corridors for tigers to travel between fragmented forest reserves.',
        instructions: 'Draw a continuous line avoiding highways and poacher camps.',
        category: 'maze',
        gameType: 'html',
        difficulty: 'hard',
        status: 'published',
        estimatedTime: 10,
        gradeLevel: ['6', '7', '8', '9'],
        environmentalTheme: { topic: 'biodiversity', learningObjective: 'Importance of wildlife corridors' },
        indianContext: { setting: 'Central India Landscape', characters: ['Bengal Tiger'], scenarios: ['Crossing a highway'] }
    },
    {
        title: 'Compost Crafter',
        description: 'Mix the perfect ratio of green (nitrogen) and brown (carbon) materials to create rich compost.',
        instructions: 'Add ingredients from the kitchen and garden to keep the meter in the green zone.',
        category: 'simulation',
        gameType: 'html',
        difficulty: 'medium',
        status: 'published',
        estimatedTime: 5,
        gradeLevel: ['3', '4', '5', '6'],
        environmentalTheme: { topic: 'soil-health', learningObjective: 'Learn composting basics' },
        indianContext: { setting: 'A typical Indian kitchen garden', characters: ['Earthworm'], scenarios: ['Adding vegetable peels'] }
    },
    {
        title: 'Eco Quiz Show',
        description: 'A rapid-fire quiz game testing your knowledge across all environmental topics.',
        instructions: 'Select the correct answer before the timer runs out.',
        category: 'quiz',
        gameType: 'html',
        difficulty: 'hard',
        status: 'published',
        estimatedTime: 5,
        gradeLevel: ['8', '9', '10', '11', '12'],
        environmentalTheme: { topic: 'climate-change', learningObjective: 'General environmental knowledge' },
        indianContext: { setting: 'Studio', characters: ['Quizmaster'], scenarios: [] }
    },
    {
        title: 'Rainwater Catchment',
        description: 'Connect pipes to transport rainwater from roofs straight into underground aquifers.',
        instructions: 'Rotate pipe pieces to form a continuous line from the roof to the tank.',
        category: 'puzzle',
        gameType: 'html',
        difficulty: 'medium',
        status: 'published',
        estimatedTime: 8,
        gradeLevel: ['5', '6', '7', '8'],
        environmentalTheme: { topic: 'water-conservation', learningObjective: 'Rainwater harvesting' },
        indianContext: { setting: 'Chennai during monsoons', characters: ['Homeowner'], scenarios: ['Heavy rainfall'] }
    },
    {
        title: 'Forest Fire Watchout',
        description: 'Spot early signs of forest fires and dispatch water helicopters before the damage spreads.',
        instructions: 'Tap on smoke plumes quickly. Earn points for saving ancient trees.',
        category: 'adventure',
        gameType: 'canvas',
        difficulty: 'hard',
        status: 'published',
        estimatedTime: 12,
        gradeLevel: ['7', '8', '9', '10'],
        environmentalTheme: { topic: 'forest-conservation', learningObjective: 'Preventing forest fires' },
        indianContext: { setting: 'Himalayan Pine Forests', characters: ['Forest Guard'], scenarios: ['Dry summer winds'] }
    },
    {
        title: 'Household Energy Audit',
        description: 'Walk through a virtual house turning off appliances and replacing inefficient bulbs.',
        instructions: 'Click on energy-wasting items. Be quick before the electricity bill skyrockets.',
        category: 'simulation',
        gameType: 'html',
        difficulty: 'easy',
        status: 'published',
        estimatedTime: 4,
        gradeLevel: ['1', '2', '3', '4', '5'],
        environmentalTheme: { topic: 'climate-change', learningObjective: 'Energy conservation at home' },
        indianContext: { setting: 'Urban Apartment', characters: ['Parents'], scenarios: ['Leaving lights on'] }
    }
];

async function seedGames() {
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
                email: 'admin_games@ecokids.in',
                password: 'Password123!',
                role: 'admin',
                isEmailVerified: true
            });
            console.log('Created dummy admin user for seeding.');
        }

        await Game.deleteMany({});
        console.log('Cleared existing games.');

        const gamesWithAuthor = GAMES.map(g => ({
            ...g,
            author: author._id,
            publishedAt: new Date()
        }));

        let createdCount = 0;
        for (const g of gamesWithAuthor) {
            await Game.create(g);
            createdCount++;
        }
        console.log(`Successfully seeded ${createdCount} games!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding games:', err);
        process.exit(1);
    }
}

seedGames();
