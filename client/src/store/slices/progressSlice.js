import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/progress');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/progress', progressData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'progress/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/progress/achievements');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'progress/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/progress/leaderboard');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const awardPoints = createAsyncThunk(
  'progress/awardPoints',
  async ({ points, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/progress/points', { points, reason });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to award points');
    }
  }
);

const initialState = {
  userProgress: {
    totalPoints: 0,
    level: 1,
    badges: [],
    achievements: [],
    streaks: {
      current: 0,
      best: 0,
    },
    completedActivities: [],
  },
  achievements: [],
  leaderboard: [],
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalProgress: (state, action) => {
      const { type, data } = action.payload;
      switch (type) {
        case 'points':
          state.userProgress.totalPoints += data.points;
          break;
        case 'activity':
          if (!state.userProgress.completedActivities.includes(data.activityId)) {
            state.userProgress.completedActivities.push(data.activityId);
          }
          break;
        case 'badge':
          if (!state.userProgress.badges.find(badge => badge.id === data.badge.id)) {
            state.userProgress.badges.push(data.badge);
          }
          break;
        default:
          break;
      }
    },
    incrementStreak: (state) => {
      state.userProgress.streaks.current += 1;
      if (state.userProgress.streaks.current > state.userProgress.streaks.best) {
        state.userProgress.streaks.best = state.userProgress.streaks.current;
      }
    },
    resetStreak: (state) => {
      state.userProgress.streaks.current = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.userProgress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update progress
      .addCase(updateProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.userProgress = { ...state.userProgress, ...action.payload };
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Award points
      .addCase(awardPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(awardPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.userProgress.totalPoints = action.payload.totalPoints;
        if (action.payload.newBadges && action.payload.newBadges.length > 0) {
          state.userProgress.badges = [...state.userProgress.badges, ...action.payload.newBadges];
        }
      })
      .addCase(awardPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  updateLocalProgress, 
  incrementStreak, 
  resetStreak 
} = progressSlice.actions;
export default progressSlice.reducer;