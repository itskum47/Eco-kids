import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../utils/api';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import SubmissionCelebration from '../components/SubmissionCelebration';
import Navbar from '../components/layout/Navbar';
import ActivityTypeSelect from '../components/submit/ActivityTypeSelect';
import ActivityFormInputs from '../components/submit/ActivityFormInputs';
import MySubmissionsList from '../components/submit/MySubmissionsList';
import SDGBadge from '../components/SDGBadge';

// Mapping activity types to SDG goals
const ACTIVITY_SDG_MAP = {
  'tree-planting': [13, 15],
  'waste-segregation': [12],
  'water-conservation': [6],
  'energy-saving': [7, 13],
  'composting': [12, 15],
  'nature-walk': [15],
  'quiz-completion': [4],
  'stubble-management': [13, 15],
  'sutlej-cleanup': [6, 14, 15],
  'groundwater-conservation': [6, 13],
  'air-quality-monitoring': [3, 11, 13],
  'urban-tree-planting': [13, 15]
};

const ACTIVITY_TYPES = [
  { value: 'tree-planting', label: 'Tree Planting', impactNote: '~20 kg CO₂ over lifetime' },
  { value: 'waste-segregation', label: 'Waste Segregation', impactNote: '~1 kg waste recycled' },
  { value: 'water-conservation', label: 'Water Conservation', impactNote: '~100 L saved' },
  { value: 'energy-saving', label: 'Energy Saving', impactNote: '~0.7 kg CO₂ saved' },
  { value: 'composting', label: 'Composting', impactNote: '~0.5 kg plastic reduced' },
  { value: 'nature-walk', label: 'Nature Walk', impactNote: 'Local biodiversity observation' },
  { value: 'quiz-completion', label: 'Quiz Completion', impactNote: 'Demonstrate climate knowledge' },
  { value: 'stubble-management', label: 'Stubble Management (Punjab)', impactNote: 'Prevent crop residue burning' },
  { value: 'sutlej-cleanup', label: 'Sutlej/Beas Cleanup', impactNote: 'Riverbank waste removal' },
  { value: 'groundwater-conservation', label: 'Groundwater Conservation', impactNote: 'Save Punjab groundwater' },
  { value: 'air-quality-monitoring', label: 'Air Quality Monitoring', impactNote: 'City AQI awareness' },
  { value: 'urban-tree-planting', label: 'Urban Tree Planting', impactNote: 'Shade + air quality' }
];

