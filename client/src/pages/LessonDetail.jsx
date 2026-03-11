import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaLeaf, FaWater, FaSun, FaRecycle, FaGlobeAmericas, FaSmog, FaCheckCircle, FaLock, FaChevronLeft, FaStar, FaUserAstronaut } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import confetti from 'canvas-confetti';

const CATEGORY_CONFIG = {
  climate: { icon: <FaGlobeAmericas />, colorVar: 'var(--c1)', bgGradient: 'from-[rgba(0,229,255,0.2)] to-transparent', label: 'Climate' },
  waste: { icon: <FaRecycle />, colorVar: 'var(--amber)', bgGradient: 'from-[rgba(255,204,0,0.2)] to-transparent', label: 'Waste' },
  water: { icon: <FaWater />, colorVar: 'var(--Secondary-Blue, #3b82f6)', bgGradient: 'from-[rgba(59,130,246,0.2)] to-transparent', label: 'Water' },
  biodiversity: { icon: <FaLeaf />, colorVar: 'var(--g1)', bgGradient: 'from-[rgba(0,255,136,0.2)] to-transparent', label: 'Biodiversity' },
  energy: { icon: <FaSun />, colorVar: 'var(--p1)', bgGradient: 'from-[rgba(255,71,184,0.2)] to-transparent', label: 'Energy' },
  pollution: { icon: <FaSmog />, colorVar: 'var(--v2)', bgGradient: 'from-[rgba(155,122,255,0.2)] to-transparent', label: 'Pollution' },
  default: { icon: <FaBookOpen />, colorVar: 'var(--t2)', bgGradient: 'from-[rgba(138,128,184,0.2)] to-transparent', label: 'General' }
};

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!id) return;
    fetchLessonDetails();
    if (token) checkLessonStatus();
  }, [id, token]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/environmental-lessons/${id}`);
      setLesson(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lesson data');
    } finally {
      setLoading(false);
    }
  };

  const checkLessonStatus = async () => {
    try {
      const response = await axios.get(`/api/environmental-lessons/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompleted(response.data.data.completed);
    } catch (err) { }
  };

  const handleCompleteLesson = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setCompleting(true);
      setError(null);

      const response = await axios.post(
        `/api/environmental-lessons/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(response.data.message);
      setCompleted(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff88', '#00e5ff', '#6c47ff']
      });

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        setCompleted(true);
      } else {
        setError(err.response?.data?.message || 'Verification failed');
      }
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4 opacity-50">⚠️</span>
        <h2 className="font-display text-2xl text-[var(--t1)] mb-2">Data Corruption</h2>
        <p className="font-ui text-[var(--t2)] mb-6">{error}</p>
        <button onClick={() => navigate('/environmental-lessons')} className="btn-ghost">Return to Base</button>
      </div>
    );
  }

  if (!lesson) return null;

  const config = CATEGORY_CONFIG[lesson.category.toLowerCase()] || CATEGORY_CONFIG.default;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10 overflow-x-hidden relative">
      <Navbar />

      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-full h-[50vh] opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${config.colorVar}, transparent 70%)` }} />

      <main className="max-w-[1020px] mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">

        <button
          onClick={() => navigate('/environmental-lessons')}
          className="flex items-center gap-2 text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest hover:text-[var(--t1)] transition-colors mb-8 bg-[var(--s1)] px-4 py-2 rounded-full border border-[var(--b1)] w-fit hover:border-[var(--v1)]"
        >
          <FaChevronLeft /> Back to Modules
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eco-card p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none" style={{ color: config.colorVar }}>
                {config.icon}
              </div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="px-3 py-1 text-[10px] font-ui font-bold uppercase tracking-widest rounded border bg-[var(--s2)]" style={{ borderColor: config.colorVar, color: config.colorVar }}>
                  {lesson.category}
                </span>
                <span className="px-3 py-1 text-[10px] font-ui font-bold uppercase tracking-widest rounded border bg-[var(--s2)] border-[var(--b2)] text-[var(--t3)]">
                  {lesson.difficulty}
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-5xl leading-tight text-[var(--t1)] mb-4 relative z-10">
                {lesson.title}
              </h1>

              {lesson.description && (
                <p className="font-ui text-base text-[var(--t2)] leading-relaxed max-w-[600px] relative z-10">
                  {lesson.description}
                </p>
              )}
            </motion.div>

            {/* Core Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="eco-card p-6 md:p-10">
              {lesson.content && (
                <div className="mb-10 text-[var(--t1)] font-ui leading-loose prose prose-invert max-w-none prose-p:text-[var(--t2)] prose-headings:font-display prose-headings:text-[var(--t1)] prose-a:text-[var(--v1)]">
                  <h2 className="text-2xl font-display mb-6 border-b border-[var(--b1)] pb-2 flex items-center gap-3">
                    <span className="text-[var(--v2)]">📄</span> Briefing Data
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
                </div>
              )}

              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-display text-[var(--t1)] mb-6 border-b border-[var(--b1)] pb-2 flex items-center gap-3">
                    <span className="text-[var(--c1)]">🎯</span> Mission Objectives
                  </h2>
                  <ul className="space-y-4">
                    {lesson.objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-[var(--s2)] p-4 rounded-xl border border-[var(--b2)]">
                        <FaCheckCircle className="text-[var(--c1)] mt-1 flex-shrink-0" />
                        <span className="font-ui text-sm text-[var(--t2)] leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.tags && lesson.tags.length > 0 && (
                <div className="pt-6 border-t border-[var(--b1)]">
                  <p className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--t3)] mb-3">Associated Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[var(--s2)] border border-[var(--b2)] text-[var(--t3)] font-ui text-[10px] font-bold uppercase tracking-wider rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">

            {/* Completion Terminal */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="eco-card p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(108,71,255,0.05)] to-transparent pointer-events-none" />

              <h3 className="font-display text-xl text-[var(--t1)] mb-6">Status Terminal</h3>

              <div className="bg-[var(--s2)] border border-[var(--b2)] rounded-xl p-6 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,204,0,0.1)] to-transparent opacity-50" />
                <span className="font-mono text-4xl font-bold text-[var(--amber)] drop-shadow-[0_0_15px_rgba(255,204,0,0.4)] mb-1 relative z-10">
                  +{lesson.ecoPointsReward}
                </span>
                <span className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--t2)] flex items-center gap-1 relative z-10">
                  XP Yield <FaStar className="text-[var(--amber)]" />
                </span>
              </div>

              {completed ? (
                <div className="w-full bg-[rgba(0,255,136,0.1)] border border-[var(--g1)] rounded-xl p-4 flex items-center justify-center gap-3 text-[var(--g1)] shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                  <FaCheckCircle className="text-xl" />
                  <span className="font-ui font-bold text-sm uppercase tracking-widest">Protocol Verified</span>
                </div>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing}
                  className="btn-primary w-full shadow-[0_0_20px_rgba(108,71,255,0.3)] hover:scale-105 transition-all text-sm py-4 disabled:opacity-50 disabled:scale-100"
                >
                  {completing ? 'Verifying...' : 'Acknowledge & Complete'}
                </button>
              )}

              <AnimatePresence>
                {successMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-center text-[var(--g1)] font-ui text-xs font-bold uppercase tracking-wider">
                    {successMessage}
                  </motion.div>
                )}
                {error && !completed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-center text-[var(--red)] font-ui text-xs font-bold uppercase tracking-wider">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Global Stats */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="eco-card p-6">
              <h3 className="font-display text-xl text-[var(--t1)] mb-4 pb-2 border-b border-[var(--b1)]">Global Metrics</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-ui text-xs text-[var(--t3)] uppercase tracking-wider font-bold">Total Completions</span>
                  <span className="font-mono text-lg text-[var(--c1)] font-bold">{lesson.totalCompletions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-ui text-xs text-[var(--t3)] uppercase tracking-wider font-bold">Category</span>
                  <span className="font-ui text-sm text-[var(--t1)] capitalize">{lesson.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-ui text-xs text-[var(--t3)] uppercase tracking-wider font-bold">Rating</span>
                  <span className="font-ui text-sm text-[var(--t1)] capitalize">{lesson.difficulty}</span>
                </div>
              </div>
            </motion.div>

            {/* Author Info */}
            {lesson.createdBy && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="eco-card p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--s2)] border border-[var(--b2)] flex items-center justify-center text-2xl text-[var(--t2)] mb-3">
                  <FaUserAstronaut />
                </div>
                <h3 className="font-display text-lg text-[var(--t1)] mb-1">{lesson.createdBy.name}</h3>
                <p className="font-ui text-[10px] text-[var(--t3)] uppercase tracking-widest font-bold">{lesson.createdBy.role || 'Module Architect'}</p>
              </motion.div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default LessonDetail;
