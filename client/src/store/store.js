import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import topicsSlice from './slices/topicsSlice';
import gamesSlice from './slices/gamesSlice';
import experimentsSlice from './slices/experimentsSlice';
import quizzesSlice from './slices/quizzesSlice';
import progressSlice from './slices/progressSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    topics: topicsSlice,
    games: gamesSlice,
    experiments: experimentsSlice,
    quizzes: quizzesSlice,
    progress: progressSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types for TypeScript usage (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;