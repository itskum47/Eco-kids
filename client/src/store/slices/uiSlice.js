import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Language
  language: localStorage.getItem('language') || 'english',
  
  // Navigation
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  // Modals
  modals: {
    achievementModal: false,
    levelUpModal: false,
    confirmModal: false,
  },
  
  // Notifications
  notifications: [],
  
  // Loading states
  globalLoading: false,
  
  // Toast messages
  toasts: [],
  
  // Search
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  
  // Filters
  filters: {
    category: '',
    difficulty: '',
    gradeLevel: '',
  },
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 12,
  
  // View preferences
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'newest', // 'newest', 'oldest', 'popular', 'rating'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // Navigation actions
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    // Modal actions
    setModal: (state, action) => {
      const { modalName, isOpen, data } = action.payload;
      state.modals[modalName] = isOpen;
      if (data) {
        state.modals[`${modalName}Data`] = data;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        if (!modal.endsWith('Data')) {
          state.modals[modal] = false;
        }
      });
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 4000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.searchLoading = false;
    },
    
    // Filter actions
    setFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
      state.currentPage = 1; // Reset to first page when filter changes
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        difficulty: '',
        gradeLevel: '',
      };
      state.currentPage = 1;
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    
    // View preferences
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      localStorage.setItem('viewMode', action.payload);
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1; // Reset to first page when sort changes
    },
    
    // Achievement actions
    showAchievement: (state, action) => {
      state.modals.achievementModal = true;
      state.modals.achievementModalData = action.payload;
    },
    showLevelUp: (state, action) => {
      state.modals.levelUpModal = true;
      state.modals.levelUpModalData = action.payload;
    },
    
    // Confirmation modal
    showConfirmModal: (state, action) => {
      state.modals.confirmModal = true;
      state.modals.confirmModalData = {
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
        confirmText: action.payload.confirmText || 'Confirm',
        cancelText: action.payload.cancelText || 'Cancel',
        type: action.payload.type || 'warning',
      };
    },
    
    // Reset UI state
    resetUI: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setModal,
  closeAllModals,
  addNotification,
  markNotificationRead,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  addToast,
  removeToast,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearch,
  setFilter,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  setViewMode,
  setSortBy,
  showAchievement,
  showLevelUp,
  showConfirmModal,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;