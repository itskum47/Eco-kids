import { useState, useEffect, useCallback } from 'react';

/**
 * useOfflineQueue Hook
 * Manages offline activity submission queue for low-connectivity areas
 * 
 * Features:
 * - Detects online/offline status using navigator.onLine + events
 * - Stores submissions in IndexedDB when offline
 * - Auto-syncs when connection restored
 * - Background sync support (service worker)
 */

const DB_NAME = 'ecokids_offline';
const STORE_NAME = 'pendingSubmissions';

/**
 * Initialize IndexedDB
 */
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        // Upgrade needed — close and handle in onupgradeneeded
        const upgradeRequest = indexedDB.open(DB_NAME, 2);
        upgradeRequest.onupgradeneeded = (event) => {
          const upgradeDB = event.target.result;
          if (!upgradeDB.objectStoreNames.contains(STORE_NAME)) {
            upgradeDB.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          }
        };
        upgradeRequest.onsuccess = () => {
          upgradeRequest.result.close();
          resolve(indexedDB.open(DB_NAME, 2).result);
        };
      } else {
        resolve(db);
      }
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * Store activity in offline queue
 */
const storeOfflineSubmission = async (activityData) => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const submission = {
        ...activityData,
        submittedAt: new Date().toISOString(),
        synced: false
      };

      const request = store.add(submission);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to store offline submission:', error);
    throw error;
  }
};

/**
 * Get all pending submissions
 */
const getPendingSubmissions = async () => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const submissions = request.result.filter(s => !s.synced);
        resolve(submissions);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get pending submissions:', error);
    return [];
  }
};

/**
 * Mark submission as synced
 */
const markAsSynced = async (submissionId) => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(submissionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const submission = request.result;
        if (submission) {
          submission.synced = true;
          const updateRequest = store.put(submission);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(submission);
        } else {
          resolve(null);
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to mark submission as synced:', error);
    throw error;
  }
};

/**
 * Delete offline submission (after successful sync)
 */
const deleteOfflineSubmission = async (submissionId) => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(submissionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to delete offline submission:', error);
    throw error;
  }
};

/**
 * Main hook
 */
export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Detect online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count on mount and after syncing
  useEffect(() => {
    const updatePendingCount = async () => {
      const submissions = await getPendingSubmissions();
      setPendingCount(submissions.length);
    };

    updatePendingCount();
  }, [isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncOfflineSubmissions();
    }
  }, [isOnline]);

  /**
   * Submit activity (online or offline)
   */
  const submitActivity = useCallback(async (activityData) => {
    try {
      await storeOfflineSubmission(activityData);
      setPendingCount((prev) => prev + 1);

      if (isOnline) {
        // Auto-sync immediately if online
        setTimeout(() => syncOfflineSubmissions(), 100);
      }

      return { success: true, offline: true };
    } catch (error) {
      console.error('Failed to store activity:', error);
      return { success: false, error };
    }
  }, [isOnline]);

  /**
   * Sync all offline submissions
   */
  const syncOfflineSubmissions = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      const submissions = await getPendingSubmissions();
      if (submissions.length === 0) {
        setIsSyncing(false);
        return { success: true, synced: 0 };
      }

      const token = localStorage.getItem('token');
      let successCount = 0;

      // Process one-by-one so each gets its own AI verification job
      for (const submission of submissions) {
        try {
          let response;

          if (submission.imageBase64) {
            // Convert base64 back to Blob and POST as multipart
            const byteString = atob(submission.imageBase64.split(',')[1]);
            const mime = submission.imageMime || 'image/jpeg';
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: mime });

            const fd = new FormData();
            fd.append('file', blob, 'offline-evidence.jpg');
            fd.append('activityType', submission.activityType);
            fd.append('description', submission.description);
            if (submission.latitude)  fd.append('latitude',  String(submission.latitude));
            if (submission.longitude) fd.append('longitude', String(submission.longitude));
            fd.append('idempotencyKey', submission.idempotencyKey || `offline-${submission.id}`);

            response = await fetch('/api/v1/activity/submit', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }, // no Content-Type — browser sets boundary
              body: fd
            });
          } else {
            // No image — fall back to JSON endpoint (teacher will review)
            response = await fetch('/api/v1/activity/sync-offline', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ submissions: [submission] })
            });
          }

          if (response.ok) {
            await deleteOfflineSubmission(submission.id);
            successCount++;
          }
        } catch {
          // Continue syncing remaining; this one will retry next time online
        }
      }

      setPendingCount(prev => Math.max(0, prev - successCount));
      setIsSyncing(false);
      return { success: true, synced: successCount, failed: submissions.length - successCount };
    } catch (error) {
      console.error('Failed to sync offline submissions:', error);
      setIsSyncing(false);
      return { success: false, error };
    }
  }, [isSyncing, isOnline]);


  return {
    isOnline,
    pendingCount,
    isSyncing,
    submitActivity,
    syncOfflineSubmissions,
    // Exposed for advanced usage
    getPendingSubmissions,
    storeOfflineSubmission,
    deleteOfflineSubmission
  };
};

export default useOfflineQueue;
