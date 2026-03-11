const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Generic Games Schema for Seeding
const GameSchema = new mongoose.Schema({
    title: String,
    slug: String,
    category: String,
    minGrade: Number,
    maxGrade: Number,
    difficulty: String,
    ecoPointsReward: Number,
    estimatedTimeMinutes: Number,
    thumbnail: String,
    url: String, // Where the game physically lives if iframe, etc
    description: String,
    isActive: Boolean
});

// Avoid OverwriteModelError
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

const seedGames = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecokids');
        console.log('MongoDB connected. Clearing existing games...');
        await Game.deleteMany({});

        const games = [];
        // We want 5 games per grade. (Categories: Waste, Water, Energy, Climate, Biodiversity)
        const categories = ['Waste', 'Water', 'Energy', 'Climate', 'Biodiversity'];
        const difficultyMap = { 1: 'Easy', 2: 'Easy', 3: 'Easy', 4: 'Medium', 5: 'Medium', 6: 'Medium', 7: 'Medium', 8: 'Hard', 9: 'Hard', 10: 'Hard', 11: 'Hard', 12: 'Hard' };

        for (let grade = 1; grade <= 12; grade++) {
            categories.forEach(cat => {
                games.push({
                    title: `${cat} Defender - Class ${grade}`,
                    slug: `${cat.toLowerCase()}-defender-class-${grade}-${Math.random().toString(36).substring(7)}`,
                    category: cat,
                    minGrade: grade,
                    maxGrade: grade,
                    difficulty: difficultyMap[grade],
                    ecoPointsReward: 10 + (grade * 5),
                    estimatedTimeMinutes: 5 + Math.floor(grade / 2),
                    thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=400&fit=crop',
                    url: `/games/${cat.toLowerCase()}-${grade}`,
                    description: `Play and defend the environment by mastering ${cat.toLowerCase()} principles suitable for Class ${grade} level understanding. Earn ${10 + (grade * 5)} XP on completion!`,
                    isActive: true
                });
            });
        }

        console.log(`Prepared ${games.length} games. Inserting...`);
        await Game.insertMany(games);
        console.log('✅ Successfully seeded 60 Games (5 per Grade 1-12) into the database!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding games:', error);
        process.exit(1);
    }
};

seedGames();
