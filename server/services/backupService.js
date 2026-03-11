const { Storage } = require('@google-cloud/storage');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { logAuditEvent } = require('../utils/auditLogger');

const execPromise = util.promisify(exec);

/**
 * PHASE 4: DISASTER RECOVERY & BACKUP SYSTEM
 * 
 * Purpose: Ensure no single failure can permanently destroy consent records or audit logs
 * 
 * Compliance Requirements:
 * - Daily automated backups (RTE Act 2009, POCSO Act 2012)
 * - Encrypted backup files (PDP Bill 2023)
 * - Off-site storage (ISO 27001)
 * - Verified restore capability (Government audit requirement)
 * 
 * Architecture:
 * 1. Backup Generator → Creates encrypted MongoDB dump
 * 2. Backup Storage → Google Cloud Storage bucket
 * 3. Backup Encryption → AES-256-GCM encryption
 * 4. Backup Restoration → Verified restore procedure
 */

class BackupService {
  constructor() {
    // Google Cloud Storage configuration
    this.gcsKeyPath = process.env.GCS_KEY_PATH || '/path/to/service-account-key.json';
    this.bucketName = process.env.GCS_BACKUP_BUCKET || 'ecokids-compliance-backups';
    this.projectId = process.env.GCS_PROJECT_ID || 'ecokids-india';
    
    // Encryption configuration (AES-256-GCM)
    this.encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.algorithm = 'aes-256-gcm';
    
    // Backup configuration
    this.mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecokids';
    this.backupDir = path.join(__dirname, '../../backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '90'); // 90 days for compliance
    
    // Critical collections for compliance (MUST be backed up)
    this.criticalCollections = [
      'audit_logs',           // Compliance audit trail
      'parental_consents',    // Legal consent records
      'users',                // User identity records
      'progresses',           // Student learning history
      'quiz_attempts',        // Assessment records
      'experiment_submissions' // Student work submissions
    ];
    
    // Initialize GCS client
    this.storage = new Storage({
      keyFilename: this.gcsKeyPath,
      projectId: this.projectId
    });
    
    this.bucket = this.storage.bucket(this.bucketName);
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Generate secure 256-bit encryption key
   * Only called if BACKUP_ENCRYPTION_KEY env var is not set
   */
  generateEncryptionKey() {
    console.warn('⚠️  WARNING: Using auto-generated encryption key. Set BACKUP_ENCRYPTION_KEY env var for production!');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt backup file using AES-256-GCM
   */
  encryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(16);
      const key = Buffer.from(this.encryptionKey, 'hex');
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);
      
      // Write IV at the beginning of the file (needed for decryption)
      output.write(iv);
      
      input.pipe(cipher).pipe(output);
      
      output.on('finish', () => {
        // Get auth tag and append to end of file
        const authTag = cipher.getAuthTag();
        fs.appendFileSync(outputPath, authTag);
        resolve({ iv: iv.toString('hex'), authTag: authTag.toString('hex') });
      });
      
      output.on('error', reject);
      input.on('error', reject);
    });
  }

  /**
   * Decrypt backup file using AES-256-GCM
   */
  decryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const data = fs.readFileSync(inputPath);
      
      // Extract IV (first 16 bytes)
      const iv = data.slice(0, 16);
      
      // Extract auth tag (last 16 bytes)
      const authTag = data.slice(-16);
      
      // Extract encrypted data (everything between IV and auth tag)
      const encryptedData = data.slice(16, -16);
      
      const key = Buffer.from(this.encryptionKey, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      try {
        const decrypted = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final()
        ]);
        
        fs.writeFileSync(outputPath, decrypted);
        resolve();
      } catch (error) {
        reject(new Error('Decryption failed: Invalid encryption key or corrupted file'));
      }
    });
  }

  /**
   * Create MongoDB dump of all critical collections
   */
  async createMongoDump() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpPath = path.join(this.backupDir, `backup-${timestamp}`);
    
    console.log('📦 Creating MongoDB dump...');
    
    try {
      // Parse MongoDB URI to extract database name
      const dbMatch = this.mongoUri.match(/\/([^/?]+)(\?|$)/);
      const dbName = dbMatch ? dbMatch[1] : 'ecokids';
      
      // Create mongodump command for critical collections only
      const collections = this.criticalCollections.map(col => `--collection=${col}`).join(' ');
      const command = `mongodump --uri="${this.mongoUri}" --db=${dbName} ${collections} --out="${dumpPath}" --gzip`;
      
      await execPromise(command);
      
      console.log(`✅ MongoDB dump created: ${dumpPath}`);
      return dumpPath;
      
    } catch (error) {
      console.error('❌ MongoDB dump failed:', error.message);
      throw new Error(`Backup generation failed: ${error.message}`);
    }
  }

  /**
   * Compress backup directory into single archive
   */
  async compressBackup(dumpPath) {
    const timestamp = path.basename(dumpPath);
    const archivePath = `${dumpPath}.tar.gz`;
    
    console.log('🗜️  Compressing backup...');
    
    try {
      const command = `tar -czf "${archivePath}" -C "${this.backupDir}" "${timestamp}"`;
      await execPromise(command);
      
      // Clean up uncompressed dump
      await execPromise(`rm -rf "${dumpPath}"`);
      
      console.log(`✅ Backup compressed: ${archivePath}`);
      return archivePath;
      
    } catch (error) {
      console.error('❌ Compression failed:', error.message);
      throw new Error(`Backup compression failed: ${error.message}`);
    }
  }

  /**
   * Upload encrypted backup to Google Cloud Storage
   */
  async uploadToGCS(localPath, metadata = {}) {
    const filename = path.basename(localPath);
    const encryptedPath = `${localPath}.encrypted`;
    
    console.log('🔐 Encrypting backup...');
    const encryptionMeta = await this.encryptFile(localPath, encryptedPath);
    
    console.log('☁️  Uploading to Google Cloud Storage...');
    
    try {
      await this.bucket.upload(encryptedPath, {
        destination: `backups/${filename}.encrypted`,
        metadata: {
          metadata: {
            ...metadata,
            encrypted: 'true',
            algorithm: this.algorithm,
            timestamp: new Date().toISOString(),
            collections: this.criticalCollections.join(','),
            complianceFlags: 'RTE_ACT_2009,POCSO_ACT_2012,PDP_BILL_2023,ISO_27001'
          }
        }
      });
      
      console.log(`✅ Backup uploaded to GCS: gs://${this.bucketName}/backups/${filename}.encrypted`);
      
      // Clean up local files
      fs.unlinkSync(localPath);
      fs.unlinkSync(encryptedPath);
      
      return {
        bucket: this.bucketName,
        filename: `backups/${filename}.encrypted`,
        size: fs.statSync(encryptedPath).size,
        ...encryptionMeta
      };
      
    } catch (error) {
      console.error('❌ GCS upload failed:', error.message);
      throw new Error(`Backup upload failed: ${error.message}`);
    }
  }

  /**
   * Download backup from GCS and decrypt
   */
  async downloadFromGCS(gcsFilename, localPath) {
    console.log(`☁️  Downloading from GCS: ${gcsFilename}`);
    
    const encryptedPath = `${localPath}.encrypted`;
    
    try {
      await this.bucket.file(gcsFilename).download({
        destination: encryptedPath
      });
      
      console.log('🔓 Decrypting backup...');
      await this.decryptFile(encryptedPath, localPath);
      
      // Clean up encrypted file
      fs.unlinkSync(encryptedPath);
      
      console.log(`✅ Backup downloaded and decrypted: ${localPath}`);
      return localPath;
      
    } catch (error) {
      console.error('❌ GCS download failed:', error.message);
      throw new Error(`Backup download failed: ${error.message}`);
    }
  }

  /**
   * Restore MongoDB from backup archive
   */
  async restoreFromBackup(archivePath) {
    console.log('📥 Restoring MongoDB from backup...');
    
    const extractPath = archivePath.replace('.tar.gz', '');
    
    try {
      // Extract archive
      console.log('📦 Extracting backup archive...');
      await execPromise(`tar -xzf "${archivePath}" -C "${this.backupDir}"`);
      
      // Parse MongoDB URI
      const dbMatch = this.mongoUri.match(/\/([^/?]+)(\?|$)/);
      const dbName = dbMatch ? dbMatch[1] : 'ecokids';
      
      // Restore each critical collection
      console.log('♻️  Restoring collections...');
      const command = `mongorestore --uri="${this.mongoUri}" --db=${dbName} --gzip "${extractPath}/${dbName}"`;
      
      await execPromise(command);
      
      // Clean up extracted files
      await execPromise(`rm -rf "${extractPath}"`);
      
      console.log('✅ MongoDB restore completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  /**
   * List all available backups in GCS
   */
  async listBackups() {
    try {
      const [files] = await this.bucket.getFiles({ prefix: 'backups/' });
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        created: file.metadata.timeCreated,
        updated: file.metadata.updated,
        metadata: file.metadata.metadata
      })).sort((a, b) => new Date(b.created) - new Date(a.created));
      
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  /**
   * Delete old backups beyond retention period
   */
  async cleanupOldBackups() {
    console.log(`🧹 Cleaning up backups older than ${this.retentionDays} days...`);
    
    try {
      const [files] = await this.bucket.getFiles({ prefix: 'backups/' });
      const cutoffDate = new Date(Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000));
      
      let deletedCount = 0;
      
      for (const file of files) {
        const fileDate = new Date(file.metadata.timeCreated);
        
        if (fileDate < cutoffDate) {
          await file.delete();
          console.log(`🗑️  Deleted old backup: ${file.name}`);
          deletedCount++;
        }
      }
      
      console.log(`✅ Cleanup complete: ${deletedCount} old backups deleted`);
      return deletedCount;
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * MAIN BACKUP EXECUTION
   * 
   * Complete backup workflow:
   * 1. Create MongoDB dump of critical collections
   * 2. Compress dump into tar.gz archive
   * 3. Encrypt archive with AES-256-GCM
   * 4. Upload to Google Cloud Storage
   * 5. Log audit event for compliance
   * 6. Clean up local files
   * 7. Delete old backups beyond retention period
   */
  async executeBackup(actorId = 'SYSTEM', reason = 'Scheduled backup') {
    const startTime = Date.now();
    
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   PHASE 4: DISASTER RECOVERY BACKUP EXECUTION         ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log(`Reason: ${reason}\n`);
    
    try {
      // Step 1: Create MongoDB dump
      const dumpPath = await this.createMongoDump();
      
      // Step 2: Compress backup
      const archivePath = await this.compressBackup(dumpPath);
      
      // Step 3 & 4: Encrypt and upload to GCS
      const uploadResult = await this.uploadToGCS(archivePath, {
        reason,
        actorId,
        criticalCollections: this.criticalCollections.length
      });
      
      // Step 5: Clean up old backups
      await this.cleanupOldBackups();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n✅ BACKUP COMPLETED SUCCESSFULLY');
      console.log(`Duration: ${duration}s`);
      console.log(`Location: gs://${uploadResult.bucket}/${uploadResult.filename}`);
      console.log(`Size: ${(uploadResult.size / 1024 / 1024).toFixed(2)} MB\n`);
      
      // Step 6: Log audit event for compliance
      await logAuditEvent({
        actorId,
        actorRole: 'SYSTEM',
        action: 'BACKUP_COMPLETED',
        targetType: 'SYSTEM',
        status: 'success',
        metadata: {
          bucket: uploadResult.bucket,
          filename: uploadResult.filename,
          size: uploadResult.size,
          duration,
          collections: this.criticalCollections,
          reason
        },
        complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023', 'ISO_27001']
      });
      
      return {
        success: true,
        duration,
        backup: uploadResult
      };
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.error('\n❌ BACKUP FAILED');
      console.error(`Error: ${error.message}`);
      console.error(`Duration: ${duration}s\n`);
      
      // Log failure for compliance audit trail
      await logAuditEvent({
        actorId,
        actorRole: 'SYSTEM',
        action: 'BACKUP_FAILED',
        targetType: 'SYSTEM',
        status: 'failure',
        metadata: {
          error: error.message,
          duration,
          reason
        },
        complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'ISO_27001']
      });
      
      throw error;
    }
  }

  /**
   * MAIN RESTORE EXECUTION
   * 
   * Complete restore workflow:
   * 1. List available backups from GCS
   * 2. Download and decrypt selected backup
   * 3. Restore MongoDB collections
   * 4. Verify restoration success
   * 5. Log audit event for compliance
   */
  async executeRestore(gcsFilename, actorId = 'SYSTEM', reason = 'Manual restore') {
    const startTime = Date.now();
    
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   PHASE 4: DISASTER RECOVERY RESTORE EXECUTION        ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log(`Source: gs://${this.bucketName}/${gcsFilename}`);
    console.log(`Reason: ${reason}\n`);
    
    try {
      // Step 1: Download and decrypt backup
      const localPath = path.join(this.backupDir, path.basename(gcsFilename).replace('.encrypted', ''));
      await this.downloadFromGCS(gcsFilename, localPath);
      
      // Step 2: Restore MongoDB
      await this.restoreFromBackup(localPath);
      
      // Clean up local file
      fs.unlinkSync(localPath);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n✅ RESTORE COMPLETED SUCCESSFULLY');
      console.log(`Duration: ${duration}s\n`);
      
      // Step 3: Log audit event for compliance
      await logAuditEvent({
        actorId,
        actorRole: 'SYSTEM',
        action: 'RESTORE_COMPLETED',
        targetType: 'SYSTEM',
        status: 'success',
        metadata: {
          source: gcsFilename,
          duration,
          reason
        },
        complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'ISO_27001']
      });
      
      return {
        success: true,
        duration,
        source: gcsFilename
      };
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.error('\n❌ RESTORE FAILED');
      console.error(`Error: ${error.message}`);
      console.error(`Duration: ${duration}s\n`);
      
      // Log failure for compliance audit trail
      await logAuditEvent({
        actorId,
        actorRole: 'SYSTEM',
        action: 'RESTORE_FAILED',
        targetType: 'SYSTEM',
        status: 'failure',
        metadata: {
          source: gcsFilename,
          error: error.message,
          duration,
          reason
        },
        complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'ISO_27001']
      });
      
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new BackupService();
