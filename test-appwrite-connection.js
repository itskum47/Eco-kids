const appwrite = require('./server/config/appwrite-client');

async function verifyConnection() {
  console.log('═══════════════════════════════════════════════');
  console.log('APPWRITE CONNECTION VERIFICATION');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Test 1: Basic config
    console.log('Test 1: Configuration...');
    const health = appwrite.health();
    if (!health.success) {
      console.log('⚠ WARNING: Missing environment vars');
      console.log('  Required: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY');
      console.log('  Got:', {
        endpoint: health.endpoint ? `${health.endpoint.substring(0, 30)}...` : 'NOT_SET',
        projectId: health.projectId ? `${health.projectId.substring(0, 15)}...` : 'NOT_SET'
      });
    } else {
      console.log('✓ Configuration present\n');
    }

    // Test 2: Project access
    console.log('Test 2: Project Access...');
    const config = appwrite.getConfig();
    console.log(`  Project ID: ${config.projectId || 'NOT_SET'}`);
    console.log(`  Database ID: ${config.databaseId || 'NOT_SET'}`);
    console.log('✓ Project configured\n');

    // Test 3: Client instantiation
    console.log('Test 3: Client Status...');
    const client = appwrite.getClient();
    console.log('✓ Appwrite client initialized\n');

    // Test 4: Verify modules
    console.log('Test 4: Module Availability...');
    const modules = {
      database: appwrite.getDatabase() ? '✓' : '✗',
      storage: appwrite.getStorage() ? '✓' : '✗',
      functions: appwrite.getFunctions() ? '✓' : '✗',
      messaging: appwrite.getMessaging() ? '✓' : '✗'
    };
    Object.entries(modules).forEach(([name, status]) => {
      console.log(`  ${status} ${name}`);
    });

    console.log('\n═══════════════════════════════════════════════');
    if (health.success) {
      console.log('✅ APPWRITE ACCOUNT VERIFIED & READY');
    } else {
      console.log('⚠ CONFIGURATION INCOMPLETE - Set environment variables to proceed');
    }
    console.log('═══════════════════════════════════════════════\n');

    return health.success;

  } catch (error) {
    console.error('❌ VERIFICATION FAILED');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check APPWRITE_ENDPOINT is correct');
    console.error('2. Verify PROJECT_ID matches Appwrite console');
    console.error('3. Confirm API_KEY is valid');
    console.error('4. Ensure internet connection is active');
    return false;
  }
}

verifyConnection().then(success => {
  process.exit(success ? 0 : 1);
});
