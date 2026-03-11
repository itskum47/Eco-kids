const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('../models/Topic');

dotenv.config({ path: '../.env' });

const seedTopics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecokids');
        console.log('MongoDB connected. Clearing existing topics...');

        try {
            await Topic.deleteMany({});
        } catch (e) { console.log('Topic deleteMany failed', e) }

        const dummyAuthorId = new mongoose.Types.ObjectId();
        const topics = [];
        const categories = ['waste-management', 'water-conservation', 'renewable-energy', 'climate-change', 'biodiversity'];

        const formatTopicName = (categoryStr) => {
            return categoryStr.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };

        const difficulties = {
            1: 'beginner', 2: 'beginner', 3: 'beginner',
            4: 'beginner', 5: 'intermediate', 6: 'intermediate', 7: 'intermediate', 8: 'intermediate',
            9: 'advanced', 10: 'advanced', 11: 'advanced', 12: 'advanced'
        };

        const generateSlug = (title) => {
            return title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
        }

        for (let grade = 1; grade <= 12; grade++) {
            categories.forEach(cat => {
                const title = `${formatTopicName(cat)} - Level ${grade}`;
                topics.push({
                    title: title,
                    slug: generateSlug(title + ' ' + Math.random().toString(36).substring(7)),
                    category: cat,
                    description: `Comprehensive module covering ${formatTopicName(cat).toLowerCase()} principles tailored for Class ${grade} students according to CBSE/NCERT guidelines.`,
                    content: 'Detailed interactive content would be rendered here via the CMS.',
                    gradeLevel: [grade.toString()],
                    difficulty: difficulties[grade],
                    ecoPointsReward: 30 + (grade * 5),
                    author: dummyAuthorId,
                    status: 'published'
                });
            });
        }

        console.log(`Prepared ${topics.length} topics. Inserting...`);
        try {
            await Topic.insertMany(topics);
            console.log('✅ Successfully seeded 60 Topics (5 per Grade 1-12) into the database!');
        } catch (e) {
            console.error('Error inserting topics:', e);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding topics:', error);
        process.exit(1);
    }
};

seedTopics();
