import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../utils/api';
import { useOfflineQueue } from '../hooks/useOfflineQueue';  // Phase 6: Offline support
import Navbar from '../components/layout/Navbar';
import ActivityTypeSelect from '../components/submit/ActivityTypeSelect';
import ActivityFormInputs from '../components/submit/ActivityFormInputs';
import MySubmissionsList from '../components/submit/MySubmissionsList';
import SDGBadge from '../components/SDGBadge';

// Mapping activity types to SDG goals
const ACTIVITY_SDG_MAP = {
  'tree-planting': [13, 15],
  'plastic-reduction': [12],
  'water-saving': [6],
  'energy-saving': [7, 13],
  'waste-recycling': [12],
  'biodiversity-survey': [15],
  'composting': [12, 15]
};

const ACTIVITY_TYPES = [
  { value: 'tree-planting', label: 'Tree Planting', impactNote: '~20 kg CO₂ over lifetime' },
  { value: 'plastic-reduction', label: 'Plastic Reduction', impactNote: '~1 kg plastic reduced' },
  { value: 'water-saving', label: 'Water Saving', impactNote: '~100 L saved' },
  { value: 'energy-saving', label: 'Energy Saving', impactNote: '~0.7 kg CO₂ saved' },
  { value: 'waste-recycling', label: 'Waste Recycling', impactNote: '~1 kg waste recycled' },
  { value: 'biodiversity-survey', label: 'Biodiversity Survey', impactNote: '~0.2 kg CO₂ indirect' },
  { value: 'composting', label: 'Composting', impactNote: '~0.5 kg plastic reduced' }
];

