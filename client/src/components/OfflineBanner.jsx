/**
 * OfflineBanner.jsx — Demo-hardened version
 *
 * Three clear states judges will visibly notice:
 *   OFFLINE  → amber  "📵 No internet — your action is saved and will sync when back"
 *   SYNCING  → blue   "🔄 Back online — syncing X saved action(s)…"
 *   SYNCED   → green  "✅ All synced! Eco-points updated." (auto-hides after 3.5s)
 *
 * Sits just BELOW the navbar (top-[70px]) so it doesn't cover the nav branding.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

const OfflineBanner = () => {
  const { isOnline, pendingCount, isSyncing, syncOfflineSubmissions } = useOfflineQueue();
  const [phase, setPhase] = useState('hidden'); // hidden | offline | syncing | synced
  const prevOnlineRef = useRef(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;

    if (!isOnline) {
      clearTimeout(hideTimer.current);
      setPhase('offline');
    } else if (!wasOnline && isOnline) {
      // Just reconnected
      if (pendingCount > 0) {
        setPhase('syncing');
        syncOfflineSubmissions().then(() => {
          setPhase('synced');
          hideTimer.current = setTimeout(() => setPhase('hidden'), 3500);
        });
      } else {
        setPhase('hidden');
      }
    } else if (isOnline && pendingCount === 0 && phase !== 'synced') {
      setPhase('hidden');
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline, pendingCount]);

  // Reflect isSyncing from hook directly
  useEffect(() => {
    if (isSyncing) setPhase('syncing');
  }, [isSyncing]);

  const cfg = {
    offline: {
      bg: '#d97706', // amber-600
      text: pendingCount > 0
        ? `📵 No internet — ${pendingCount} action${pendingCount > 1 ? 's' : ''} saved locally, will sync on reconnect`
        : '📵 No internet — any actions you take will be saved locally',
    },
    syncing: {
      bg: '#2563eb', // blue-600
      text: `🔄 Back online — syncing ${pendingCount} saved action${pendingCount !== 1 ? 's' : ''}…`,
    },
    synced: {
      bg: '#16a34a', // green-600
      text: '✅ All synced! Your eco-points have been updated.',
    },
  };

  const current = cfg[phase];

  return (
    <AnimatePresence>
      {phase !== 'hidden' && current && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -36, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed left-0 right-0 z-[98] flex items-center justify-center px-4 py-2 text-sm font-semibold text-white"
          style={{
            top: '70px',
            background: current.bg,
            paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
          }}
        >
          <span className={phase === 'syncing' ? 'flex items-center gap-2' : ''}>
            {current.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
