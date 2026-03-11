import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchExperiments = createAsyncThunk(
  'experiments/fetchExperiments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/experiments');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch experiments');
    }
  }
);

export const fetchExperimentById = createAsyncThunk(
  'experiments/fetchExperimentById',
  async (experimentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/experiments/${experimentId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch experiment');
    }
  }
);

export const createExperiment = createAsyncThunk(
  'experiments/createExperiment',
  async (experimentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/experiments', experimentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create experiment');
    }
  }
);

export const updateExperiment = createAsyncThunk(
  'experiments/updateExperiment',
  async ({ id, experimentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/experiments/${id}`, experimentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update experiment');
    }
  }
);

export const deleteExperiment = createAsyncThunk(
  'experiments/deleteExperiment',
  async (experimentId, { rejectWithValue }) => {
    try {
      await api.delete(`/experiments/${experimentId}`);
      return experimentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete experiment');
    }
  }
);

export const submitExperimentResult = createAsyncThunk(
  'experiments/submitExperimentResult',
  async ({ experimentId, results }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/experiments/${experimentId}/results`, { results });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit experiment results');
    }
  }
);

const initialState = {
  experiments: [],
  currentExperiment: null,
  experimentResults: {},
  loading: false,
  error: null,
};

const experimentsSlice = createSlice({
  name: 'experiments',
  initialState,
  reducers: {
    clearCurrentExperiment: (state) => {
      state.currentExperiment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setExperimentResults: (state, action) => {
      const { experimentId, results } = action.payload;
      state.experimentResults[experimentId] = results;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch experiments
      .addCase(fetchExperiments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperiments.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments = action.payload;
      })
      .addCase(fetchExperiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch experiment by ID
      .addCase(fetchExperimentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperimentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExperiment = action.payload;
      })
      .addCase(fetchExperimentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create experiment
      .addCase(createExperiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExperiment.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments.push(action.payload);
      })
      .addCase(createExperiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update experiment
      .addCase(updateExperiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExperiment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.experiments.findIndex(exp => exp._id === action.payload._id);
        if (index !== -1) {
          state.experiments[index] = action.payload;
        }
        if (state.currentExperiment && state.currentExperiment._id === action.payload._id) {
          state.currentExperiment = action.payload;
        }
      })
      .addCase(updateExperiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete experiment
      .addCase(deleteExperiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExperiment.fulfilled, (state, action) => {
        state.loading = false;
        state.experiments = state.experiments.filter(exp => exp._id !== action.payload);
        if (state.currentExperiment && state.currentExperiment._id === action.payload) {
          state.currentExperiment = null;
        }
      })
      .addCase(deleteExperiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit experiment results
      .addCase(submitExperimentResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitExperimentResult.fulfilled, (state, action) => {
        state.loading = false;
        // Update experiment results or progress as needed
      })
      .addCase(submitExperimentResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentExperiment, clearError, setExperimentResults } = experimentsSlice.actions;
export default experimentsSlice.reducer;