export default function SubmitActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, submitActivity: submitOfflineActivity } = useOfflineQueue();  // Phase 6: Offline support
  const [view, setView] = useState('submit'); // 'submit' or 'mySubmissions'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');  // For offline feedback
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    activityType: '',
    description: '',
    imageUrl: '',
    latitude: '',
    longitude: ''
  });

  // Persistent unique key preventing duplicate retry bugs (P6 Hardening)
  const idempotencyKeyRef = useRef(uuidv4());

  useEffect(() => {
    // Load my submissions if coming from my-submissions route
    if (location.pathname === '/my-submissions') {
      setView('mySubmissions');
      loadMySubmissions();
    }
  }, [location.pathname]);

  const loadMySubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.activity.getMySubmissions();
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmissionMessage('');

    // Form Validation Styles are handled inline via `error` state checking emptiness
    if (!formData.activityType || !formData.description.trim() || !formData.imageUrl.trim()) {
      setError('Please fill in all required fields (Type, Description, Image URL) correctly.');

      // Animated shake effect on form elements
      const form = document.getElementById('activity-form');
      if (form) {
        form.classList.add('animate-[shake_0.5s_ease-in-out]');
        setTimeout(() => form.classList.remove('animate-[shake_0.5s_ease-in-out]'), 500);
      }
      return;
    }

    setLoading(true);
    try {
      const activityData = {
        activityType: formData.activityType,
        description: formData.description,
        imageUrl: formData.imageUrl,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        idempotencyKey: idempotencyKeyRef.current
      };

      let response;

      // Phase 6: Check if online
      if (isOnline) {
        // Submit online
        response = await api.activity.submitActivity(activityData);

        if (response.success) {
          idempotencyKeyRef.current = uuidv4(); // Reset idempotency
          setFormData({ activityType: '', description: '', imageUrl: '', latitude: '', longitude: '' });
          setSubmissionMessage('✅ Activity submitted! Waiting for teacher approval...');
          setTimeout(() => {
            setView('mySubmissions');
            loadMySubmissions();
          }, 1500);
        }
      } else {
        // Submit offline
        const offlineResult = await submitOfflineActivity(activityData);
        
        if (offlineResult.success) {
          idempotencyKeyRef.current = uuidv4(); // Reset idempotency
          setFormData({ activityType: '', description: '', imageUrl: '', latitude: '', longitude: '' });
          setSubmissionMessage('📱 Saved offline! Your activity will sync when you reconnect.');
          setTimeout(() => {
            setView('mySubmissions');
          }, 1500);
        } else {
          setError('Failed to save activity. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit activity');
    } finally {
      setLoading(false);
    }
  };

  const selectedActivity = ACTIVITY_TYPES.find(a => a.value === formData.activityType);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10 overflow-x-hidden relative">
      <Navbar />

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">

        {/* Toggle Switch */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-[var(--s2)] border border-[var(--b2)] rounded-full p-1.5 flex gap-1 relative shadow-lg">
            {/* Animated Tab Indicator */}
            <motion.div
              layoutId="submitPageTab"
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[var(--v1)] to-[var(--p1)] rounded-full shadow-[0_0_20px_rgba(108,71,255,0.4)]"
              initial={false}
              animate={{
                left: view === 'submit' ? '6px' : 'calc(50% + 1px)'
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />

            <button
              onClick={() => setView('submit')}
              className={`relative z-10 font-ui font-bold text-[10px] md:text-sm uppercase tracking-widest px-6 md:px-8 py-3 rounded-full transition-colors ${view === 'submit' ? 'text-white' : 'text-[var(--t2)] hover:text-[var(--t1)]'
                }`}
            >
              Submit Activity
            </button>
            <button
              onClick={() => {
                setView('mySubmissions');
                loadMySubmissions();
              }}
              className={`relative z-10 font-ui font-bold text-[10px] md:text-sm uppercase tracking-widest px-6 md:px-8 py-3 rounded-full transition-colors ${view === 'mySubmissions' ? 'text-white' : 'text-[var(--t2)] hover:text-[var(--t1)]'
                }`}
            >
              My Logbook
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {view === 'mySubmissions' ? (
            <motion.div
              key="submissions-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {error && (
                <div className="mb-6 bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.3)] p-4 rounded-xl text-[var(--red)] text-sm font-ui flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {loading ? (
                <div className="py-20 flex flex-col items-center">
                  <span className="w-12 h-12 border-4 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin mb-4" />
                  <p className="font-ui text-[var(--t2)] uppercase tracking-widest text-xs font-bold">Loading submissions...</p>
                </div>
              ) : (
                <MySubmissionsList submissions={submissions} setView={setView} />
              )}
            </motion.div>

          ) : (

            <motion.div
              key="submit-form-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="eco-card p-6 md:p-10 relative overflow-hidden group"
            >
              {/* Form Title */}
              <div className="mb-8">
                <h1 className="font-display text-4xl md:text-5xl font-normal leading-none mb-3 text-[var(--t1)]">Log Your Impact</h1>
                <p className="font-ui text-[var(--t2)] text-sm md:text-base leading-relaxed">
                  Every small action counts. Document your eco-activities for verification and earn XP towards your next level.
                </p>

                {/* SDG Impact Badge - Show when activity type selected */}
                {selectedActivity && (
                  <div className="mt-4 pt-4 border-t border-[var(--b2)]">
                    <p className="font-ui text-[9px] uppercase tracking-widest font-bold text-[var(--t3)] mb-2">Supporting SDG Goals</p>
                    <div className="flex gap-2 flex-wrap">
                      {(ACTIVITY_SDG_MAP[formData.activityType] || []).map(goalNum => (
                        <SDGBadge key={goalNum} goalNumber={goalNum} size="md" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-8 bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.3)] p-4 rounded-xl text-[var(--red)] text-sm font-ui flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {submissionMessage && (
                <div className="mb-8 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] p-4 rounded-xl text-[var(--success)] text-sm font-ui flex items-center gap-2">
                  <span>✓</span> {submissionMessage}
                </div>
              )}

              <form id="activity-form" onSubmit={handleSubmit} className="flex flex-col gap-8">

                {/* Custom Styled Select Component */}
                <ActivityTypeSelect
                  formData={formData}
                  handleChange={handleChange}
                  ACTIVITY_TYPES={ACTIVITY_TYPES}
                  selectedActivity={selectedActivity}
                />

                {/* Form Elements for description and image */}
                <ActivityFormInputs
                  formData={formData}
                  handleChange={handleChange}
                  error={error}
                />

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--b2)]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 shadow-[0_0_20px_rgba(108,71,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span>{loading ? 'Submitting Data...' : 'Submit for Verification'}</span>
                    {!loading && <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn-ghost flex-1 sm:max-w-[160px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Shake Animation definition for form validation */}
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  20%, 60% { transform: translateX(-5px); }
                  40%, 80% { transform: translateX(5px); }
                }
              `}} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
