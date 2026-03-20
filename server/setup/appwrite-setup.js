const { ID } = require('node-appwrite');
const appwrite = require('../config/appwrite-client');
const config = require('../config/appwrite-config');
const schemas = require('../schemas/collections');

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
      if (error.code === 409 || error.code === 400 || error.message.includes('already exists') || error.message.includes('maximum number')) {
        console.log('✓ Database already exists or limit reached - continuing with collections');
        this.log.success.push('Database verified/available');
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
    console.log('\nCreating collections...');

    for (const [key, schema] of Object.entries(schemas)) {
      try {
        const collectionId = schema.collectionId;
        await this.databases.createCollection(
          this.config.databaseId,
          collectionId,
          collectionId,
          [],
          false
        );
        console.log(`✓ Collection created: ${collectionId}`);
        this.log.success.push(`Collection: ${collectionId}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`✓ Collection exists: ${schema.collectionId}`);
          this.log.success.push(`Collection verified: ${schema.collectionId}`);
        } else {
          console.error(`✗ Failed to create ${schema.collectionId}:`, error.message);
          this.log.errors.push(`Collection ${schema.collectionId}: ${error.message}`);
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
      
      // Wait for collections to be fully propagated in Appwrite
      console.log('\nWaiting for collections to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
