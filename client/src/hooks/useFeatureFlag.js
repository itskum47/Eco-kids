import { useEffect, useState } from 'react';

/**
 * useFeatureFlag Hook
 * Fetches feature flags from server and provides client-side feature gating
 * Caches result in React state to avoid repeated API calls
 * 
 * Usage:
 *   const { isEnabled } = useFeatureFlag();
 *   if (isEnabled('AI_CHATBOT')) { return <EcoBot />; }
 */
const useFeatureFlag = () => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch feature flags on mount
    const fetchFeatureFlags = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/config/features');
        if (!response.ok) {
          throw new Error(`Failed to fetch feature flags: ${response.status}`);
        }
        const data = await response.json();
        setFlags(data.featureFlags || {});
      } catch (err) {
        console.warn('[Feature Flags] Error fetching flags:', err);
        setError(err.message);
        // Fail-safe: all flags default to false if fetch fails
        setFlags({});
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlags();
  }, []);

  /**
   * Check if a specific feature flag is enabled
   * @param {string} flagName - The feature flag name (e.g., 'AI_CHATBOT')
   * @returns {boolean} - True if the feature is enabled, false otherwise
   */
  const isEnabled = (flagName) => {
    return flags[flagName] === true;
  };

  return {
    isEnabled,
    flags,
    loading,
    error
  };
};

export default useFeatureFlag;
