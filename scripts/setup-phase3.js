const AppwriteSetup = require('../server/setup/appwrite-setup');

async function main() {
  const setup = new AppwriteSetup();
  const success = await setup.runSetup();

  if (success) {
    console.log('✅ PHASE 3.1 COMPLETE - Appwrite setup successful');
    console.log('Ready for Phase 3.2 - Database configuration\n');
    process.exit(0);
  } else {
    console.log('❌ PHASE 3.1 FAILED - Fix errors above\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
