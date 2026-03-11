import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/quizzes');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchQuizById',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/quizzes/${quizId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/quizzes', quizData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async ({ id, quizData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      await api.delete(`/quizzes/${quizId}`);
      return quizId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

export const submitQuizAnswer = createAsyncThunk(
  'quizzes/submitQuizAnswer',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz');
    }
  }
);

const initialState = {
  quizzes: [],
  currentQuiz: null,
  quizResults: {},
  loading: false,
  error: null,
};

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setQuizResults: (state, action) => {
      const { quizId, results } = action.payload;
      state.quizResults[quizId] = results;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.currentQuiz && state.currentQuiz._id === action.payload._id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload);
        if (state.currentQuiz && state.currentQuiz._id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit quiz answer
      .addCase(submitQuizAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuizAnswer.fulfilled, (state, action) => {
        state.loading = false;
        // Update quiz results
        if (state.currentQuiz) {
          state.quizResults[state.currentQuiz._id] = action.payload;
        }
      })
      .addCase(submitQuizAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentQuiz, clearError, setQuizResults } = quizzesSlice.actions;
export default quizzesSlice.reducer;