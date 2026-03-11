import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

/**
 * Offline Banner Component (Phase 6 Enhanced)
 * Shows when user is offline or has pending submissions
 * Features:
 * - Offline status indicator
 * - Pending submissions badge
 * - Manual sync button
 * - Auto-sync when connection restored
 */
const OfflineBanner = () => {
  const { isOnline, pendingCount, isSyncing, syncOfflineSubmissions } = useOfflineQueue();
  const [showBanner, setShowBanner] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    // Show banner if offline or have pending submissions
    setShowBanner(!isOnline || pendingCount > 0);
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    const result = await syncOfflineSubmissions();
    if (result.success && result.synced > 0) {
      setSyncMessage(`✅ Synced ${result.synced} activities!`);
      setTimeout(() => setSyncMessage(''), 3000);
    } else if (!result.success) {
      setSyncMessage('❌ Sync failed. Try again.');
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-2
        px-4 py-2.5 text-sm font-medium transition-all duration-300
        ${!isOnline ? 'bg-red-500/90' : pendingCount > 0 ? 'bg-yellow-500/90' : 'bg-emerald-500/90'}
        text-white backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 flex-1">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>📶 You're offline. Activities will sync when connected.</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>🔄 {pendingCount} submission{pendingCount > 1 ? 's' : ''} pending sync</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>✅ Back online! Syncing your data...</span>
          </>
        )}
      </div>

      {/* Sync Button */}
      {pendingCount > 0 && isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 px-3 py-1 rounded-lg text-xs font-medium transition"
          title="Manually sync pending submissions"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}

      {/* Sync Status Message */}
      {syncMessage && (
        <div className="ml-2 text-xs font-semibold text-white animate-pulse">
          {syncMessage}
        </div>
      )}
    </div>
  );
};

export default OfflineBanner;
