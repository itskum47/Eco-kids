import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaLeaf, FaWater, FaSun, FaRecycle, FaGlobeAmericas, FaSmog, FaCheckCircle, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import SDGBadge from '../components/SDGBadge';

// Mapping lesson categories to SDG goals
const CATEGORY_SDG_MAP = {
  climate: [13],
  waste: [12],
  water: [6],
  biodiversity: [15],
  energy: [7],
  pollution: [12, 13],
  default: [17]
};

// Mapping categories to specific icons and colors
const CATEGORY_CONFIG = {
  climate: { icon: <FaGlobeAmericas />, colorVar: 'var(--c1)', bgGradient: 'from-[rgba(0,229,255,0.2)] to-transparent', label: 'Climate' },
  waste: { icon: <FaRecycle />, colorVar: 'var(--amber)', bgGradient: 'from-[rgba(255,204,0,0.2)] to-transparent', label: 'Waste' },
  water: { icon: <FaWater />, colorVar: 'var(--Secondary-Blue, #3b82f6)', bgGradient: 'from-[rgba(59,130,246,0.2)] to-transparent', label: 'Water' },
  biodiversity: { icon: <FaLeaf />, colorVar: 'var(--g1)', bgGradient: 'from-[rgba(0,255,136,0.2)] to-transparent', label: 'Biodiversity' },
  energy: { icon: <FaSun />, colorVar: 'var(--p1)', bgGradient: 'from-[rgba(255,71,184,0.2)] to-transparent', label: 'Energy' },
  pollution: { icon: <FaSmog />, colorVar: 'var(--v2)', bgGradient: 'from-[rgba(155,122,255,0.2)] to-transparent', label: 'Pollution' },
  default: { icon: <FaBookOpen />, colorVar: 'var(--t2)', bgGradient: 'from-[rgba(138,128,184,0.2)] to-transparent', label: 'General' }
};

const EnvironmentalLessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(9);
  const navigate = useNavigate();

  const difficulties = ['easy', 'medium', 'hard'];

  useEffect(() => {
    fetchLessons();
  }, [selectedCategory, selectedDifficulty, page]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/environmental-lessons?page=${page}&limit=${limit}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;

      const response = await axios.get(url);
      setLessons(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to download module data. Please reconnect to network.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10 overflow-x-hidden relative">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">

        {/* Header Title */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] mb-4"
          >
            <span className="text-sm text-[var(--g1)]"><FaBookOpen /></span>
            <span className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--g1)]">Training Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-[56px] font-normal leading-none mb-4 text-[var(--t1)]"
          >
            Eco Lessons
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-ui text-sm md:text-base text-[var(--t2)] max-w-[600px] mx-auto"
          >
            Complete training modules to level up your environmental awareness and earn powerful XP multipliers.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar / HUD Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="eco-card p-6 sticky top-24">
              <h3 className="font-display text-xl text-[var(--t1)] mb-6 border-b border-[var(--b1)] pb-3">
                Mission Filters
              </h3>

              <div className="mb-8">
                <p className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--t3)] mb-4">Select Category</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`text-left px-4 py-3 rounded-xl font-ui text-sm transition-all flex items-center gap-3 ${selectedCategory === '' ? 'bg-[rgba(108,71,255,0.1)] border border-[var(--v1)] text-[var(--t1)] shadow-[0_0_15px_rgba(108,71,255,0.2)]' : 'bg-[var(--s1)] border border-[var(--b1)] text-[var(--t2)] hover:border-[var(--v2)]'}`}
                  >
                    <span>🌐</span> All Categories
                  </button>
                  {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== 'default').map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedCategory(selectedCategory === key ? '' : key); setPage(1); }}
                      className={`text-left px-4 py-3 rounded-xl font-ui text-sm transition-all flex items-center justify-between group ${selectedCategory === key ? `bg-[var(--s2)] border text-[var(--t1)]` : 'bg-[var(--s1)] border border-[var(--b1)] text-[var(--t2)] hover:bg-[var(--s2)]'}`}
                      style={{ borderColor: selectedCategory === key ? config.colorVar : '' }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color: config.colorVar }}>{config.icon}</span>
                        <span className="capitalize">{config.label}</span>
                      </div>
                      {selectedCategory === key && <FaCheckCircle style={{ color: config.colorVar }} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--t3)] mb-4">Difficulty Level</p>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => { setSelectedDifficulty(selectedDifficulty === diff ? '' : diff); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg font-ui font-bold text-[10px] uppercase tracking-widest border transition-colors ${selectedDifficulty === diff ? 'bg-[var(--v1)] border-[var(--v1)] text-white shadow-[0_0_10px_rgba(108,71,255,0.4)]' : 'bg-[var(--s1)] border-[var(--b2)] text-[var(--t2)] hover:border-[var(--v2)]'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.3)] p-4 rounded-xl text-[var(--red)] text-sm font-ui flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="w-12 h-12 border-4 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="eco-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <span className="text-6xl mb-4 opacity-30">📭</span>
                <h3 className="font-display text-2xl text-[var(--t1)] mb-2">No Modules Found</h3>
                <p className="font-ui text-[var(--t2)] text-sm max-w-[300px]">Adjust your dashboard filters to locate active training protocols.</p>
                {(selectedCategory || selectedDifficulty) && (
                  <button onClick={() => { setSelectedCategory(''); setSelectedDifficulty(''); setPage(1); }} className="mt-6 btn-ghost px-6 py-2">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {lessons.map((lesson, idx) => {
                    const config = CATEGORY_CONFIG[lesson.category.toLowerCase()] || CATEGORY_CONFIG.default;

                    return (
                      <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="eco-card group flex flex-col overflow-hidden relative"
                      >
                        {/* Ambient glow from category color */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-300`} style={{ backgroundColor: config.colorVar, transform: 'translate(30%, -30%)' }} />

                        <div className="p-6 flex-1 flex flex-col relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/5 bg-[var(--s1)]" style={{ color: config.colorVar }}>
                              {config.icon}
                            </div>

                            <span className="px-2.5 py-1 text-[9px] font-ui font-bold uppercase tracking-widest rounded border bg-[var(--s2)]" style={{ borderColor: `color-mix(in srgb, ${config.colorVar} 30%, transparent)`, color: config.colorVar }}>
                              {lesson.difficulty}
                            </span>
                          </div>

                          {/* SDG Goals Badge */}
                          <div className="flex gap-1 mb-4 flex-wrap">
                            {(CATEGORY_SDG_MAP[lesson.category?.toLowerCase()] || CATEGORY_SDG_MAP.default).map(goalNum => (
                              <SDGBadge key={goalNum} goalNumber={goalNum} size="sm" />
                            ))}
                          </div>

                          <h3 className="font-display text-xl text-[var(--t1)] mb-2 group-hover:text-white transition-colors line-clamp-2">
                            {lesson.title}
                          </h3>

                          <p className="font-ui text-xs text-[var(--t2)] leading-relaxed line-clamp-3 flex-1 mb-6">
                            {lesson.description}
                          </p>

                          <div className="flex items-center justify-between mt-auto mb-4 bg-[var(--s2)] p-3 rounded-lg border border-[var(--b2)]">
                            <div className="flex flex-col">
                              <span className="font-ui font-bold text-[9px] uppercase tracking-widest text-[var(--t3)] mb-0.5">Reward</span>
                              <span className="font-mono text-sm font-bold text-[var(--amber)]">+{lesson.ecoPointsReward} XP</span>
                            </div>
                            <div className="w-[1px] h-8 bg-[var(--b1)]" />
                            <div className="flex flex-col">
                              <span className="font-ui font-bold text-[9px] uppercase tracking-widest text-[var(--t3)] mb-0.5">Completions</span>
                              <span className="font-mono text-sm font-bold text-[var(--c1)]">{lesson.totalCompletions || 0}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/environmental-lessons/${lesson._id}`)}
                            className="w-full py-2.5 rounded-xl font-ui font-bold text-xs uppercase tracking-widest transition-all duration-300 bg-[var(--s1)] border border-[var(--b2)] text-[var(--t1)] group-hover:border-transparent group-hover:text-[#05050a]"
                            style={{ '--hover-bg': config.colorVar }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = config.colorVar}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                          >
                            Access Data
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination HUD */}
            {totalPages > 1 && !loading && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--s2)] border border-[var(--b2)] text-[var(--t2)] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[var(--v1)] hover:border-[var(--v1)] transition-colors"
                >
                  <FaChevronLeft />
                </button>

                <div className="font-ui font-bold text-xs uppercase tracking-widest text-[var(--t2)] bg-[var(--s1)] px-4 py-2 rounded-full border border-[var(--b1)]">
                  Sector <span className="text-[var(--t1)]">{page}</span> / {totalPages}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--s2)] border border-[var(--b2)] text-[var(--t2)] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[var(--v1)] hover:border-[var(--v1)] transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
};

export default EnvironmentalLessonsPage;
