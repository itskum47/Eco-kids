const { Queue } = require('bullmq');
const { queueRedis } = require('../services/cacheService');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_INTERVAL = '0 2 * * *'; // 2 AM IST (cron format)
const BACKUP_DIR = path.join(__dirname, '../../backups');
const S3_BUCKET = process.env.BACKUP_S3_BUCKET || 'ecokids-backups';
const backupQueue = new Queue('daily-backup', { connection: queueRedis });

const runMongoBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const backupPath = path.join(BACKUP_DIR, `ecokids-dump-${timestamp}`);
    const tarFile = `${backupPath}.tar.gz`;

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids-india';

    exec(`mongodump --uri="${mongoUri}" --out="${backupPath}"`, (err) => {
      if (err) {
        return reject(new Error(`Mongodump failed: ${err.message}`));
      }

      exec(`tar -czf "${tarFile}" -C "${BACKUP_DIR}" "ecokids-dump-${timestamp}"`, (tarErr) => {
        if (tarErr) {
          return reject(new Error(`Tar creation failed: ${tarErr.message}`));
        }

        exec(`rm -rf "${backupPath}"`, () => {
          resolve(tarFile);
        });
      });
    });
  });
};

const uploadToS3 = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const s3Path = `s3://${S3_BUCKET}/${fileName}`;

    exec(`aws s3 cp "${filePath}" "${s3Path}"`, (err) => {
      if (err) {
        return reject(new Error(`S3 upload failed: ${err.message}`));
      }
      resolve(s3Path);
    });
  });
};

const cleanupOldBackups = (keepDays = 7) => {
  return new Promise((resolve) => {
    const cutoffTime = Date.now() - keepDays * 24 * 60 * 60 * 1000;

    fs.readdir(BACKUP_DIR, (err, files) => {
      if (err) return resolve();

      files.forEach((file) => {
        const filePath = path.join(BACKUP_DIR, file);
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) return;
          if (stats.mtimeMs < cutoffTime) {
            fs.unlink(filePath, () => {});
          }
        });
      });

      resolve();
    });
  });
};

const runDailyBackup = async () => {
  try {
    console.log('[Daily Backup] Starting at', new Date().toISOString());

    const tarFile = await runMongoBackup();
    console.log('[Daily Backup] Mongodump complete:', tarFile);

    if (process.env.BACKUP_S3_BUCKET) {
      const s3Path = await uploadToS3(tarFile);
      console.log('[Daily Backup] Uploaded to S3:', s3Path);
    } else {
      console.log('[Daily Backup] S3 upload skipped (BACKUP_S3_BUCKET not set)');
    }

    await cleanupOldBackups();
    console.log('[Daily Backup] Cleanup complete');

    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('[Daily Backup] Failed:', error.message);
    throw error;
  }
};

const scheduleDailyBackups = async () => {
  await backupQueue.add('cron-backup', {}, { repeat: { pattern: BACKUP_INTERVAL } });
  console.log(`Daily backup scheduled: ${BACKUP_INTERVAL}`);
};

module.exports = {
  runDailyBackup,
  scheduleDailyBackups,
  backupQueue
};
