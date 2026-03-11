#!/usr/bin/env node
/**
 * Database Optimization Script
 * Run: node scripts/db-optimize.js
 * Adds compound indexes, text indexes, enforces timeouts.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecokids';

const indexes = [
    // ActivitySubmission — verification queue
    { collection: 'activitysubmissions', index: { status: 1, school: 1, createdAt: -1 }, options: { name: 'idx_pending_by_school' } },
    { collection: 'activitysubmissions', index: { user: 1, activityType: 1, createdAt: -1 }, options: { name: 'idx_user_activity_history' } },
    { collection: 'activitysubmissions', index: { pHash: 1 }, options: { name: 'idx_phash_dedup', sparse: true } },
    { collection: 'activitysubmissions', index: { status: 1, createdAt: 1 }, options: { name: 'idx_sla_escalation' } },

    // User — leaderboards
    { collection: 'users', index: { role: 1, isActive: 1, 'gamification.ecoPoints': -1 }, options: { name: 'idx_global_leaderboard' } },
    { collection: 'users', index: { 'profile.school': 1, role: 1, 'gamification.ecoPoints': -1 }, options: { name: 'idx_school_leaderboard' } },
    { collection: 'users', index: { 'profile.district': 1, role: 1, 'gamification.ecoPoints': -1 }, options: { name: 'idx_district_leaderboard' } },
    { collection: 'users', index: { 'profile.state': 1, role: 1, 'gamification.ecoPoints': -1 }, options: { name: 'idx_state_leaderboard' } },
    { collection: 'users', index: { 'gamification.streak.current': -1 }, options: { name: 'idx_streak_ranking' } },

    // ContentItem — CMS queries
    { collection: 'contentitems', index: { status: 1, category: 1, createdAt: -1 }, options: { name: 'idx_content_browse' } },
    { collection: 'contentitems', index: { gradeLevel: 1, status: 1 }, options: { name: 'idx_content_by_grade' } },
    { collection: 'contentitems', index: { title: 'text', summary: 'text', ncertAlignmentTags: 'text' }, options: { name: 'idx_content_text_search', default_language: 'english' } },

    // Notifications — user inbox
    { collection: 'notifications', index: { userId: 1, read: 1, createdAt: -1 }, options: { name: 'idx_user_notifications' } },

    // FraudFlag — admin queue
    { collection: 'fraudflags', index: { status: 1, severity: -1, createdAt: 1 }, options: { name: 'idx_fraud_queue' } },

    // EcoPointsTransaction — history
    { collection: 'ecopointstransactions', index: { userId: 1, createdAt: -1 }, options: { name: 'idx_points_history' } },
    { collection: 'ecopointstransactions', index: { idempotencyKey: 1 }, options: { name: 'idx_idempotency', unique: true, sparse: true } },

    // SchoolRegistrationRequest — onboarding
    { collection: 'schoolregistrationrequests', index: { status: 1, createdAt: 1 }, options: { name: 'idx_pending_schools' } },
    { collection: 'schoolregistrationrequests', index: { udiseCode: 1 }, options: { name: 'idx_udise_lookup', unique: true } },

    // EngagementEvent — analytics
    { collection: 'engagementevents', index: { userId: 1, type: 1, createdAt: -1 }, options: { name: 'idx_engagement_funnel' } },

    // ConsentRecord — compliance
    { collection: 'consentrecords', index: { userId: 1, purpose: 1 }, options: { name: 'idx_user_consent' } },
];

async function run() {
    console.log('🔧 EcoKids Database Optimization\n');

    await mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const { collection, index, options } of indexes) {
        try {
            await db.collection(collection).createIndex(index, options);
            console.log(`  ✅ ${collection}.${options.name}`);
            created++;
        } catch (err) {
            if (err.code === 85 || err.code === 86) {
                console.log(`  ⏭️  ${collection}.${options.name} (already exists)`);
                skipped++;
            } else {
                console.log(`  ❌ ${collection}.${options.name}: ${err.message}`);
                failed++;
            }
        }
    }

    // Set profiling level for slow queries (>100ms)
    try {
        await db.command({ profile: 1, slowms: 100 });
        console.log('\n✅ Slow query profiling enabled (>100ms)');
    } catch (e) {
        console.log('\n⚠️  Could not enable profiling (requires admin)');
    }

    console.log(`\n📊 Results: ${created} created, ${skipped} skipped, ${failed} failed`);
    console.log('   Total indexes configured:', indexes.length);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
