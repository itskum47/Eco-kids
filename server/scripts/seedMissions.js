/**
 * Seed initial weekly missions for pilot testing.
 * Run: node scripts/seedMissions.js
 * Idempotent: checks for existing missions before creating.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const WeeklyMission = require('../models/WeeklyMission');

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const MISSION_TEMPLATES = [
    {
        title: 'Water Warrior',
        description: 'Submit 3 water-saving activities this week to earn the Water Warrior badge.',
        icon: '💧',
        difficulty: 'easy',
        objectives: [
            { action: 'submit_activity', activityType: 'water-saving', target: 3, description: 'Submit 3 water-saving activities' }
        ],
        reward: { ep: 30, badgeName: 'Water Warrior' }
    },
    {
        title: 'Quiz Champion',
        description: 'Complete 3 quizzes with a passing score this week.',
        icon: '🧠',
        difficulty: 'medium',
        objectives: [
            { action: 'complete_quiz', target: 3, description: 'Complete 3 quizzes' }
        ],
        reward: { ep: 35, badgeName: null }
    },
    {
        title: 'Green Scientist',
        description: 'Complete 2 experiments to unlock the Green Scientist badge.',
        icon: '🔬',
        difficulty: 'medium',
        objectives: [
            { action: 'complete_experiment', target: 2, description: 'Complete 2 experiments' }
        ],
        reward: { ep: 40, badgeName: 'Green Scientist' }
    },
    {
        title: 'Impact Leader',
        description: 'Get 5 activities approved by your teacher this week.',
        icon: '🌍',
        difficulty: 'hard',
        objectives: [
            { action: 'submit_activity', target: 5, description: 'Get 5 activities approved' }
        ],
        reward: { ep: 50, badgeName: 'Impact Leader' }
    },
    {
        title: 'Eco All-Rounder',
        description: 'Complete a quiz, submit an activity, and play a game this week.',
        icon: '⭐',
        difficulty: 'medium',
        objectives: [
            { action: 'complete_quiz', target: 1, description: 'Complete 1 quiz' },
            { action: 'submit_activity', target: 1, description: 'Submit 1 activity' },
            { action: 'play_game', target: 1, description: 'Play 1 game' }
        ],
        reward: { ep: 45, badgeName: 'Eco All-Rounder' }
    }
];

async function seedMissions() {
    try {
        await connectDB();
        console.log('Connected to database.');

        const now = new Date();
        const currentWeek = getWeekNumber(now);
        const currentYear = now.getFullYear();

        // Check if current week already has missions
        const existing = await WeeklyMission.countDocuments({
            weekNumber: currentWeek,
            year: currentYear
        });

        if (existing > 0) {
            console.log(`Week ${currentWeek}/${currentYear} already has ${existing} missions. Skipping.`);
            process.exit(0);
        }

        // Calculate week boundaries (Monday to Sunday)
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Pick 2 missions for this week (rotating selection)
        const missionIndex1 = currentWeek % MISSION_TEMPLATES.length;
        const missionIndex2 = (currentWeek + 1) % MISSION_TEMPLATES.length;

        const selectedTemplates = [
            MISSION_TEMPLATES[missionIndex1],
            MISSION_TEMPLATES[missionIndex2]
        ];

        const missions = selectedTemplates.map(template => ({
            ...template,
            weekNumber: currentWeek,
            year: currentYear,
            startsAt: monday,
            endsAt: sunday,
            isActive: true
        }));

        const created = await WeeklyMission.insertMany(missions);
        console.log(`Seeded ${created.length} missions for week ${currentWeek}/${currentYear}:`);
        created.forEach(m => console.log(`  - ${m.icon} ${m.title} (${m.difficulty})`));

        process.exit(0);
    } catch (error) {
        console.error('Seed missions error:', error);
        process.exit(1);
    }
}

seedMissions();
