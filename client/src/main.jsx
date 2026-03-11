// ══ STYLES FIRST — always, no exceptions ══
import './styles/bright-tokens.css'
import './styles/index.css'

// ══ Then React ══
import './i18n';
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'

// ══ Then state management ══
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import authSlice from './store/slices/authSlice'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import * as Sentry from "@sentry/react"

// Initialize Sentry for production error monitoring
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: import.meta.env.PROD,
})

const workingStore = configureStore({
  reducer: {
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    }
  }
})

// PageLoader shown while lazy() chunks are being fetched
const PageLoader = () => (
  <div className="min-h-screen bg-[#f9fffe] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-[#e8f5e9] border-t-[#2e7d32] animate-spin" />
      <p className="text-[#4a7a4a] font-semibold animate-pulse">Loading EcoKids…</p>
    </div>
  </div>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err?.message || err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Fix #8: ErrorBoundary prevents blank white screen on unhandled errors */}
    <ErrorBoundary>
      <Provider store={workingStore}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            {/* Fix #7: Suspense catches React.lazy() chunk loading */}
            <Suspense fallback={<PageLoader />}>
              <App />
            </Suspense>
          </QueryClientProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#064e17',
                border: '1px solid #e8f5e9',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#2e7d32',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)