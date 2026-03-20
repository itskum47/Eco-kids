import axios from 'axios';

let csrfToken = null;
let csrfPromise = null;

const getBaseURL = () => import.meta.env.VITE_API_URL || '/api/v1';

const ensureCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = axios.get(`${getBaseURL()}/auth/csrf-token`, {
    withCredentials: true
  }).then((response) => {
    csrfToken = response.data?.csrfToken || null;
    return csrfToken;
  }).catch(() => null).finally(() => {
    csrfPromise = null;
  });

  return csrfPromise;
};

const getAdaptiveTimeout = () => {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return 10000;

  const isSlowNetwork = ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
  if (conn.saveData || isSlowNetwork) {
    return 18000;
  }

  return 10000;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Keep explicit name for compatibility with existing references and docs.
const apiClient = api;

api.interceptors.request.use(async (config) => {
  config.timeout = getAdaptiveTimeout();

  if (typeof config.url === 'string' && config.url.startsWith('/v1/')) {
    config.url = config.url.replace(/^\/v1/, '');
  }

  config.headers = config.headers || {};

  const method = (config.method || 'get').toLowerCase();
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method);
  const isCsrfTokenRoute = typeof config.url === 'string' && config.url.includes('/auth/csrf-token');
  if (needsCsrf && !isCsrfTokenRoute) {
    const token = await ensureCsrfToken();
    if (token) {
      config.headers['x-csrf-token'] = token;
    }
  }

  const cached = sessionStorage.getItem('appwrite_session');
  const cachedUserId = sessionStorage.getItem('appwrite_userid');
  if (cached) {
    config.headers['x-appwrite-session'] = cached;
    if (cachedUserId) {
      config.headers['x-appwrite-userid'] = cachedUserId;
    }
    return config;
  }

  try {
    const { account } = await import('../config/appwrite.js');
    const session = await account.getSession('current');
    const token = session.secret || session.$id;
    sessionStorage.setItem('appwrite_session', token);
    config.headers['x-appwrite-session'] = token;
  } catch {
    // No session. Protected routes can return 401.
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const skipRedirect = [
        '/auth/me',
        '/auth/check-email',
        '/auth/register-profile'
      ].some((path) => url.includes(path));

      if (
        !skipRedirect &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        sessionStorage.removeItem('appwrite_session');
        sessionStorage.removeItem('appwrite_userid');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  resendVerification: (payload) => api.post('/auth/resend-verification', payload),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/v1/auth/profile', profileData),
  updatePassword: (passwordData) => api.put('/v1/auth/password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: ({ email, otp, newPassword }) => api.post('/auth/reset-password', { email, otp, newPassword }),
  deleteAccount: (password) => api.delete('/v1/auth/account', { data: { password } }),
};

export const topicsAPI = {
  getTopics: (params) => api.get('/v1/topics', { params }),
  getTopic: (id) => api.get(`/v1/topics/${id}`),
  createTopic: (topicData) => api.post('/v1/topics', topicData),
  updateTopic: (id, topicData) => api.put(`/v1/topics/${id}`, topicData),
  deleteTopic: (id) => api.delete(`/v1/topics/${id}`),
  getTopicsByCategory: (category, params) => api.get(`/v1/topics/category/${category}`, { params }),
  getPopularTopics: (limit) => api.get('/v1/topics/popular', { params: { limit } }),
  searchTopics: (query, params) => api.get('/v1/topics/search', { params: { query, ...params } }),
  likeTopic: (id) => api.post(`/v1/topics/${id}/like`),
  completeTopic: (id, score) => api.post(`/v1/topics/${id}/complete`, { score }),
};

export const gamesAPI = {
  getGames: (params) => api.get('/v1/games', { params }),
  getGame: (id) => api.get(`/v1/games/${id}`),
  createGame: (gameData) => api.post('/v1/games', gameData),
  updateGame: (id, gameData) => api.put(`/v1/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/v1/games/${id}`),
  getGamesByCategory: (category, params) => api.get(`/v1/games/category/${category}`, { params }),
  getPopularGames: (limit) => api.get('/v1/games/popular', { params: { limit } }),
  submitGameScore: (id, scoreData) => api.post(`/v1/games/${id}/score`, scoreData),
  getGameLeaderboard: (id, params) => api.get(`/v1/games/${id}/leaderboard`, { params }),
  rateGame: (id, rating) => api.post(`/v1/games/${id}/rate`, { rating }),
};

export const experimentsAPI = {
  getExperiments: (params) => api.get('/v1/experiments', { params }),
  getExperiment: (id) => api.get(`/v1/experiments/${id}`),
  createExperiment: (experimentData) => api.post('/v1/experiments', experimentData),
  updateExperiment: (id, experimentData) => api.put(`/v1/experiments/${id}`, experimentData),
  deleteExperiment: (id) => api.delete(`/v1/experiments/${id}`),
  getExperimentsByCategory: (category, params) => api.get(`/v1/experiments/category/${category}`, { params }),
  getPopularExperiments: (limit) => api.get('/v1/experiments/popular', { params: { limit } }),
  submitExperimentResult: (id, resultData) => api.post(`/v1/experiments/${id}/submit`, resultData),
  getExperimentSubmissions: (id, params) => api.get(`/v1/experiments/${id}/submissions`, { params }),
  rateExperiment: (id, rating) => api.post(`/v1/experiments/${id}/rate`, { rating }),
};

export const quizzesAPI = {
  getQuizzes: (params) => api.get('/v1/quizzes', { params }),
  getQuiz: (id) => api.get(`/v1/quizzes/${id}`),
  createQuiz: (quizData) => api.post('/v1/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/v1/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/v1/quizzes/${id}`),
  getQuizzesByTopic: (topicId, params) => api.get(`/v1/quizzes/topic/${topicId}`, { params }),
  startQuizAttempt: (id) => api.post(`/v1/quizzes/${id}/start`),
  submitQuizAnswer: (id, answerData) => api.post(`/v1/quizzes/${id}/answer`, answerData),
  completeQuizAttempt: (id, completionData) => api.post(`/v1/quizzes/${id}/complete`, completionData),
  getQuizResults: (id, params) => api.get(`/v1/quizzes/${id}/results`, { params }),
  getQuizAnalytics: (id) => api.get(`/v1/quizzes/${id}/analytics`),
};

export const progressAPI = {
  getUserProgress: () => api.get('/v1/progress'),
  updateProgress: (progressData) => api.put('/v1/progress', progressData),
  getProgressAnalytics: () => api.get('/v1/progress/analytics'),
  getStreakInfo: () => api.get('/v1/progress/streak'),
  updateStreak: () => api.put('/v1/progress/streak'),
  getAchievements: () => api.get('/v1/progress/achievements'),
  awardBadge: (userId, badgeData) => api.post(`/v1/progress/badge/${userId}`, badgeData),
};

export const habitsAPI = {
  logHabit: (habitData) => api.post('/v1/habits/log', habitData),
  getMyHabits: () => api.get('/v1/habits/me'),
  getMyStreak: () => api.get('/v1/habits/streak')
};

export const impactCalculatorAPI = {
  getMetrics: (period = 'month') => api.get('/v1/impact/me/metrics', { params: { period } }),
  logDailyAction: (payload) => api.post('/v1/impact/daily-action', payload),
  getBaseline: () => api.get('/v1/impact/baseline'),
  setBaseline: (payload) => api.post('/v1/impact/baseline', payload),
  getComparison: (period = 'month') => api.get('/v1/impact/comparison', { params: { period } }),
  getTrend: (months = 6) => api.get('/v1/impact/trend', { params: { months } })
};

export const activityAPI = {
  submitActivity: (activityData) => {
    const { idempotencyKey, ...data } = activityData;
    return api.post('/v1/activity/submit', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    });
  },
  getMySubmissions: () => api.get('/v1/activity/my'),
  getPendingSubmissions: () => api.get('/v1/activity/pending'),
  getAppealedSubmissions: () => api.get('/v1/activity/appeals/pending'),
  verifyActivity: (submissionId, verifyData) => api.put(`/v1/activity/${submissionId}/verify`, verifyData),
  appealSubmission: (submissionId, payload) => api.post(`/v1/activity/${submissionId}/appeal`, payload),
  resolveAppeal: (submissionId, payload) => api.put(`/v1/activity/${submissionId}/appeal/resolve`, payload)
};

// Backward compatibility: some legacy pages call api.activity.*
api.activity = activityAPI;

export const usersAPI = {
  getUsers: (params) => api.get('/v1/users', { params }),
  getUser: (id) => api.get(`/v1/users/${id}`),
  updateUser: (id, userData) => api.put(`/v1/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/v1/users/${id}`),
  getUserProgress: () => api.get('/v1/users/progress'),
  getUserAchievements: () => api.get('/v1/users/achievements'),
  getLeaderboard: (params) => api.get('/v1/users/leaderboard', { params }),
  updateUserRole: (id, role) => api.put(`/v1/users/${id}/role`, { role }),
  updateLanguage: (language) => api.patch('/v1/users/me/language', { language }),
};

export const schoolsAPI = {
  getSchoolSettings: (schoolId) => api.get(`/v1/schools/${schoolId}/settings`),
  updateSchoolSettings: (schoolId, settings) => api.patch(`/v1/schools/${schoolId}/settings`, settings)
};

export const contentReportsAPI = {
  submitReport: ({ contentType, contentId, questionId, reportText }) => api.post(
    `/v1/content/${contentType}/${contentId}/report`,
    {
      question_id: questionId || null,
      report_text: reportText
    }
  )
};

export const adminAPI = {
  getDashboardStats: () => api.get('/v1/admin/dashboard'),
  getContentManagement: (params) => api.get('/v1/admin/content', { params }),
  getUserManagement: (params) => api.get('/v1/admin/users', { params }),
  getAnalytics: (params) => api.get('/v1/admin/analytics', { params }),
  getSystemHealth: () => api.get('/v1/admin/system-health'),
  getContentReports: (params) => api.get('/v1/admin/content-reports', { params }),
  updateContentReport: (reportId, payload) => api.patch(`/v1/admin/content-reports/${reportId}`, payload),
  moderateContent: (type, id, action) => api.put(`/v1/admin/content/${type}/${id}/moderate`, { action }),
  bulkOperations: (operations) => api.post('/v1/admin/content/bulk', { operations }),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/v1/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadVideo: (formData) => api.post('/v1/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDocument: (formData) => api.post('/v1/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/v1/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUploadedFiles: (params) => api.get('/v1/upload/files', { params }),
  deleteFile: (publicId) => api.delete(`/v1/upload/files/${publicId}`),
};

export const storeAPI = {
  getItems: () => api.get('/v1/store/items'),
  redeemItem: (payload) => api.post('/v1/store/redeem', payload),
  getMyRedemptions: () => api.get('/v1/store/redemptions/me'),
  updateRedemptionStatus: (id, payload) => api.patch(`/v1/store/redemptions/${id}/status`, payload)
};

export const feedAPI = {
  getSchoolFeed: (cursor, limit = 10) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    return api.get('/v1/feed/school', { params });
  },
  createPost: (payload) => api.post('/v1/feed/school', payload),
  getPost: (postId) => api.get(`/v1/feed/${postId}`),
  toggleReaction: (postId, payload) => api.post(`/v1/feed/${postId}/react`, payload),
  addComment: (postId, payload) => api.post(`/v1/feed/${postId}/comment`, payload)
};

export const challengesAPI = {
  getAllChallenges: (params) => api.get('/v1/challenges/school-challenges', { params }),
  getChallengeById: (id) => api.get(`/v1/challenges/school-challenges/${id}`),
  getActiveChallenges: () => api.get('/v1/challenges/school-challenges/active'),
  getSchoolChallenges: (schoolId) => api.get(`/v1/challenges/school-challenges/school/${schoolId}`),
  createChallenge: (payload) => api.post('/v1/challenges/school-challenges', payload),
  updateChallengeStatus: (id, payload) => api.patch(`/v1/challenges/school-challenges/${id}/status`, payload),
  updateChallengeScores: (id) => api.post(`/v1/challenges/school-challenges/${id}/update-scores`),
  finalizeChallenge: (id) => api.post(`/v1/challenges/school-challenges/${id}/finalize`),
  deleteChallenge: (id) => api.delete(`/v1/challenges/school-challenges/${id}`)
};

// Generic API request function
export const apiRequest = async (...args) => {
  let method = 'get';
  let url = '';
  let data = undefined;
  let config = {};

  // Case 1: apiRequest(method, url, data, config) -> Explicit axios style
  if (args.length >= 2 && typeof args[0] === 'string' && ['get', 'post', 'put', 'patch', 'delete'].includes(args[0].toLowerCase())) {
    method = args[0].toLowerCase();
    url = args[1];
    data = args.length > 2 ? args[2] : undefined;
    config = args[3] || {};
  }
  // Case 2: apiRequest(url, fetchOptions) -> Fetch style or Axios config style
  else if (args.length > 0 && typeof args[0] === 'string') {
    url = args[0];
    if (args[1] && typeof args[1] === 'object') {
      const options = args[1];
      method = (options.method || 'get').toLowerCase();

      // Handle both fetch-style (body) and axios-style (data) payloads
      if (options.body) {
        try {
          data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch (e) {
          data = options.body;
        }
      } else if (options.data !== undefined) {
        data = options.data;
      }

      // Collect the remaining options as config
      config = { ...options };
      delete config.method;
      delete config.body;
      delete config.data;
    }
  }

  try {
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { apiClient };
export default apiClient;
