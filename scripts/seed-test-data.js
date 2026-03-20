const { ID } = require('appwrite');
const appwrite = require('../server/config/appwrite-client');
const config = require('../server/config/appwrite-config');

class TestDataSeeder {
  constructor() {
    this.databases = appwrite.getDatabase();
    this.config = config;
  }

  async createTestUsers() {
    console.log('\nCreating test users...');

    const testUsers = [
      {
        email: `student1-${Date.now()}@test.com`,
        password: 'TestPassword123!',
        fullName: 'Test Student 1',
        role: 'student',
        schoolId: 'school_001',
        isActive: true,
        mfaEnabled: false
      },
      {
        email: `teacher1-${Date.now()}@test.com`,
        password: 'TestPassword123!',
        fullName: 'Test Teacher 1',
        role: 'teacher',
        schoolId: 'school_001',
        isActive: true,
        mfaEnabled: false
      },
      {
        email: `admin1-${Date.now()}@test.com`,
        password: 'TestPassword123!',
        fullName: 'Test Admin 1',
        role: 'school_admin',
        schoolId: 'school_001',
        isActive: true,
        mfaEnabled: false
      }
    ];

    for (const user of testUsers) {
      try {
        await this.databases.createDocument(
          this.config.databaseId,
          'users',
          ID.unique(),
          {
            ...user,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        console.log(`✓ Created: ${user.email}`);
      } catch (error) {
        console.error(`✗ Failed to create ${user.email}:`, error.message);
      }
    }
  }

  async createTestChallenges() {
    console.log('\nCreating test challenges...');

    const testChallenges = [
      {
        title: 'Plant a Tree',
        description: 'Plant at least one tree and document it with photos',
        category: 'tree_planting',
        difficulty: 'easy',
        basePoints: 50,
        bonusPoints: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        schoolId: 'school_001',
        createdBy: 'teacher_001',
        status: 'active'
      },
      {
        title: 'Waste Segregation',
        description: 'Practice proper waste segregation for one week',
        category: 'waste_segregation',
        difficulty: 'medium',
        basePoints: 75,
        bonusPoints: 25,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        schoolId: 'school_001',
        createdBy: 'teacher_001',
        status: 'active'
      }
    ];

    for (const challenge of testChallenges) {
      try {
        await this.databases.createDocument(
          this.config.databaseId,
          'challenges',
          ID.unique(),
          {
            ...challenge,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        console.log(`✓ Created: ${challenge.title}`);
      } catch (error) {
        console.error(`✗ Failed to create challenge:`, error.message);
      }
    }
  }

  async seedData() {
    console.log('═══════════════════════════════════════════════');
    console.log('SEEDING TEST DATA');
    console.log('═══════════════════════════════════════════════');

    await this.createTestUsers();
    await this.createTestChallenges();

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ TEST DATA SEEDED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════\n');
  }
}

const seeder = new TestDataSeeder();
seeder.seedData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
