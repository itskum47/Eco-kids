/**
 * @fileoverview API service with offline sync capability
 * Handles all HTTP requests with automatic retry, caching, and offline queueing
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { StorageService, DatabaseService } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ecokids.in/api/v1';

// Create axios instance
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

// Request interceptor - add auth token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Error reading auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and refresh token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear cache and redirect to login
      await StorageService.clearAuthToken();
      await StorageService.clearCache('userProfile');
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// API SERVICE METHODS
// ============================================================================

export const ApiService = {
  // =========== Authentication ===========
  login: async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token and user profile
      await StorageService.setAuthToken(token);
      await StorageService.setUserProfile(user);
      await StorageService.setCache('userProfile', user, 24 * 60); // 24-hour cache

      return { success: true, user };
    } catch (error) {
      console.error('[ApiService] Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const response = await client.post('/auth/register', userData);
      const { token, user } = response.data;

      await StorageService.setAuthToken(token);
      await StorageService.setUserProfile(user);

      return { success: true, user };
    } catch (error) {
      console.error('[ApiService] Registration error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
      await StorageService.clearAuthToken();
      await StorageService.clearCache('userProfile');
      return { success: true };
    } catch (error) {
      console.error('[ApiService] Logout error:', error);
      return { success: false };
    }
  },

  // =========== User & Profile ===========
  getUserProfile: async () => {
    try {
      // Check cache first
      const cached = await StorageService.getCache('userProfile');
      if (cached && cached.gamification) {
        return { success: true, user: cached };
      }

      const response = await client.get('/users/profile');
      await StorageService.setUserProfile(response.data);
      await StorageService.setCache('userProfile', response.data, 24 * 60);

      return { success: true, user: response.data };
    } catch (error) {
      console.error('[ApiService] Get profile error:', error);
      // Try to return cached version
      const cached = await StorageService.getCache('userProfile');
      return cached
        ? { success: true, user: cached, fromCache: true }
        : { success: false, error: error.response?.data?.message || 'Failed to fetch profile' };
    }
  },

  updateProfile: async (updates) => {
    try {
      const response = await client.patch('/users/profile', updates);
      await StorageService.setUserProfile(response.data);
      await StorageService.setCache('userProfile', response.data, 24 * 60);

      return { success: true, user: response.data };
    } catch (error) {
      console.error('[ApiService] Update profile error:', error);
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  },

  // =========== Challenges ===========
  getChallenges: async (params = {}) => {
    try {
      // Try cache first
      const cached = await StorageService.getCache('challenges');
      if (cached) {
        return { success: true, challenges: cached, fromCache: true };
      }

      const response = await client.get('/challenges/school-challenges', { params });
      const challenges = response.data.data || [];

      // Cache challenges
      await StorageService.setCache('challenges', challenges, 60); // 1-hour cache
      
      // Store in SQLite for offline access
      for (const challenge of challenges) {
        await DatabaseService.insertChallenge(challenge);
      }

      return { success: true, challenges };
    } catch (error) {
      console.error('[ApiService] Get challenges error:', error);
      
      // Fallback to SQLite cache
      try {
        const offlineChallenges = await DatabaseService.getChallenges();
        return { 
          success: true, 
          challenges: offlineChallenges, 
          fromCache: true, 
          offline: true 
        };
      } catch {
        return { success: false, error: 'No internet and no cached challenges' };
      }
    }
  },

  getChallengeById: async (challengeId) => {
    try {
      const response = await client.get(`/challenges/school-challenges/${challengeId}`);
      return { success: true, challenge: response.data };
    } catch (error) {
      console.error('[ApiService] Get challenge error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch challenge' };
    }
  },

  getActiveChallenges: async () => {
    try {
      const response = await client.get('/challenges/school-challenges/active');
      const challenges = response.data.data || [];
      
      await StorageService.setCache('activeChallenges', challenges, 30); // 30-min cache

      return { success: true, challenges };
    } catch (error) {
      console.error('[ApiService] Get active challenges error:', error);
      
      const cached = await StorageService.getCache('activeChallenges');
      return cached
        ? { success: true, challenges: cached, fromCache: true }
        : { success: false, error: 'Failed to fetch active challenges' };
    }
  },

  // =========== Activities / Experiments ===========
  submitActivity: async (activity) => {
    try {
      // First save to SQLite for offline persistence
      await DatabaseService.insertActivity({
        id: activity.id,
        userId: activity.userId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        ecoPoints: activity.ecoPoints,
        photoUri: activity.photoUri
      });

      // Try to submit to server
      const formData = new FormData();
      formData.append('title', activity.title);
      formData.append('description', activity.description);
      formData.append('category', activity.category);
      formData.append('type', activity.type);

      if (activity.photoUri) {
        const fileName = activity.photoUri.split('/').pop();
        formData.append('photo', {
          uri: activity.photoUri,
          type: 'image/jpeg',
          name: fileName
        });
      }

      const response = await client.post('/activities/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Mark as synced in SQLite
      await DatabaseService.markActivitySynced(activity.id);

      return { success: true, activity: response.data };
    } catch (error) {
      console.error('[ApiService] Submit activity error:', error);

      // Add to sync queue for later retry
      await StorageService.addToSyncQueue('submitActivity', activity);

      return { 
        success: true, 
        offline: true, 
        message: 'Activity saved offline. Will sync when connection is restored.' 
      };
    }
  },

  getMyActivities: async () => {
    try {
      const response = await client.get('/activities/my-activities');
      return { success: true, activities: response.data.data || [] };
    } catch (error) {
      console.error('[ApiService] Get activities error:', error);
      return { success: false, error: 'Failed to fetch activities' };
    }
  },

  // =========== Leaderboard ===========
  getLeaderboard: async (params = {}) => {
    try {
      const cacheKey = `leaderboard_${params.scope || 'global'}`;
      const cached = await StorageService.getCache(cacheKey);
      if (cached) {
        return { success: true, leaderboard: cached, fromCache: true };
      }

      const response = await client.get('/gamification/leaderboard', { params });
      await StorageService.setCache(cacheKey, response.data, 30); // 30-min cache

      return { success: true, leaderboard: response.data };
    } catch (error) {
      console.error('[ApiService] Get leaderboard error:', error);
      return { success: false, error: 'Failed to fetch leaderboard' };
    }
  },

  getSchoolLeaderboard: async (schoolId) => {
    try {
      const response = await client.get(`/gamification/leaderboard/school/${schoolId}`);
      return { success: true, leaderboard: response.data };
    } catch (error) {
      console.error('[ApiService] Get school leaderboard error:', error);
      return { success: false, error: 'Failed to fetch school leaderboard' };
    }
  },

  // =========== Habits ===========
  getHabits: async () => {
    try {
      const response = await client.get('/habits');
      const habits = response.data.data || [];

      // Cache in SQLite
      const userId = (await StorageService.getUserProfile())?.id;
      if (userId) {
        for (const habit of habits) {
          await DatabaseService.insertHabit({
            id: habit.id,
            userId,
            habitName: habit.name,
            category: habit.category
          });
        }
      }

      return { success: true, habits };
    } catch (error) {
      console.error('[ApiService] Get habits error:', error);
      return { success: false, error: 'Failed to fetch habits' };
    }
  },

  logHabitCompletion: async (habitId) => {
    try {
      // Log locally immediately for offline support
      await DatabaseService.logHabitCompletion(habitId);

      // Try to sync to server
      const response = await client.post(`/habits/${habitId}/complete`, {
        completedAt: new Date().toISOString()
      });

      return { success: true, habit: response.data };
    } catch (error) {
      console.error('[ApiService] Log habit completion error:', error);

      // Still return success if logged locally
      return { 
        success: true, 
        offline: true, 
        message: 'Habit logged. Will sync when connection is restored.' 
      };
    }
  },

  // =========== Sync Management ===========
  syncOfflineData: async () => {
    try {
      const queue = await StorageService.getSyncQueue();
      let successCount = 0;
      let failureCount = 0;

      for (const item of queue) {
        try {
          if (item.action === 'submitActivity') {
            const result = await client.post('/activities/submit', item.payload);
            await DatabaseService.markActivitySynced(item.payload.id);
            await StorageService.removeSyncQueueItem(item.id);
            successCount++;
          }
        } catch (error) {
          failureCount++;
          item.retries++;
          
          // Remove from queue if max retries exceeded
          if (item.retries >= item.maxRetries) {
            await StorageService.removeSyncQueueItem(item.id);
          }
        }
      }

      console.log(`[ApiService] Sync completed: ${successCount} succeeded, ${failureCount} failed`);
      return { success: true, syncedCount: successCount };
    } catch (error) {
      console.error('[ApiService] Sync error:', error);
      return { success: false, error: 'Sync failed' };
    }
  },

  // Check connectivity
  checkConnectivity: async () => {
    try {
      const response = await client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
};

export default ApiService;
