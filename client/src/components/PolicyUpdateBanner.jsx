import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, Check } from 'lucide-react';

/**
 * Policy Update Banner Component
 * Shows when student has pending policy updates requiring reconsent
 * Phase 6: BOOST-1 DPDP 2023 Compliance
 */
const PolicyUpdateBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [policyData, setPolicyData] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    checkPolicyStatus();
  }, []);

  const checkPolicyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/compliance/policy-version', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data.requiresReconsent) {
        setPolicyData(data.data);
        setShowBanner(true);
      }
    } catch (err) {
      console.error('Failed to check policy status:', err);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/compliance/accept-policy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accept: true })
      });

      const data = await response.json();
      if (data.success) {
        setAccepted(true);
        setTimeout(() => {
          setShowBanner(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to accept policy:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && !accepted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-50 mx-4 mt-2"
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                    📋 Privacy Policy Update
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    We've updated our privacy practices to comply with DPDP Act 2023. Please review and accept the updated policy to continue.
                  </p>

                  {/* Policy Changes Summary */}
                  <motion.button
                    onClick={() => setExpandedChanges(!expandedChanges)}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-700 flex items-center gap-1 mb-3"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedChanges ? 'rotate-180' : ''
                      }`}
                    />
                    View changes
                  </motion.button>

                  <AnimatePresence>
                    {expandedChanges && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 space-y-2 bg-white/50 dark:bg-black/20 p-3 rounded"
                      >
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>Enhanced data protection per DPDP Act 2023</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>You can withdraw consent anytime</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>Request all personal data held by us</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>Data automatically deleted 1 year after school exit</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500">✓</span>
                            <span>Enhanced protection for sensitive information</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleAccept}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          I Accept
                        </>
                      )}
                    </motion.button>
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-300 rounded-lg font-semibold text-sm transition"
                    >
                      📖 Read Full Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {accepted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-50 mx-4 mt-2"
        >
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900 dark:text-green-100">
                  ✅ Policy Updated
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Thank you! Your consent has been updated to the latest privacy policy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PolicyUpdateBanner;
