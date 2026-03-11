/**
 * @fileoverview Redux store setup for mobile app
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import challengesReducer from './slices/challengesSlice';
import habitsReducer from './slices/habitsSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    challenges: challengesReducer,
    habits: habitsReducer,
    leaderboard: leaderboardReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['auth.token']
      }
    })
});

export default store;
