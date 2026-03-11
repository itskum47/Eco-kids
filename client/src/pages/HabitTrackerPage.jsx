import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { habitsAPI } from '../utils/api';
import Navbar from '../components/layout/Navbar';
import confetti from 'canvas-confetti';

const HABITS = [
  {
    category: 'energy-saving',
    title: 'Energy Saver',
    description: 'Turn off unused lights or devices today.',
    icon: '⚡',
    colorVar: 'var(--amber)',
    gradient: 'from-[rgba(255,204,0,0.2)] to-[rgba(255,204,0,0.05)]',
    tag: 'Lights Off'
  },
  {
    category: 'water-saving',
    title: 'Water Guardian',
    description: 'Keep showers short or reuse water where safe.',
    icon: '💧',
    colorVar: 'var(--c1)',
    gradient: 'from-[rgba(0,229,255,0.2)] to-[rgba(0,229,255,0.05)]',
    tag: 'Save Water'
  },
  {
    category: 'waste-recycling',
    title: 'Waste Wizard',
    description: 'Sort or recycle at least one item today.',
    icon: '♻️',
    colorVar: 'var(--g1)',
    gradient: 'from-[rgba(0,255,136,0.2)] to-[rgba(0,255,136,0.05)]',
    tag: 'Recycle'
  },
  {
    category: 'sustainable-transport',
    title: 'Clean Commute',
    description: 'Walk, cycle, or use shared transport.',
    icon: '🚲',
    colorVar: 'var(--v2)',
    gradient: 'from-[rgba(155,122,255,0.2)] to-[rgba(155,122,255,0.05)]',
    tag: 'Low Carbon'
  },
  {
    category: 'eco-friendly-food',
    title: 'Eco Plate',
    description: 'Choose a planet-friendly meal.',
    icon: '🥗',
    colorVar: 'var(--p2)',
    gradient: 'from-[rgba(255,125,209,0.2)] to-[rgba(255,125,209,0.05)]',
    tag: 'Smart Food'
  },
  {
    category: 'plastic-reduction',
    title: 'Plastic Free',
    description: 'Skip single-use plastic today.',
    icon: '🥤',
    colorVar: 'var(--red)',
    gradient: 'from-[rgba(255,64,96,0.2)] to-[rgba(255,64,96,0.05)]',
    tag: 'No Plastic'
  }
];

const startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

