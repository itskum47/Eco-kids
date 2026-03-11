/**
 * SLA Escalation Worker
 * Runs periodically to find unverified submissions older than 48 hours
 * and escalates them to school admins / platform admins.
 *
 * Can be run as:
 *   - BullMQ repeatable job (production)
 *   - Standalone cron: node workers/slaEscalationWorker.js
 */

const mongoose = require('mongoose');
const ActivitySubmission = require('../models/ActivitySubmission');
const Notification = require('../models/Notification');
const User = require('../models/User');
const FraudFlag = require('../models/FraudFlag');

const SLA_48H_MS = 48 * 60 * 60 * 1000;
const SLA_96H_MS = 96 * 60 * 60 * 1000;

/**
 * Process SLA escalations.
 * Called by BullMQ or standalone.
 */
async function processSLAEscalations() {
    const now = new Date();
    const cutoff48h = new Date(now.getTime() - SLA_48H_MS);
    const cutoff96h = new Date(now.getTime() - SLA_96H_MS);

    console.log(`[SLA Worker] Running at ${now.toISOString()}`);

    // ── Stage 1: 48h+ pending → Notify teacher + school admin ──
    const staleSubmissions48h = await ActivitySubmission.find({
        status: 'pending',
        createdAt: { $lte: cutoff48h, $gt: cutoff96h }
    })
        .populate('user', 'name profile.school')
        .lean();

    if (staleSubmissions48h.length > 0) {
        console.log(`[SLA Worker] Found ${staleSubmissions48h.length} submissions pending > 48h`);

        // Group by school for efficient notification
        const bySchool = {};
        for (const sub of staleSubmissions48h) {
            const school = sub.user?.profile?.school || 'Unknown';
            if (!bySchool[school]) bySchool[school] = [];
            bySchool[school].push(sub);
        }

        for (const [school, subs] of Object.entries(bySchool)) {
            // Find school admin and teachers for this school
            const staffMembers = await User.find({
                role: { $in: ['teacher', 'school_admin'] },
                'profile.school': school,
                isActive: true
            }).select('_id role').lean();

            for (const staff of staffMembers) {
                try {
                    await Notification.create({
                        userId: staff._id,
                        type: 'sla_warning',
                        title: 'Unverified Submissions',
                        message: `${subs.length} student submission(s) from ${school} have been pending for over 48 hours. Please review them.`,
                        metadata: {
                            submissionCount: subs.length,
                            school,
                            submissionIds: subs.map(s => s._id)
                        },
                        read: false
                    });
                } catch (err) {
                    // Skip if notification model doesn't have these exact fields
                    console.error('[SLA Worker] Notification create failed:', err.message);
                }
            }
        }
    }

    // ── Stage 2: 96h+ pending → Auto-flag for admin review ──
    const staleSubmissions96h = await ActivitySubmission.find({
        status: 'pending',
        createdAt: { $lte: cutoff96h }
    }).lean();

    if (staleSubmissions96h.length > 0) {
        console.log(`[SLA Worker] Found ${staleSubmissions96h.length} submissions pending > 96h — auto-flagging`);

        for (const sub of staleSubmissions96h) {
            // Check if already flagged
            const existingFlag = await FraudFlag.findOne({
                submissionId: sub._id,
                flagType: 'manual'
            });

            if (!existingFlag) {
                await FraudFlag.create({
                    submissionId: sub._id,
                    userId: sub.user,
                    flagType: 'manual',
                    confidence: 0.5,
                    details: `Auto-escalated: submission pending for over 96 hours without teacher verification`,
                    resolution: 'pending'
                });
            }
        }
    }

    const totalProcessed = staleSubmissions48h.length + staleSubmissions96h.length;
    console.log(`[SLA Worker] Done. Processed: ${totalProcessed} (48h: ${staleSubmissions48h.length}, 96h: ${staleSubmissions96h.length})`);

    return {
        processed: totalProcessed,
        notified48h: staleSubmissions48h.length,
        flagged96h: staleSubmissions96h.length
    };
}

module.exports = { processSLAEscalations };

// Run standalone if executed directly
if (require.main === module) {
    require('dotenv').config();
    const connectDB = require('../config/database');

    (async () => {
        try {
            await connectDB();
            const result = await processSLAEscalations();
            console.log('[SLA Worker] Result:', result);
            process.exit(0);
        } catch (error) {
            console.error('[SLA Worker] Error:', error);
            process.exit(1);
        }
    })();
}
