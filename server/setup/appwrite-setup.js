const { ID } = require('appwrite');
const appwrite = require('../config/appwrite-client');
const config = require('../config/appwrite-config');

class AppwriteSetup {
  constructor() {
    this.databases = appwrite.getDatabase();
    this.config = config;
    this.log = {
      success: [],
      errors: []
    };
  }

  async createDatabase() {
    try {
      console.log('\nCreating database...');
      const database = await this.databases.create(
        this.config.databaseId,
        'EcoKids Main Database'
      );
      console.log('✓ Database created:', database.name);
      this.log.success.push('Database created');
      return database;
    } catch (error) {
      if (error.code === 409) {
        console.log('✓ Database already exists');
        this.log.success.push('Database verified');
        return { $id: this.config.databaseId };
      }
      console.error('✗ Database creation failed:', error.message);
      this.log.errors.push(`Database: ${error.message}`);
      throw error;
    }
  }

  getCollectionDefinitions() {
    return {
      users: {
        name: 'users',
        description: 'User profiles and authentication'
      },
      challenges: {
        name: 'challenges',
        description: 'Environmental challenges'
      },
      submissions: {
        name: 'submissions',
        description: 'Challenge submissions and responses'
      },
      ecoPoints: {
        name: 'eco_points',
        description: 'User eco-points tracking'
      },
      badges: {
        name: 'badges',
        description: 'Achievement badges and rewards'
      },
      leaderboards: {
        name: 'leaderboards',
        description: 'Leaderboard rankings'
      },
      auditLogs: {
        name: 'audit_logs',
        description: 'Audit trail and logging'
      },
      refreshTokens: {
        name: 'refresh_tokens',
        description: 'Refresh token storage'
      }
    };
  }

  async createCollections() {
    const definitions = this.getCollectionDefinitions();

    console.log('\nCreating collections...');

    for (const [key, def] of Object.entries(definitions)) {
      try {
        await this.databases.createCollection(
          this.config.databaseId,
          ID.unique(),
          def.name,
          [],
          false
        );
        console.log(`✓ Collection created: ${def.name}`);
        this.log.success.push(`Collection: ${def.name}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`✓ Collection exists: ${def.name}`);
          this.log.success.push(`Collection verified: ${def.name}`);
        } else {
          console.error(`✗ Failed to create ${def.name}:`, error.message);
          this.log.errors.push(`Collection ${def.name}: ${error.message}`);
        }
      }
    }
  }

  async createIndexes() {
    console.log('\nCreating indexes...');

    const indexes = [
      {
        collection: 'users',
        name: 'email_unique',
        type: 'unique',
        attributes: ['email']
      },
      {
        collection: 'users',
        name: 'role_index',
        type: 'key',
        attributes: ['role']
      },
      {
        collection: 'users',
        name: 'schoolId_index',
        type: 'key',
        attributes: ['schoolId']
      },
      {
        collection: 'submissions',
        name: 'studentId_index',
        type: 'key',
        attributes: ['studentId']
      },
      {
        collection: 'submissions',
        name: 'status_index',
        type: 'key',
        attributes: ['status']
      },
      {
        collection: 'eco_points',
        name: 'studentId_schoolId_unique',
        type: 'unique',
        attributes: ['studentId', 'schoolId']
      }
    ];

    for (const index of indexes) {
      try {
        await this.databases.createIndex(
          this.config.databaseId,
          index.collection,
          index.name,
          index.type,
          index.attributes
        );
        console.log(`✓ Index created: ${index.collection}.${index.name}`);
        this.log.success.push(`Index: ${index.name}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`✓ Index exists: ${index.name}`);
          this.log.success.push(`Index verified: ${index.name}`);
        } else {
          console.error(`✗ Failed to create index ${index.name}:`, error.message);
          this.log.errors.push(`Index ${index.name}: ${error.message}`);
        }
      }
    }
  }

  printSummary() {
    console.log('\n═══════════════════════════════════════════════');
    console.log('APPWRITE SETUP SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n✓ Success: ${this.log.success.length}`);
    this.log.success.forEach(msg => console.log(`  ✓ ${msg}`));

    if (this.log.errors.length > 0) {
      console.log(`\n✗ Errors: ${this.log.errors.length}`);
      this.log.errors.forEach(msg => console.log(`  ✗ ${msg}`));
    }

    console.log('\n═══════════════════════════════════════════════\n');
  }

  async runSetup() {
    try {
      console.log('Starting Appwrite setup...\n');

      await this.createDatabase();
      await this.createCollections();
      await this.createIndexes();

      this.printSummary();

      return this.log.errors.length === 0;
    } catch (error) {
      console.error('\nSetup failed:', error.message);
      this.printSummary();
      return false;
    }
  }
}

module.exports = AppwriteSetup;