const HabitTrackerPage = () => {
  const [dailyHabits, setDailyHabits] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const todayRecord = useMemo(() => {
    return dailyHabits.find(habit => startOfDay(habit.date).getTime() === today.getTime());
  }, [dailyHabits, today]);

  const loggedCategories = useMemo(() => {
    return new Set((todayRecord?.habits || []).map(habit => habit.category));
  }, [todayRecord]);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const [habitsResponse, streakResponse] = await Promise.all([
        habitsAPI.getMyHabits(),
        habitsAPI.getMyStreak()
      ]);
      setDailyHabits(habitsResponse.data || []);
      setStreak(streakResponse.data || { current: 0, longest: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleLogHabit = async (category, e) => {
    if (isSubmitting || loggedCategories.has(category)) {
      return;
    }

    setIsSubmitting(true);
    // Fire confetti from button location
    if (e && e.clientX) {
      const rect = e.target.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#00ff88', '#00e5ff', '#6c47ff']
      });
    }

    try {
      await habitsAPI.logHabit({ category });
      await loadHabits();
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestHistory = dailyHabits.slice(0, 7);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10 overflow-x-hidden relative">
      <Navbar />

      <main className="max-w-[1020px] mx-auto px-4 sm:px-6 py-6 md:py-10 relative z-10">

        {/* Header Title */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(108,71,255,0.1)] border border-[rgba(108,71,255,0.3)] mb-4"
          >
            <span className="text-sm">🌱</span>
            <span className="font-ui font-bold text-[10px] uppercase tracking-widest text-[var(--v2)]">Daily Tracker</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-[56px] font-normal leading-none mb-4 text-[var(--t1)]"
          >
            Eco Habits
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-ui text-sm md:text-base text-[var(--t2)] max-w-[500px] mx-auto"
          >
            Log one small habit each day to build your streak and power your impact engine.
          </motion.p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 md:mb-12">
          {/* Today Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--s1)] border border-[var(--b1)] rounded-2xl p-4 md:p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <p className="font-ui font-bold text-[9px] md:text-[11px] uppercase tracking-widest text-[var(--t3)] mb-2">Today</p>
            <h3 className="font-mono text-3xl md:text-5xl font-bold text-[var(--g1)] drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              {todayRecord ? todayRecord.habits.length : 0}
            </h3>
            <p className="font-ui text-[10px] md:text-xs text-[var(--t2)] mt-1 hidden md:block">Habits Logged</p>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--s1)] border border-[var(--v1)] rounded-2xl p-4 md:p-6 text-center shadow-[0_0_30px_rgba(108,71,255,0.15)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(108,71,255,0.1)] to-transparent opacity-50 pointer-events-none" />
            <p className="font-ui font-bold text-[9px] md:text-[11px] uppercase tracking-widest text-[var(--v2)] mb-2 relative z-10">Streak</p>
            <div className="flex items-center justify-center gap-1 md:gap-2 relative z-10">
              <span className={`text-2xl md:text-4xl ${streak.current > 0 ? 'text-[#ff9500] animate-[flicker_3s_infinite]' : 'text-[var(--t3)]'} origin-bottom`}>🔥</span>
              <h3 className="font-mono text-3xl md:text-5xl font-bold text-[var(--t1)]">
                {streak.current}
              </h3>
            </div>
            <p className="font-ui text-[10px] md:text-xs text-[var(--t2)] mt-1 hidden md:block">Days in a row</p>
          </motion.div>

          {/* Longest Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--s1)] border border-[var(--b1)] rounded-2xl p-4 md:p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <p className="font-ui font-bold text-[9px] md:text-[11px] uppercase tracking-widest text-[var(--t3)] mb-2">Best</p>
            <h3 className="font-mono text-3xl md:text-5xl font-bold text-[var(--c1)]">
              {streak.longest}
            </h3>
            <p className="font-ui text-[10px] md:text-xs text-[var(--t2)] mt-1 hidden md:block">All-time record</p>
          </motion.div>
        </div>

        {/* Habit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {HABITS.map((habit, index) => {
            const isLogged = loggedCategories.has(habit.category);

            return (
              <motion.div
                key={habit.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className={`eco-card overflow-hidden p-5 flex flex-col justify-between group transition-all duration-300 relative ${isLogged ? 'opacity-60 border-[var(--b1)] grayscale-[0.3]' : 'hover:-translate-y-1 hover:border-[var(--v1)] cursor-pointer'
                  }`}
                onClick={(e) => {
                  // Only click card body on desktop to avoid weird mobile tapping
                  if (!isLogged && window.innerWidth > 768) handleLogHabit(habit.category, e);
                }}
              >
                {/* Background ambient glow */}
                {!isLogged && (
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] bg-gradient-to-br ${habit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                )}

                <div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[var(--s2)] border border-[var(--b2)]"
                      style={{ boxShadow: !isLogged ? `0 0 15px ${habit.colorVar}40` : 'none' }}
                    >
                      {habit.icon}
                    </span>
                    <span
                      className="font-ui font-bold text-[10px] uppercase tracking-wide px-2 py-1 rounded"
                      style={{
                        color: isLogged ? 'var(--g1)' : habit.colorVar,
                        backgroundColor: isLogged ? 'rgba(0,255,136,0.1)' : `${habit.colorVar}15`
                      }}
                    >
                      {isLogged ? '✓ Logged' : habit.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-[var(--t1)] mb-2 relative z-10">{habit.title}</h3>
                  <p className="font-ui text-xs text-[var(--t2)] line-clamp-2 relative z-10">{habit.description}</p>
                </div>

                <div className="mt-6 relative z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent double firing if card is clicked
                      handleLogHabit(habit.category, e);
                    }}
                    disabled={isLogged || isSubmitting}
                    className={`w-full py-2.5 rounded-xl font-ui font-bold text-xs uppercase tracking-widest transition-all duration-300 ${isLogged
                        ? 'bg-[rgba(0,255,136,0.1)] text-[var(--g1)] border border-[rgba(0,255,136,0.2)]'
                        : 'bg-[var(--s2)] text-[var(--t1)] border border-[var(--b2)] group-hover:bg-[var(--v1)] group-hover:border-[var(--v1)] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(108,71,255,0.4)]'
                      }`}
                  >
                    {isLogged ? 'Completed' : 'Log Habit'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* History Section */}
        <div className="eco-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-[var(--t1)] mb-1">Recent History</h2>
              <p className="font-ui text-xs text-[var(--t2)]">Last 7 days of activity</p>
            </div>
            <p className="font-mono text-xs text-[var(--v2)] mt-2 md:mt-0 font-bold bg-[rgba(108,71,255,0.1)] px-3 py-1 rounded-full inline-block self-start border border-[rgba(108,71,255,0.2)]">
              {isLoading ? '...' : `${dailyHabits.length} Records`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-2 border-[var(--s2)] border-t-[var(--v1)] rounded-full animate-spin" />
            </div>
          ) : latestHistory.length === 0 ? (
            <div className="text-center py-12 bg-[var(--s1)] rounded-2xl border border-dashed border-[var(--b2)]">
              <span className="text-4xl opacity-50 mb-3 block">📝</span>
              <p className="font-ui text-sm text-[var(--t2)] max-w-[250px] mx-auto">
                No habits logged yet. Click a habit above to start your streak!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {latestHistory.map(record => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[var(--s2)] border border-[var(--b2)] rounded-xl p-4 flex flex-col justify-center"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-[var(--b1)] pb-2 flex-wrap gap-2">
                    <span className="font-mono font-bold text-[13px] text-[var(--t1)]">{formatDate(record.date)}</span>
                    <span className="font-ui font-bold text-[10px] text-[var(--t3)] uppercase tracking-wider bg-[var(--s1)] px-2 py-0.5 rounded border border-[var(--b1)]">
                      {record.habits.length} Hit{record.habits.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {record.habits.map(habit => (
                      <span
                        key={habit._id}
                        className="rounded bg-[var(--s1)] border border-[var(--b1)] px-2 py-1 font-ui font-bold text-[9px] uppercase tracking-wider text-[var(--t2)] whitespace-nowrap"
                      >
                        {habit.category.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Required CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes flicker {
          0%, 100% { transform: rotate(-2deg); filter: hue-rotate(0deg) brightness(1); }
          50% { transform: rotate(3deg); filter: hue-rotate(15deg) brightness(1.2); }
        }
      `}} />
    </div>
  );
};

export default HabitTrackerPage;
