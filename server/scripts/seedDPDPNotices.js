/**
 * Seed DataProcessingNotice records for DPDP Act 2023 compliance.
 * Run: node scripts/seedDPDPNotices.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const DataProcessingNotice = require('../models/DataProcessingNotice');

const notices = [
    {
        version: '1.0.0-core',
        title: 'Core Platform Operation',
        purpose: 'core_platform',
        legalBasis: 'performance_of_contract',
        description: 'We collect your name, email, school, and class information to create and manage your EcoKids account. This is essential for the platform to function. Data is stored securely in India.',
        dataCategories: ['identity', 'academic', 'device'],
        retentionPeriodDays: 730,
        thirdPartySharing: [],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    },
    {
        version: '1.0.0-gamification',
        title: 'Gamification and Rewards',
        purpose: 'gamification',
        legalBasis: 'performance_of_contract',
        description: 'We process your activity completion data, quiz scores, and engagement metrics to calculate eco-points, award badges, maintain streaks, and generate leaderboard rankings.',
        dataCategories: ['behavioral', 'academic'],
        retentionPeriodDays: 730,
        thirdPartySharing: [],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    },
    {
        version: '1.0.0-impact',
        title: 'Environmental Impact Tracking',
        purpose: 'environmental_impact',
        legalBasis: 'legitimate_interest',
        description: 'We track your verified environmental activities (tree planting, waste segregation, water saving) to calculate your personal and school\'s environmental impact. Photos are stored on Cloudinary (India servers).',
        dataCategories: ['environmental', 'media', 'location'],
        retentionPeriodDays: 730,
        thirdPartySharing: [{
            processor: 'Cloudinary',
            purpose: 'Photo/video evidence storage',
            dataTransferred: ['media'],
            location: 'India'
        }],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    },
    {
        version: '1.0.0-analytics',
        title: 'Usage Analytics',
        purpose: 'analytics',
        legalBasis: 'consent',
        description: 'We collect anonymized usage patterns (pages visited, features used, session duration) to improve the platform experience. This data is never sold to third parties.',
        dataCategories: ['behavioral', 'device'],
        retentionPeriodDays: 365,
        thirdPartySharing: [],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    },
    {
        version: '1.0.0-notifications',
        title: 'Notifications and Communications',
        purpose: 'notifications',
        legalBasis: 'consent',
        description: 'We use your device information to send push notifications about streak reminders, mission deadlines, and weekly impact reports. You can opt out at any time.',
        dataCategories: ['device'],
        retentionPeriodDays: 365,
        thirdPartySharing: [{
            processor: 'Firebase Cloud Messaging',
            purpose: 'Push notification delivery',
            dataTransferred: ['device'],
            location: 'India'
        }],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    },
    {
        version: '1.0.0-personalization',
        title: 'Content Personalization',
        purpose: 'content_personalization',
        legalBasis: 'consent',
        description: 'We use your grade level, completed topics, and quiz performance to recommend relevant educational content aligned with NCERT/NEP 2020 curriculum.',
        dataCategories: ['academic', 'behavioral'],
        retentionPeriodDays: 365,
        thirdPartySharing: [],
        isActive: true,
        effectiveFrom: new Date('2026-03-01')
    }
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database.');

        let created = 0;
        let skipped = 0;

        for (const notice of notices) {
            const exists = await DataProcessingNotice.findOne({ version: notice.version });
            if (exists) {
                skipped++;
                console.log(`  ⏭ ${notice.title} (v${notice.version}) — already exists`);
            } else {
                await DataProcessingNotice.create(notice);
                created++;
                console.log(`  ✅ ${notice.title} (v${notice.version}) — created`);
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
