/**
 * @fileoverview Offline storage management using AsyncStorage and SQLite
 * Handles caching of API responses, user sessions, and offline activity queue
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'ecokids.db';

// ============================================================================
// ASYNC STORAGE HELPERS (Session, User Data, Cache)
// ============================================================================

export const StorageService = {
  // Authentication
  setAuthToken: async (token) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      return true;
    } catch (error) {
      console.error('[StorageService] Error setting auth token:', error);
      return false;
    }
  },

  getAuthToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      return token;
    } catch (error) {
      console.error('[StorageService] Error getting auth token:', error);
      return null;
    }
  },

  clearAuthToken: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      return true;
    } catch (error) {
      console.error('[StorageService] Error clearing auth token:', error);
      return false;
    }
  },

  // User Profile
  setUserProfile: async (user) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('[StorageService] Error setting user profile:', error);
      return false;
    }
  },

  getUserProfile: async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('[StorageService] Error getting user profile:', error);
      return null;
    }
  },

  // Cache with TTL (Time-To-Live)
  setCache: async (key, data, ttlMinutes = 60) => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
      return true;
    } catch (error) {
      console.error(`[StorageService] Error caching ${key}:`, error);
      return false;
    }
  },

  getCache: async (key) => {
    try {
      const cacheEntry = await AsyncStorage.getItem(`cache_${key}`);
      if (!cacheEntry) return null;

      const { data, timestamp, ttl } = JSON.parse(cacheEntry);

      // Check if cache has expired
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`[StorageService] Error retrieving cache ${key}:`, error);
      return null;
    }
  },

  clearCache: async (key) => {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error clearing cache ${key}:`, error);
      return false;
    }
  },

  // Sync Queue (for offline activities)
  addToSyncQueue: async (action, payload) => {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      const items = queue ? JSON.parse(queue) : [];
      
      items.push({
        id: `${action}_${Date.now()}`,
        action,
        payload,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3
      });

      await AsyncStorage.setItem('syncQueue', JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('[StorageService] Error adding to sync queue:', error);
      return false;
    }
  },

  getSyncQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('[StorageService] Error getting sync queue:', error);
      return [];
    }
  },

  removeSyncQueueItem: async (itemId) => {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      const items = queue ? JSON.parse(queue) : [];
      
      const filtered = items.filter(item => item.id !== itemId);
      await AsyncStorage.setItem('syncQueue', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('[StorageService] Error removing sync queue item:', error);
      return false;
    }
  },

  clearSyncQueue: async () => {
    try {
      await AsyncStorage.removeItem('syncQueue');
      return true;
    } catch (error) {
      console.error('[StorageService] Error clearing sync queue:', error);
      return false;
    }
  }
};

// ============================================================================
// SQLITE DATABASE (Offline Activity Log)
// ============================================================================

export const DatabaseService = {
  db: null,

  initializeDatabase: async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      DatabaseService.db = db;

      // Create tables
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT,
          ecoPoints INTEGER,
          photo_uri TEXT,
          status TEXT DEFAULT 'pending',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          challenge_type TEXT,
          difficulty_tier TEXT,
          schools_count INTEGER,
          status TEXT DEFAULT 'active',
          starts_at INTEGER,
          ends_at INTEGER,
          cached_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_habits (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          habit_name TEXT NOT NULL,
          category TEXT NOT NULL,
          completed_dates TEXT,
          current_streak INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(userId);
        CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        CREATE INDEX IF NOT EXISTS idx_habits_user ON user_habits(userId);
      `);

      console.log('[DatabaseService] Database initialized successfully');
      return true;
    } catch (error) {
      console.error('[DatabaseService] Error initializing database:', error);
      return false;
    }
  },

  // Activities table operations
  insertActivity: async (activity) => {
    try {
      const { id, userId, type, title, description, category, ecoPoints, photoUri } = activity;
      
      await DatabaseService.db.runAsync(
        `INSERT INTO activities (id, userId, type, title, description, category, ecoPoints, photo_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, type, title, description, category, ecoPoints, photoUri, Date.now(), Date.now()]
      );

      return true;
    } catch (error) {
      console.error('[DatabaseService] Error inserting activity:', error);
      return false;
    }
  },

  getActivities: async (userId) => {
    try {
      const result = await DatabaseService.db.getAllAsync(
        'SELECT * FROM activities WHERE userId = ? ORDER BY created_at DESC',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('[DatabaseService] Error getting activities:', error);
      return [];
    }
  },

  getUnsyncedActivities: async () => {
    try {
      const result = await DatabaseService.db.getAllAsync(
        'SELECT * FROM activities WHERE synced = 0 AND status = "pending" ORDER BY created_at ASC'
      );
      return result;
    } catch (error) {
      console.error('[DatabaseService] Error getting unsynced activities:', error);
      return [];
    }
  },

  markActivitySynced: async (activityId) => {
    try {
      await DatabaseService.db.runAsync(
        'UPDATE activities SET synced = 1, status = "submitted" WHERE id = ?',
        [activityId]
      );
      return true;
    } catch (error) {
      console.error('[DatabaseService] Error marking activity synced:', error);
      return false;
    }
  },

  // Challenges cache
  insertChallenge: async (challenge) => {
    try {
      const { id, title, description, challengeType, difficultyTier, schoolsCount, status, startsAt, endsAt } = challenge;
      
      await DatabaseService.db.runAsync(
        `INSERT OR REPLACE INTO challenges (id, title, description, challenge_type, difficulty_tier, schools_count, status, starts_at, ends_at, cached_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, title, description, challengeType, difficultyTier, schoolsCount, status, startsAt, endsAt, Date.now()]
      );

      return true;
    } catch (error) {
      console.error('[DatabaseService] Error inserting challenge:', error);
      return false;
    }
  },

  getChallenges: async () => {
    try {
      const result = await DatabaseService.db.getAllAsync(
        'SELECT * FROM challenges WHERE status IN ("active", "upcoming") ORDER BY starts_at ASC'
      );
      return result;
    } catch (error) {
      console.error('[DatabaseService] Error getting challenges:', error);
      return [];
    }
  },

  // Habits tracking
  insertHabit: async (habit) => {
    try {
      const { id, userId, habitName, category } = habit;
      
      await DatabaseService.db.runAsync(
        `INSERT INTO user_habits (id, userId, habit_name, category, completed_dates, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, habitName, category, JSON.stringify([]), Date.now(), Date.now()]
      );

      return true;
    } catch (error) {
      console.error('[DatabaseService] Error inserting habit:', error);
      return false;
    }
  },

  getHabits: async (userId) => {
    try {
      const result = await DatabaseService.db.getAllAsync(
        'SELECT * FROM user_habits WHERE userId = ? ORDER BY updated_at DESC',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('[DatabaseService] Error getting habits:', error);
      return [];
    }
  },

  logHabitCompletion: async (habitId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const habit = await DatabaseService.db.getFirstAsync(
        'SELECT * FROM user_habits WHERE id = ?',
        [habitId]
      );

      if (!habit) return false;

      const completedDates = JSON.parse(habit.completed_dates || '[]');
      if (!completedDates.includes(today)) {
        completedDates.push(today);
      }

      // Calculate streak
      let streak = 0;
      let currentDate = new Date();
      while (completedDates.includes(currentDate.toISOString().split('T')[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      await DatabaseService.db.runAsync(
        'UPDATE user_habits SET completed_dates = ?, current_streak = ?, updated_at = ? WHERE id = ?',
        [JSON.stringify(completedDates), streak, Date.now(), habitId]
      );

      return true;
    } catch (error) {
      console.error('[DatabaseService] Error logging habit completion:', error);
      return false;
    }
  }
};

export default { StorageService, DatabaseService };
