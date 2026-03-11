/**
 * Seed initial seasonal events.
 * Run: node scripts/seedSeasonalEvents.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const SeasonalEvent = require('../models/SeasonalEvent');

const events = [
    {
        title: 'Earth Day Challenge 2026',
        description: 'Double points for all eco-activities during Earth Day week! Plant trees, save water, and earn twice the rewards.',
        theme: 'earth_day',
        startsAt: new Date('2026-04-18T00:00:00+05:30'),
        endsAt: new Date('2026-04-25T23:59:59+05:30'),
        bonusMultiplier: 2.0,
        eligibleActivityTypes: ['tree-planting', 'waste-recycling', 'water-saving', 'biodiversity-survey'],
        isActive: true
    },
    {
        title: 'World Environment Day 2026',
        description: 'Triple points for tree planting and clean air activities! Join schools across India in making a difference.',
        theme: 'environment_day',
        startsAt: new Date('2026-06-01T00:00:00+05:30'),
        endsAt: new Date('2026-06-08T23:59:59+05:30'),
        bonusMultiplier: 3.0,
        eligibleActivityTypes: ['tree-planting', 'energy-saving'],
        isActive: true
    },
    {
        title: 'Diwali Clean Air Campaign 2026',
        description: 'Earn 2x points for energy-saving and waste reduction activities during Diwali week. Say no to crackers!',
        theme: 'diwali_clean',
        startsAt: new Date('2026-10-17T00:00:00+05:30'),
        endsAt: new Date('2026-10-25T23:59:59+05:30'),
        bonusMultiplier: 2.0,
        eligibleActivityTypes: ['energy-saving', 'waste-recycling', 'plastic-reduction'],
        isActive: true
    }
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database.');

        let created = 0;
        let skipped = 0;

        for (const event of events) {
            const exists = await SeasonalEvent.findOne({ title: event.title });
            if (exists) {
                skipped++;
                console.log(`  ⏭ ${event.title} — already exists`);
            } else {
                await SeasonalEvent.create(event);
                created++;
                console.log(`  ✅ ${event.title} — created`);
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
