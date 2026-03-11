/**
 * Seed 15 new badges (in addition to existing 10).
 * Run: node scripts/seedNewBadges.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const badges = [
    {
        name: 'Tree Hugger',
        description: 'Plant 5 verified trees',
        icon: '🌳',
        rarity: 'rare',
        triggerType: 'activity_count',
        triggerCondition: { activityType: 'tree-planting', count: 5 }
    },
    {
        name: 'Water Saver',
        description: 'Complete 5 water-saving activities',
        icon: '💧',
        rarity: 'rare',
        triggerType: 'activity_count',
        triggerCondition: { activityType: 'water-saving', count: 5 }
    },
    {
        name: 'Waste Warrior',
        description: '10 waste-segregation submissions approved',
        icon: '🗑️',
        rarity: 'epic',
        triggerType: 'activity_count',
        triggerCondition: { activityType: 'waste-recycling', count: 10 }
    },
    {
        name: 'Carbon Cutter',
        description: 'Prevent 50kg CO₂ cumulatively',
        icon: '🌫️',
        rarity: 'epic',
        triggerType: 'impact_threshold',
        triggerCondition: { metric: 'co2Prevented', threshold: 50 }
    },
    {
        name: 'Clean Air Champion',
        description: '5 anti-pollution activities completed',
        icon: '💨',
        rarity: 'legendary',
        triggerType: 'activity_count',
        triggerCondition: { activityType: 'energy-saving', count: 5 }
    },
    {
        name: 'Solar Scout',
        description: '3 energy-saving submissions',
        icon: '☀️',
        rarity: 'rare',
        triggerType: 'activity_count',
        triggerCondition: { activityType: 'energy-saving', count: 3 }
    },
    {
        name: 'Biodiversity Buddy',
        description: 'Complete all biodiversity lessons',
        icon: '🌿',
        rarity: 'epic',
        triggerType: 'lesson_completion',
        triggerCondition: { category: 'biodiversity', all: true }
    },
    {
        name: 'Mission Master',
        description: 'Complete 10 weekly missions',
        icon: '🎯',
        rarity: 'epic',
        triggerType: 'mission_count',
        triggerCondition: { count: 10 }
    },
    {
        name: 'Perfect Week',
        description: 'Complete all objectives in a single mission week',
        icon: '⭐',
        rarity: 'rare',
        triggerType: 'mission_perfect',
        triggerCondition: { perfectWeek: true }
    },
    {
        name: 'School Star',
        description: 'Rank #1 in your school leaderboard',
        icon: '👑',
        rarity: 'legendary',
        triggerType: 'leaderboard_rank',
        triggerCondition: { scope: 'school', rank: 1 }
    },
    {
        name: 'Early Bird',
        description: 'Log activity before 7 AM, 5 times',
        icon: '🌅',
        rarity: 'common',
        triggerType: 'time_based',
        triggerCondition: { beforeHour: 7, count: 5 }
    },
    {
        name: 'Weekend Warrior',
        description: 'Submit activities on 4 consecutive weekends',
        icon: '📅',
        rarity: 'rare',
        triggerType: 'streak_weekend',
        triggerCondition: { consecutiveWeekends: 4 }
    },
    {
        name: 'Team Player',
        description: 'Participate in 3 inter-school challenges',
        icon: '🤝',
        rarity: 'epic',
        triggerType: 'challenge_count',
        triggerCondition: { count: 3 }
    },
    {
        name: 'Content Creator',
        description: 'Teacher: Upload 5 approved lessons',
        icon: '✍️',
        rarity: 'rare',
        triggerType: 'teacher_content',
        triggerCondition: { approvedLessons: 5 }
    },
    {
        name: 'Mentor Badge',
        description: 'Teacher: Verify 100 student submissions',
        icon: '🎓',
        rarity: 'legendary',
        triggerType: 'teacher_verifications',
        triggerCondition: { verifiedCount: 100 }
    }
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database.');

        // Use the existing Badge/Gamification model
        let BadgeModel;
        try {
            BadgeModel = mongoose.model('Badge');
        } catch (e) {
            // If Badge model doesn't exist, create a lightweight one
            const badgeSchema = new mongoose.Schema({
                name: { type: String, required: true, unique: true },
                description: String,
                icon: String,
                rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
                triggerType: String,
                triggerCondition: mongoose.Schema.Types.Mixed
            }, { timestamps: true });
            BadgeModel = mongoose.model('Badge', badgeSchema);
        }

        let created = 0;
        let skipped = 0;

        for (const badge of badges) {
            const exists = await BadgeModel.findOne({ name: badge.name });
            if (exists) {
                skipped++;
                console.log(`  ⏭ ${badge.icon} ${badge.name} — already exists`);
            } else {
                await BadgeModel.create(badge);
                created++;
                console.log(`  ✅ ${badge.icon} ${badge.name} (${badge.rarity}) — created`);
            }
        }

        console.log(`\nDone: ${created} created, ${skipped} skipped.`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
