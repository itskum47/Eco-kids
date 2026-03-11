import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track online/offline status.
 * Returns { isOnline, wasOffline } — wasOffline is true if user was offline and came back.
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setWasOffline(true);
        // Clear "was offline" after 5 seconds
        setTimeout(() => setWasOffline(false), 5000);
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline, wasOffline };
}

export default useOnlineStatus;
