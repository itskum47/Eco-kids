const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const { calculateImpact } = require('../utils/impactCalculator');
const logger = require('../utils/logger'); // Let's use the central logger

async function sendDailyDigest() {
    try {
        logger.info('📦 Running Daily Digest Cron Job...');

        // Target Date: Yesterday
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // Fetch all district admins to notify
        const districtAdmins = await User.find({ role: 'district_admin' });
        if (districtAdmins.length === 0) {
            logger.info('No District Admins found for Daily Digest. Exiting task.');
            return;
        }

        // Aggregate yesterday's APPROVED submissions
        for (const admin of districtAdmins) {
            if (!admin.profile || !admin.profile.district) continue;
            const district = admin.profile.district;

            const allApproved = await ActivitySubmission.find({
                status: 'approved',
                verifiedAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
            }).populate('user', 'profile.school profile.district');

            const districtSubmissions = allApproved.filter(s => s.user && s.user.profile.district === district);

            if (districtSubmissions.length === 0) {
                logger.info(`No verified activities yesterday for district ${district}. Skipping email.`);
                continue;
            }

            let totalCo2 = 0;
            const activeSchools = new Set();
            const engagedStudents = new Set();

            districtSubmissions.forEach(sub => {
                const impact = calculateImpact(sub.activityType);
                totalCo2 += (impact.co2Prevented || 0);
                activeSchools.add(sub.user.profile.school);
                engagedStudents.add(sub.user._id.toString());
            });

            // Prepare Email Content
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1e3a8a;">EcoKids India</h2>
                    <p style="font-size: 16px;">Yesterday's verified impact summary for <strong>${district}</strong>:</p>
                    
                    <ul style="font-size: 16px; line-height: 1.6; background-color: #f8fafc; padding: 20px 40px; border-radius: 8px;">
                        <li><strong>${districtSubmissions.length}</strong> submissions approved</li>
                        <li><strong>${totalCo2} kg</strong> CO₂ offset</li>
                        <li><strong>${activeSchools.size}</strong> schools active</li>
                        <li><strong>${engagedStudents.size}</strong> students engaged</li>
                    </ul>
                    
                    <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                        This is an automated system report. You can review full metrics on your District Dashboard.
                    </p>
                </div>
            `;

            logger.info(`Drafting Digest to ${admin.email}...`);

            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_PORT == 465,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: `"EcoKids Operations" <${process.env.SMTP_USER}>`,
                    to: admin.email,
                    subject: `EcoKids Impact Digest: ${district}`,
                    html: emailHtml
                });
                logger.info(`✅ Daily Digest sent to ${admin.email}`);
            } else {
                logger.warn('⚠️ SMTP Credentials missing. Mocking email delivery in logs:');
                logger.info(emailHtml);
            }
        }

        logger.info('🚀 Daily Digest task completed successfully.');

    } catch (err) {
        logger.error('❌ Daily Digest Task Failed:', err);
    }
}

module.exports = { sendDailyDigest };
