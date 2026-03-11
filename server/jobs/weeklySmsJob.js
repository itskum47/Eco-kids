const { Queue, Worker } = require('bullmq');
const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const { queueRedis } = require('../services/cacheService');
const { sendSms } = require('../services/smsService');

const weeklySmsQueue = new Queue('weekly-sms-report', { connection: queueRedis });

const initializeWeeklySmsJob = async () => {
  await weeklySmsQueue.add(
    'weekly-report',
    {},
    {
      repeat: { pattern: '0 9 * * 0' },
      removeOnComplete: true,
      removeOnFail: 10,
    }
  );

  const worker = new Worker(
    'weekly-sms-report',
    async () => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      const students = await User.find({
        role: 'student',
        parentPhone: { $exists: true, $ne: '' },
        isActive: true,
      }).select('name parentPhone ecoCoins');

      for (const student of students) {
        const phone = String(student.parentPhone || '').replace(/\D/g, '').slice(-10);
        if (!/^\d{10}$/.test(phone)) continue;

        const count = await ActivitySubmission.countDocuments({
          user: student._id,
          createdAt: { $gte: weekStart, $lte: now },
        });

        await sendSms({
          phone,
          message: `EcoKids Weekly Report for ${student.name}: ${count} activities, ${student.ecoCoins || 0} EcoCoins this week! - EcoKids India`,
        });
      }

      return { sent: students.length };
    },
    { connection: queueRedis }
  );

  worker.on('failed', (job, err) => {
    console.error('[WeeklySmsJob] failed:', job?.id, err?.message);
  });
};

module.exports = { initializeWeeklySmsJob };
