#!/usr/bin/env node

/**
 * PHASE 4: DISASTER RECOVERY RESTORE SCRIPT
 * 
 * Usage:
 *   node scripts/restore.js --list
 *   node scripts/restore.js --file=backups/backup-2026-02-22.tar.gz.encrypted
 *   node scripts/restore.js --latest
 * 
 * This script restores MongoDB from a GCS backup.
 * 
 * ⚠️  WARNING: This will OVERWRITE existing data in MongoDB!
 * 
 * Restore workflow:
 * 1. List available backups (optional)
 * 2. Download and decrypt selected backup from GCS
 * 3. Restore MongoDB collections
 * 4. Verify restoration
 * 5. Log audit event
 * 
 * Government compliance requirement:
 * - Auditors will request demonstration of restore capability
 * - This script provides that demonstration
 */

require('dotenv').config();
const backupService = require('../services/backupService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listBackups() {
  console.log('\n📋 Fetching available backups from GCS...\n');
  
  try {
    const backups = await backupService.listBackups();
    
    if (backups.length === 0) {
      console.log('⚠️  No backups found in GCS bucket.');
      return [];
    }
    
    console.log('Available Backups:');
    console.log('════════════════════════════════════════════════════════\n');
    
    backups.forEach((backup, index) => {
      const date = new Date(backup.created);
      const size = (backup.size / 1024 / 1024).toFixed(2);
      
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Created: ${date.toLocaleString()}`);
      console.log(`   Size: ${size} MB`);
      if (backup.metadata) {
        console.log(`   Reason: ${backup.metadata.reason || 'N/A'}`);
        console.log(`   Collections: ${backup.metadata.collections || 'N/A'}`);
      }
      console.log();
    });
    
    console.log('════════════════════════════════════════════════════════\n');
    
    return backups;
    
  } catch (error) {
    console.error(`❌ Failed to list backups: ${error.message}`);
    process.exit(1);
  }
}

async function confirmRestore() {
  console.log('\n⚠️  WARNING: This will OVERWRITE existing data in MongoDB!\n');
  console.log('This action will:');
  console.log('  - Replace current consent records');
  console.log('  - Replace current audit logs');
  console.log('  - Replace current user data');
  console.log('  - Replace current progress records\n');
  
  const answer = await question('Are you sure you want to proceed? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Restore cancelled by user.\n');
    rl.close();
    process.exit(0);
  }
  
  console.log();
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const listOnly = args.includes('--list');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const latest = args.includes('--latest');
  const reasonArg = args.find(arg => arg.startsWith('--reason='));
  
  const reason = reasonArg ? reasonArg.split('=')[1] : 'Manual restore';
  
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   PHASE 4: DISASTER RECOVERY RESTORE UTILITY          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  // List backups if requested
  if (listOnly) {
    await listBackups();
    rl.close();
    process.exit(0);
  }
  
  // Get list of backups
  const backups = await listBackups();
  
  if (backups.length === 0) {
    console.log('❌ No backups available for restore.\n');
    rl.close();
    process.exit(1);
  }
  
  let selectedBackup;
  
  // Select backup file
  if (fileArg) {
    const filename = fileArg.split('=')[1];
    selectedBackup = backups.find(b => b.name === filename);
    
    if (!selectedBackup) {
      console.error(`❌ Backup file not found: ${filename}\n`);
      rl.close();
      process.exit(1);
    }
  } else if (latest) {
    selectedBackup = backups[0]; // backups are sorted by date descending
    console.log(`📌 Selected latest backup: ${selectedBackup.name}\n`);
  } else {
    // Interactive selection
    const answer = await question('Enter backup number to restore (or "latest" for most recent): ');
    
    if (answer.toLowerCase() === 'latest') {
      selectedBackup = backups[0];
    } else {
      const index = parseInt(answer) - 1;
      
      if (index < 0 || index >= backups.length) {
        console.error('❌ Invalid backup number.\n');
        rl.close();
        process.exit(1);
      }
      
      selectedBackup = backups[index];
    }
  }
  
  console.log(`\n📦 Selected backup: ${selectedBackup.name}`);
  console.log(`📅 Created: ${new Date(selectedBackup.created).toLocaleString()}`);
  console.log(`📊 Size: ${(selectedBackup.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Confirm restore
  await confirmRestore();
  
  console.log('🚀 Starting restore execution...\n');
  
  try {
    const result = await backupService.executeRestore(selectedBackup.name, 'ADMIN', reason);
    
    console.log('════════════════════════════════════════════════════════');
    console.log('✅ RESTORE EXECUTION SUCCESS');
    console.log('════════════════════════════════════════════════════════');
    console.log(`Duration: ${result.duration}s`);
    console.log(`Source: gs://${backupService.bucketName}/${result.source}`);
    console.log('════════════════════════════════════════════════════════');
    console.log('\n✅ Your compliance data has been successfully restored!');
    console.log('✅ Consent records: RESTORED');
    console.log('✅ Audit logs: RESTORED');
    console.log('✅ User data: RESTORED');
    console.log('✅ Progress records: RESTORED\n');
    
    rl.close();
    process.exit(0);
    
  } catch (error) {
    console.error('════════════════════════════════════════════════════════');
    console.error('❌ RESTORE EXECUTION FAILED');
    console.error('════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error('════════════════════════════════════════════════════════\n');
    
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n❌ Restore cancelled by user.\n');
  rl.close();
  process.exit(0);
});

main();
