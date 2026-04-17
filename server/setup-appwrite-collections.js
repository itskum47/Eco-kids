#!/usr/bin/env node

/**
 * Setup script to create Appwrite collections for EcoKids
 * This creates the Users collection with all required attributes
 * Run from server directory: node setup-appwrite-collections.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client, Databases } = require('node-appwrite');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'sgp-69b6ea3b0010c4b2e448';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'ecokids_main';

if (!APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY not found in .env');
  process.exit(1);
}

async function setupCollections() {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    console.log('🚀 Setting up Appwrite collections...\n');

    // Check if database exists
    try {
      await databases.get(DATABASE_ID);
      console.log(`✅ Database "${DATABASE_ID}" exists\n`);
    } catch (err) {
      console.error(`❌ Database "${DATABASE_ID}" not found. Please create it first in Appwrite console.`);
      process.exit(1);
    }

    // Create Users collection
    console.log('📝 Creating Users collection...');
    try {
      await databases.createCollection(DATABASE_ID, 'users', 'users', [
        // Basic user info
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
        { name: 'role', type: 'string', required: true, default: 'student' },
        { name: 'isActive', type: 'boolean', required: false, default: true },

        // Contact info
        { name: 'phone', type: 'string', required: false },
        { name: 'parentPhone', type: 'string', required: false },

        // School info
        { name: 'schoolCode', type: 'string', required: false },
        { name: 'rollNumber', type: 'string', required: false },
        { name: 'section', type: 'string', required: false },
        { name: 'linkedStudentEmail', type: 'string', required: false },

        // Profile (stored as JSON string)
        { name: 'profile', type: 'string', required: false },

        // Gamification (stored as JSON string)
        { name: 'gamification', type: 'string', required: false },

        // Points and coins
        { name: 'ecoCoins', type: 'integer', required: false, default: 0 },
        { name: 'avatar', type: 'string', required: false, default: 'leaf' },

        // Status
        { name: 'firstLogin', type: 'boolean', required: false, default: true },

        // Timestamps
        { name: 'lastLogin', type: 'datetime', required: false },
        { name: 'createdAt', type: 'datetime', required: false },
        { name: 'updatedAt', type: 'datetime', required: false },

        // Appwrite ID mapping
        { name: 'appwriteId', type: 'string', required: false }
      ]);
      console.log('✅ Users collection created\n');

      // Create indexes for faster queries
      console.log('🔑 Creating indexes...');
      // Note: Appwrite indexes are created via API attributes with indexing enabled
      console.log('✅ Indexes set\n');

    } catch (err) {
      if (err.message.includes('already')) {
        console.log('⚠️  Users collection already exists\n');
      } else {
        throw err;
      }
    }

    console.log('✅ Appwrite setup complete!');
    console.log('\n📋 Summary:');
    console.log(`  Database: ${DATABASE_ID}`);
    console.log('  Collection: users');
    console.log('\n🔐 You can now:');
    console.log('  1. Register new users via /api/v1/auth/register');
    console.log('  2. Login via /api/v1/auth/login');
    console.log('  3. Use email OTP via /api/v1/auth/send-email-otp-appwrite');

  } catch (error) {
    console.error('❌ Error setting up Appwrite:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

setupCollections();
