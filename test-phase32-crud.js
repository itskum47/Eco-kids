const appwrite = require('./server/config/appwrite-client');
const config = require('./server/config/appwrite-config');
const { ID } = require('appwrite');

async function testCRUD() {
  console.log('═══════════════════════════════════════════════');
  console.log('TESTING PHASE 3.2 - CRUD OPERATIONS');
  console.log('═══════════════════════════════════════════════\n');

  const databases = appwrite.getDatabase();
  const dbId = config.databaseId;

  try {
    // CREATE
    console.log('Testing CREATE...');
    const testDoc = await databases.createDocument(
      dbId,
      'users',
      ID.unique(),
      {
        email: `test${Date.now()}@test.com`,
        password: 'Test123!',
        fullName: 'CRUD Test User',
        role: 'student',
        schoolId: 'test_school',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    console.log('✓ CREATE successful\n');
    const testUserId = testDoc.$id;

    // READ
    console.log('Testing READ...');
    const readDoc = await databases.getDocument(
      dbId,
      'users',
      testUserId
    );
    console.log('✓ READ successful\n');

    // UPDATE
    console.log('Testing UPDATE...');
    await databases.updateDocument(
      dbId,
      'users',
      testUserId,
      { fullName: 'Updated CRUD Test User' }
    );
    console.log('✓ UPDATE successful\n');

    // DELETE
    console.log('Testing DELETE...');
    await databases.deleteDocument(
      dbId,
      'users',
      testUserId
    );
    console.log('✓ DELETE successful\n');

    console.log('═══════════════════════════════════════════════');
    console.log('✅ PHASE 3.2 COMPLETE - All CRUD operations working');
    console.log('═══════════════════════════════════════════════\n');
    return true;

  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
    console.error('Details:', error);
    return false;
  }
}

testCRUD().then(success => process.exit(success ? 0 : 1));