export default function SubmitActivityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, submitActivity: submitOfflineActivity } = useOfflineQueue();  // Phase 6: Offline support
  const lightPageVars = {
    '--bg': '#f8fafc',
    '--s1': '#ffffff',
    '--s2': '#f8fafc',
    '--b1': '#e2e8f0',
    '--b2': '#cbd5e1',
    '--t1': '#0f172a',
    '--t2': '#475569',
    '--t3': '#64748b'
  };
  const [view, setView] = useState('submit'); // 'submit' or 'mySubmissions'
  const [loading, setLoading] = useState(false);
  const [aiStage, setAiStage] = useState(0); // 0=idle 1=uploading 2=analysing 3=awarding
  const [error, setError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [appealDrafts, setAppealDrafts] = useState({});
  const [appealSubmitting, setAppealSubmitting] = useState({});
  const [appealSuccess, setAppealSuccess] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [reward, setReward] = useState(null); // { points, activityLabel } — triggers confetti
  const [formData, setFormData] = useState({
    activityType: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  // Persistent unique key preventing duplicate retry bugs (P6 Hardening)
  const idempotencyKeyRef = useRef(uuidv4());

  // Drive AI stage messages — transitions fast enough to feel alive, slow enough to read
  useEffect(() => {
    if (!loading) { setAiStage(0); return; }
    setAiStage(1);                              // immediate: uploading
    const t1 = setTimeout(() => setAiStage(2), 600); // AI analysing — fast uploads land in ~400ms
    const t2 = setTimeout(() => setAiStage(3), 3000); // neutral loop if network is slow
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

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

  const handleFileChange = (file) => {
    setImageFile(file);
  };

  const handleStartAppeal = (submissionId) => {
    setAppealDrafts(prev => ({ ...prev, [submissionId]: prev[submissionId] || '' }));
  };

  const handleAppealReasonChange = (submissionId, value) => {
    setAppealDrafts(prev => ({ ...prev, [submissionId]: value.slice(0, 200) }));
  };

  const handleSubmitAppeal = async (submissionId) => {
    const reason = (appealDrafts[submissionId] || '').trim();
    if (!reason) {
      setError('Please provide an appeal reason before submitting.');
      return;
    }

    setAppealSubmitting(prev => ({ ...prev, [submissionId]: true }));
    setError('');

    try {
      const response = await api.activity.appealSubmission(submissionId, { reason });
      if (response?.success) {
        setAppealSuccess(prev => ({ ...prev, [submissionId]: true }));
        setAppealDrafts(prev => ({ ...prev, [submissionId]: '' }));
        await loadMySubmissions();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit appeal');
    } finally {
      setAppealSubmitting(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmissionMessage('');

    if (!formData.activityType || !formData.description.trim() || !imageFile) {
      setError('Please fill in all required fields and attach a photo.');
      const form = document.getElementById('activity-form');
      if (form) {
        form.classList.add('animate-[shake_0.5s_ease-in-out]');
        setTimeout(() => form.classList.remove('animate-[shake_0.5s_ease-in-out]'), 500);
      }
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        // Build multipart form — server receives a real file buffer for Cloudinary
        const payload = new FormData();
        payload.append('file', imageFile, imageFile.name || 'evidence.jpg');
        payload.append('activityType', formData.activityType);
        payload.append('description', formData.description);
        if (formData.latitude)  payload.append('latitude',  formData.latitude);
        if (formData.longitude) payload.append('longitude', formData.longitude);
        payload.append('idempotencyKey', idempotencyKeyRef.current);

        const response = await api.activity.submitActivityMultipart(payload);

        if (response.success) {
          idempotencyKeyRef.current = uuidv4();
          const submittedLabel = ACTIVITY_TYPES.find(a => a.value === formData.activityType)?.label || formData.activityType;
          const earnedPoints = response.data?.pointsAwarded || response.data?.submission?.pointsAwarded || 50;
          setFormData({ activityType: '', description: '', latitude: '', longitude: '' });
          setImageFile(null);
          // 🎉 Trigger celebration — timer matches component's internal 3800ms auto-dismiss
          setReward({ points: earnedPoints, activityLabel: submittedLabel });
          setTimeout(() => {
            setReward(null);
            setView('mySubmissions');
            loadMySubmissions();
          }, 3800);
        }
      } else {
        // Offline path: File objects cannot be stored in IndexedDB directly.
        // Convert to base64 string first, then store as JSON-serializable data.
        let imageBase64 = null;
        let imageMime = null;
        if (imageFile) {
          try {
            imageBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result); // data:image/...;base64,...
              reader.onerror = reject;
              reader.readAsDataURL(imageFile);
            });
            imageMime = imageFile.type || 'image/jpeg';
          } catch {
            // If conversion fails, submit without image — server will escalate to teacher
          }
        }

        const offlineResult = await submitOfflineActivity({
          activityType: formData.activityType,
          description: formData.description,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          idempotencyKey: idempotencyKeyRef.current,
          imageBase64,   // serializable for IndexedDB
          imageMime
        });

        if (offlineResult.success) {
          idempotencyKeyRef.current = uuidv4();
          setFormData({ activityType: '', description: '', latitude: '', longitude: '' });
          setImageFile(null);
          setSubmissionMessage('📱 Saved offline! Will sync automatically when you reconnect.');
          setTimeout(() => setView('mySubmissions'), 1500);
        } else {
          setError('Failed to save activity offline. Please try again.');
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
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg)] pb-24 md:pb-10 overflow-x-hidden relative" style={lightPageVars}>
      {/* 🎉 AI Approval Celebration — appears on top of everything */}
      <AnimatePresence>
        {reward && (
          <SubmissionCelebration
            points={reward.points}
            activityLabel={reward.activityLabel}
            onDone={() => setReward(null)}
          />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">

        {/* Toggle Switch */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-white dark:bg-[var(--s2)] border border-gray-300 dark:border-[var(--b2)] rounded-full p-1.5 flex gap-1 relative shadow-lg">
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
              className={`relative z-10 font-ui font-bold text-[10px] md:text-sm uppercase tracking-widest px-6 md:px-8 py-3 rounded-full transition-colors ${view === 'submit' ? 'text-white' : 'text-gray-600 dark:text-[var(--t2)] hover:text-gray-900 dark:hover:text-[var(--t1)]'
                }`}
            >
              Submit Activity
            </button>
            <button
              onClick={() => {
                setView('mySubmissions');
                loadMySubmissions();
              }}
              className={`relative z-10 font-ui font-bold text-[10px] md:text-sm uppercase tracking-widest px-6 md:px-8 py-3 rounded-full transition-colors ${view === 'mySubmissions' ? 'text-white' : 'text-gray-600 dark:text-[var(--t2)] hover:text-gray-900 dark:hover:text-[var(--t1)]'
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
                  <p className="font-ui text-gray-600 dark:text-[var(--t2)] uppercase tracking-widest text-xs font-bold">Loading submissions...</p>
                </div>
              ) : (
                <MySubmissionsList
                  submissions={submissions}
                  setView={setView}
                  appealDrafts={appealDrafts}
                  appealSubmitting={appealSubmitting}
                  appealSuccess={appealSuccess}
                  onStartAppeal={handleStartAppeal}
                  onAppealReasonChange={handleAppealReasonChange}
                  onSubmitAppeal={handleSubmitAppeal}
                />
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
                <h1 className="font-display text-4xl md:text-5xl font-normal leading-none mb-3 text-gray-900 dark:text-[var(--t1)]">Log Your Impact</h1>
                <p className="font-ui text-gray-600 dark:text-[var(--t2)] text-sm md:text-base leading-relaxed">
                  Every small action counts. Document your eco-activities for verification and earn XP towards your next level.
                </p>

                {/* SDG Impact Badge - Show when activity type selected */}
                {selectedActivity && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-[var(--b2)]">
                    <p className="font-ui text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-[var(--t3)] mb-2">Supporting SDG Goals</p>
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
                  handleFileChange={handleFileChange}
                  error={error}
                />

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-300 dark:border-[var(--b2)]">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary flex-1 shadow-[0_0_20px_rgba(108,71,255,0.2)] disabled:cursor-not-allowed group transition-all duration-300 ${
                      loading ? 'bg-green-500 shadow-[0_0_24px_rgba(34,197,94,0.5)]' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span className="animate-pulse">
                          {aiStage === 1 && '📤 Uploading photo…'}
                          {aiStage === 2 && '🤖 AI is analysing…'}
                          {aiStage === 3 && '🔄 Verifying…'}
                        </span>
                      </span>
                    ) : (
                      <span>Submit for Verification</span>
                    )}
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
