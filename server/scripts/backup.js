#!/usr/bin/env node

/**
 * PHASE 4: MANUAL BACKUP EXECUTION SCRIPT
 * 
 * Usage:
 *   node scripts/backup.js
 *   node scripts/backup.js --reason="Pre-deployment backup"
 * 
 * This script triggers a manual backup outside the scheduled cron job.
 * Useful for:
 * - Pre-deployment backups
 * - Pre-migration backups
 * - Testing backup system
 * - Emergency backups
 */

require('dotenv').config();
const backupService = require('../services/backupService');

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const reasonArg = args.find(arg => arg.startsWith('--reason='));
  const reason = reasonArg ? reasonArg.split('=')[1] : 'Manual backup';
  
  console.log('\n🚀 Starting manual backup execution...\n');
  
  try {
    const result = await backupService.executeBackup('ADMIN', reason);
    
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ BACKUP EXECUTION SUCCESS');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Duration: ${result.duration}s`);
    console.log(`Location: gs://${result.backup.bucket}/${result.backup.filename}`);
    console.log(`Size: ${(result.backup.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('════════════════════════════════════════════════════════');
    console.error('❌ BACKUP EXECUTION FAILED');
    console.error('════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error('════════════════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

main();
