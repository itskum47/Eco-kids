/**
 * Seed initial badges for pilot testing.
 * Run: node scripts/seedBadges.js
 * Idempotent: checks for existing badges before creating.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { Badge } = require('../models/Gamification');

const BADGES = [
    {
        name: 'First Steps',
        description: 'Complete your first activity',
        icon: '🌱',
        category: 'milestone',
        criteria: { type: 'points', value: 10 },
        rarity: 'common',
        points: 5,
        isActive: true
    },
    {
        name: 'Quiz Whiz',
        description: 'Complete 5 quizzes',
        icon: '🧠',
        category: 'achievement',
        criteria: { type: 'quizzes', value: 5 },
        rarity: 'common',
        points: 10,
        isActive: true
    },
    {
        name: 'Eco Explorer',
        description: 'Earn 100 EcoPoints',
        icon: '🌍',
        category: 'milestone',
        criteria: { type: 'points', value: 100 },
        rarity: 'common',
        points: 15,
        isActive: true
    },
    {
        name: 'Lab Rat',
        description: 'Complete 3 experiments',
        icon: '🔬',
        category: 'achievement',
        criteria: { type: 'experiments', value: 3 },
        rarity: 'rare',
        points: 20,
        isActive: true
    },
    {
        name: 'Green Guardian',
        description: 'Earn 500 EcoPoints',
        icon: '🛡️',
        category: 'milestone',
        criteria: { type: 'points', value: 500 },
        rarity: 'rare',
        points: 25,
        isActive: true
    },
    {
        name: 'Streak Master',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'achievement',
        criteria: { type: 'streak', value: 7 },
        rarity: 'rare',
        points: 30,
        isActive: true
    },
    {
        name: 'Game Champion',
        description: 'Play 10 games',
        icon: '🎮',
        category: 'achievement',
        criteria: { type: 'games', value: 10 },
        rarity: 'epic',
        points: 35,
        isActive: true
    },
    {
        name: 'Planet Protector',
        description: 'Earn 1000 EcoPoints',
        icon: '🌟',
        category: 'milestone',
        criteria: { type: 'points', value: 1000 },
        rarity: 'epic',
        points: 50,
        isActive: true
    },
    {
        name: 'Eco Legend',
        description: 'Earn 5000 EcoPoints',
        icon: '👑',
        category: 'milestone',
        criteria: { type: 'points', value: 5000 },
        rarity: 'legendary',
        points: 100,
        isActive: true
    },
    {
        name: 'Streak Titan',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        category: 'special',
        criteria: { type: 'streak', value: 30 },
        rarity: 'legendary',
        points: 150,
        isActive: true
    }
];

async function seedBadges() {
    try {
        await connectDB();
        console.log('Connected to database.');

        const existing = await Badge.countDocuments();
        if (existing > 0) {
            console.log(`${existing} badges already exist. Skipping seed.`);
            process.exit(0);
        }

        const created = await Badge.insertMany(BADGES);
        console.log(`Seeded ${created.length} badges:`);
        created.forEach(b => console.log(`  ${b.icon} ${b.name} (${b.rarity}) — ${b.criteria.type} >= ${b.criteria.value}`));

        process.exit(0);
    } catch (error) {
        console.error('Seed badges error:', error);
        process.exit(1);
    }
}

seedBadges();
