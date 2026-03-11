import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../utils/api';

// Async thunks
export const fetchTopics = createAsyncThunk(
  'topics/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('GET', '/topics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch topics');
    }
  }
);

export const fetchTopicById = createAsyncThunk(
  'topics/fetchTopicById',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/topics/${topicId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch topic');
    }
  }
);

export const createTopic = createAsyncThunk(
  'topics/createTopic',
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/topics', topicData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create topic');
    }
  }
);

export const updateTopic = createAsyncThunk(
  'topics/updateTopic',
  async ({ id, topicData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/topics/${id}`, topicData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update topic');
    }
  }
);

export const deleteTopic = createAsyncThunk(
  'topics/deleteTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      await api.delete(`/topics/${topicId}`);
      return topicId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete topic');
    }
  }
);

const initialState = {
  topics: [],
  currentTopic: null,
  loading: false,
  error: null,
};

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch topic by ID
      .addCase(fetchTopicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create topic
      .addCase(createTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload);
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update topic
      .addCase(updateTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic._id === action.payload._id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        if (state.currentTopic && state.currentTopic._id === action.payload._id) {
          state.currentTopic = action.payload;
        }
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete topic
      .addCase(deleteTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter(topic => topic._id !== action.payload);
        if (state.currentTopic && state.currentTopic._id === action.payload) {
          state.currentTopic = null;
        }
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTopic, clearError } = topicsSlice.actions;
export default topicsSlice.reducer;