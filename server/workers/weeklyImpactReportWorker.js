/**
 * Weekly Impact Report Worker
 * Runs every Sunday at 9 AM IST: creates a summary notification for each active student.
 *
 * Run: node workers/weeklyImpactReportWorker.js
 */

const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const Notification = require('../models/Notification');

async function processWeeklyImpactReports() {
    const now = new Date();
    console.log(`[WeeklyReport] Running at ${now.toISOString()}`);

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get active students
    const students = await User.find({
        isActive: true,
        role: 'student',
        lastLogin: { $gte: weekAgo } // Only for students active this week
    }).select('_id name gamification environmentalImpact').lean();

    console.log(`[WeeklyReport] Processing ${students.length} active students`);

    let sent = 0;

    for (const student of students) {
        try {
            // Count this week's activities
            const weekActivities = await ActivitySubmission.countDocuments({
                user: student._id,
                status: 'approved',
                createdAt: { $gte: weekAgo }
            });

            const impact = student.environmentalImpact || {};
            const points = student.gamification?.ecoPointsTotal || 0;
            const streak = student.gamification?.streakDays || 0;

            const message = `📊 Your weekly eco-impact:
• ${weekActivities} activities completed this week
• ${points.toLocaleString()} total eco-points earned
• 🌳 ${impact.treesPlanted || 0} trees planted
• 💧 ${(impact.waterSaved || 0).toFixed(0)}L water saved
• 🌫️ ${(impact.co2Prevented || 0).toFixed(1)}kg CO₂ prevented
• 🔥 ${streak}-day streak
Keep making a difference! 🌍`;

            await Notification.create({
                userId: student._id,
                type: 'system',
                title: 'Weekly Impact Report 📊',
                message,
                data: {
                    reportType: 'weekly_impact',
                    weekEnding: now.toISOString(),
                    metrics: {
                        weekActivities,
                        totalPoints: points,
                        treesPlanted: impact.treesPlanted || 0,
                        waterSaved: impact.waterSaved || 0,
                        co2Prevented: impact.co2Prevented || 0,
                        streak
                    }
                }
            });

            sent++;
        } catch (err) {
            console.error(`[WeeklyReport] Failed for user ${student._id}:`, err.message);
        }
    }

    console.log(`[WeeklyReport] Done. Sent ${sent} reports.`);
    return { processed: students.length, sent };
}

module.exports = { processWeeklyImpactReports };

if (require.main === module) {
    require('dotenv').config();
    const connectDB = require('../config/database');

    (async () => {
        try {
            await connectDB();
            const result = await processWeeklyImpactReports();
            console.log('[WeeklyReport] Result:', result);
            process.exit(0);
        } catch (error) {
            console.error('[WeeklyReport] Error:', error);
            process.exit(1);
        }
    })();
}
