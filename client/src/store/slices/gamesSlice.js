import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/games');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch games');
    }
  }
);

export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/games/${gameId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch game');
    }
  }
);

export const createGame = createAsyncThunk(
  'games/createGame',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/games', gameData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create game');
    }
  }
);

export const updateGame = createAsyncThunk(
  'games/updateGame',
  async ({ id, gameData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/games/${id}`, gameData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update game');
    }
  }
);

export const deleteGame = createAsyncThunk(
  'games/deleteGame',
  async (gameId, { rejectWithValue }) => {
    try {
      await api.delete(`/games/${gameId}`);
      return gameId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete game');
    }
  }
);

export const submitGameScore = createAsyncThunk(
  'games/submitGameScore',
  async ({ gameId, score }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/score`, { score });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit score');
    }
  }
);

const initialState = {
  games: [],
  currentGame: null,
  gameProgress: {},
  leaderboard: [],
  loading: false,
  error: null,
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearCurrentGame: (state) => {
      state.currentGame = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setGameProgress: (state, action) => {
      const { gameId, progress } = action.payload;
      state.gameProgress[gameId] = progress;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch game by ID
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create game
      .addCase(createGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGame.fulfilled, (state, action) => {
        state.loading = false;
        state.games.push(action.payload);
      })
      .addCase(createGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update game
      .addCase(updateGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGame.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.games.findIndex(game => game._id === action.payload._id);
        if (index !== -1) {
          state.games[index] = action.payload;
        }
        if (state.currentGame && state.currentGame._id === action.payload._id) {
          state.currentGame = action.payload;
        }
      })
      .addCase(updateGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete game
      .addCase(deleteGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.loading = false;
        state.games = state.games.filter(game => game._id !== action.payload);
        if (state.currentGame && state.currentGame._id === action.payload) {
          state.currentGame = null;
        }
      })
      .addCase(deleteGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit game score
      .addCase(submitGameScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitGameScore.fulfilled, (state, action) => {
        state.loading = false;
        // Update leaderboard or game progress as needed
      })
      .addCase(submitGameScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGame, clearError, setGameProgress } = gamesSlice.actions;
export default gamesSlice.reducer;