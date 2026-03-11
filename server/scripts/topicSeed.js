require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Topic = require('../models/Topic');
const User = require('../models/User');

const TOPICS = [
    {
        title: 'The Great Indian Bustard: A Bird on the Brink',
        description: 'Learn about one of India\'s heaviest flying birds, its habitat in Rajasthan, and why it is critically endangered.',
        content: '<p>The Great Indian Bustard (Ardeotis nigriceps) is a large bird with a horizontal body and long bare legs...</p>',
        category: 'biodiversity',
        difficulty: 'beginner',
        gradeLevel: ['3', '4', '5'],
        readingTime: 6,
        ecoPointsReward: 20,
        status: 'published',
        indianContext: {
            regions: ['west'],
            examples: [{ title: 'Desert National Park', description: 'Located in Rajasthan, this is one of the last strongholds of the GIB.', location: 'Rajasthan', imageUrl: '/assets/topics/gib.jpg' }]
        }
    },
    {
        title: 'Solar Power in Rajasthan: Powering the Future',
        description: 'Discover how the Thar Desert is being transformed into a massive solar energy hub (Bhadla Solar Park).',
        content: '<p>With 300 days of sunshine a year, Rajasthan is uniquely positioned to capture solar energy...</p>',
        category: 'renewable-energy',
        difficulty: 'intermediate',
        gradeLevel: ['6', '7', '8'],
        readingTime: 8,
        ecoPointsReward: 30,
        status: 'published',
        indianContext: {
            regions: ['west', 'central'],
            examples: [{ title: 'Bhadla Solar Park', description: 'The largest solar park in the world spread over 14,000 acres.', location: 'Rajasthan', imageUrl: '/assets/topics/bhadla.jpg' }]
        }
    },
    {
        title: 'Ganga Action Plan & Water Conservation',
        description: 'Understand the significance of the River Ganga and the efforts taken to clean it under the Namami Gange program.',
        content: '<p>The Ganga is more than just a river in India; it is a lifeline for hundreds of millions of people...</p>',
        category: 'water-conservation',
        difficulty: 'intermediate',
        gradeLevel: ['6', '7', '8', '9'],
        readingTime: 10,
        ecoPointsReward: 35,
        status: 'published',
        indianContext: {
            regions: ['north', 'east'],
            examples: [{ title: 'Namami Gange', description: 'An integrated conservation mission to accomplish the twin objectives of effective abatement of pollution and conservation of National River Ganga.', location: 'Uttar Pradesh', imageUrl: '/assets/topics/ganga.jpg' }]
        }
    },
    {
        title: 'Monsoon Magic: How Rain Shapes India',
        description: 'Dive into the science of the Indian monsoon and why it is critical for India\'s agriculture and economy.',
        content: '<p>The Southwest Monsoon brings around 70-80% of India\'s annual rainfall...</p>',
        category: 'climate-change',
        difficulty: 'beginner',
        gradeLevel: ['4', '5', '6'],
        readingTime: 5,
        ecoPointsReward: 20,
        status: 'published',
        indianContext: {
            regions: ['south', 'central', 'west', 'east', 'northeast'],
            examples: [{ title: 'Cherrapunji', description: 'One of the wettest places on earth.', location: 'Meghalaya', imageUrl: '/assets/topics/monsoon.jpg' }]
        }
    },
    {
        title: 'Waste Segregation 101: Swachh Bharat',
        description: 'Learn the difference between wet, dry, and hazardous waste to keep our cities clean and sustainable.',
        content: '<p>Proper waste segregation is the first step towards a clean environment...</p>',
        category: 'waste-management',
        difficulty: 'beginner',
        gradeLevel: ['1', '2', '3', '4'],
        readingTime: 4,
        ecoPointsReward: 15,
        status: 'published',
        indianContext: {
            regions: ['north', 'south', 'east', 'west', 'central', 'northeast'],
            examples: [{ title: 'Indore Model', description: 'Indore has been consistently ranked as India\'s cleanest city due to its incredible waste management systems.', location: 'Madhya Pradesh', imageUrl: '/assets/topics/indore.jpg' }]
        }
    },
    {
        title: 'The Silent Valley Movement',
        description: 'Explore the history of the movement that saved the tropical evergreen forests of Palakkad, Kerala.',
        content: '<p>In the 1970s and 80s, an environmental movement stopped a hydroelectric project that would have flooded the Silent Valley...</p>',
        category: 'forest-conservation',
        difficulty: 'advanced',
        gradeLevel: ['9', '10', '11', '12'],
        readingTime: 12,
        ecoPointsReward: 40,
        status: 'published',
        indianContext: {
            regions: ['south'],
            examples: [{ title: 'Silent Valley National Park', description: 'A unique preserve of tropical evergreen rain forests.', location: 'Kerala', imageUrl: '/assets/topics/silentvalley.jpg' }]
        }
    },
    {
        title: 'Air Quality: Decoding the AQI in Delhi',
        description: 'Understand what AQI means, PM2.5, and the causes of winter smog in northern India.',
        content: '<p>The Air Quality Index (AQI) acts like a thermometer that runs from 0 to 500...</p>',
        category: 'air-pollution',
        difficulty: 'intermediate',
        gradeLevel: ['7', '8', '9', '10'],
        readingTime: 9,
        ecoPointsReward: 30,
        status: 'published',
        indianContext: {
            regions: ['north'],
            examples: [{ title: 'Stubble Burning vs Vehicular Emissions', description: 'Understanding the complex causes of air pollution during winter months.', location: 'Delhi NCR', imageUrl: '/assets/topics/smog.jpg' }]
        }
    },
    {
        title: 'Saving the Snow Leopard',
        description: 'Journey to the high Himalayas to learn about the elusive "ghost of the mountains" and its conservation.',
        content: '<p>The snow leopard makes its home in the rugged, snowy mountains of Central and South Asia...',
        category: 'biodiversity',
        difficulty: 'beginner',
        gradeLevel: ['4', '5', '6'],
        readingTime: 6,
        ecoPointsReward: 25,
        status: 'published',
        indianContext: {
            regions: ['north'],
            examples: [{ title: 'Hemis National Park', description: 'A high altitude national park in Ladakh, globally famous for its snow leopards.', location: 'Ladakh', imageUrl: '/assets/topics/snowleopard.jpg' }]
        }
    },
    {
        title: 'Project Tiger: A Roaring Success',
        description: 'Learn how India launched the largest wildlife conservation initiatives in the world in 1973.',
        content: '<p>In 1973, Project Tiger was launched in Jim Corbett National Park to save the Bengal Tiger from extinction...</p>',
        category: 'biodiversity',
        difficulty: 'intermediate',
        gradeLevel: ['5', '6', '7', '8'],
        readingTime: 8,
        ecoPointsReward: 30,
        status: 'published',
        indianContext: {
            regions: ['central', 'north', 'south', 'east', 'west'],
            examples: [{ title: 'Jim Corbett National Park', description: 'The first national park of India, established in 1936.', location: 'Uttarakhand', imageUrl: '/assets/topics/tiger.jpg' }]
        }
    },
    {
        title: 'Mangroves and the Sundarbans',
        description: 'Discover how the largest mangrove forest in the world protects India’s eastern coast from cyclones.',
        content: '<p>Mangroves are salt-tolerant trees that grow in coastal saline or brackish water...</p>',
        category: 'ocean-health',
        difficulty: 'advanced',
        gradeLevel: ['8', '9', '10', '11'],
        readingTime: 10,
        ecoPointsReward: 35,
        status: 'published',
        indianContext: {
            regions: ['east'],
            examples: [{ title: 'Sundarbans', description: 'Home to the Royal Bengal Tiger and crucial for protecting the coastline.', location: 'West Bengal', imageUrl: '/assets/topics/sundarbans.jpg' }]
        }
    },
    {
        title: 'Soil Health and Zero Budget Natural Farming',
        description: 'Explore natural farming techniques that Indian farmers are adopting to revive soil fertility.',
        content: '<p>Zero Budget Natural Farming (ZBNF) is a set of farming methods that essentially involve no credit and no chemical fertilizers...</p>',
        category: 'soil-health',
        difficulty: 'advanced',
        gradeLevel: ['10', '11', '12'],
        readingTime: 12,
        ecoPointsReward: 40,
        status: 'published',
        indianContext: {
            regions: ['south', 'central'],
            examples: [{ title: 'Andhra Pradesh Model', description: 'Andhra Pradesh has committed to becoming a 100% natural farming state.', location: 'Andhra Pradesh', imageUrl: '/assets/topics/zbnf.jpg' }]
        }
    },
    {
        title: 'Plastic Alternatives and Eco-Friendly Living',
        description: 'Learn how traditional Indian practices like using kulhads and banana leaves are modern eco-solutions.',
        content: '<p>Before plastic became ubiquitous, many traditional practices across India were inherently zero-waste...</p>',
        category: 'sustainable-living',
        difficulty: 'beginner',
        gradeLevel: ['1', '2', '3', '4', '5'],
        readingTime: 5,
        ecoPointsReward: 20,
        status: 'published',
        indianContext: {
            regions: ['north', 'south', 'east', 'west', 'central', 'northeast'],
            examples: [{ title: 'Banana Leaves', description: 'Used traditionally in southern India for serving food, they are 100% biodegradable.', location: 'South India', imageUrl: '/assets/topics/bananaleaf.jpg' }]
        }
    }
];

async function seedTopics() {
    try {
        await connectDB();
        console.log('Connected to database.');

        // Find an admin or any user to assign as author
        let author = await User.findOne({ role: 'admin' });
        if (!author) {
            author = await User.findOne({});
        }

        // If absolutely no user exists, create a dummy one
        if (!author) {
            author = await User.create({
                name: 'EcoSystem Admin',
                email: 'admin@ecokids.in',
                password: 'Password123!',
                role: 'admin',
                isEmailVerified: true
            });
            console.log('Created dummy admin user for seeding.');
        }

        // Clear existing
        await Topic.deleteMany({});
        console.log('Cleared existing topics.');

        // Insert new
        const topicsWithAuthor = TOPICS.map(t => ({
            ...t,
            author: author._id,
            publishedAt: new Date()
        }));

        let createdCount = 0;
        for (const t of topicsWithAuthor) {
            await Topic.create(t);
            createdCount++;
        }
        console.log(`Successfully seeded ${createdCount} topics!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding topics:', err);
        process.exit(1);
    }
}

seedTopics();
