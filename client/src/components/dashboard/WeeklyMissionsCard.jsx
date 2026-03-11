import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../../utils/api';

const WeeklyMissionsCard = () => {
  const { t } = useTranslation();
  const [missions, setMissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklyMissions();
  }, []);

  const fetchWeeklyMissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/missions/weekly/current');
      setMissions(res.data.data);
      setError(null);
    } catch (err) {
      console.warn('[WeeklyMissionsCard] Error fetching missions:', err);
      setError(err.message);
      setMissions(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = (expiresAt) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h remaining`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="eco-card p-6 md:p-8"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state: no missions available
  if (!missions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="eco-card p-6 md:p-8 text-center border-dashed"
      >
        <p className="text-4xl mb-3">🌱</p>
        <h3 className="text-lg font-bold text-[var(--t1)] mb-2">
          {t('missions.preparing') || 'Weekly Missions Being Prepared'}
        </h3>
        <p className="text-[var(--t2)] text-sm">
          {t('missions.preparingDesc') || 'Your personalized eco-missions will be ready on Monday!'}
        </p>
      </motion.div>
    );
  }

  const countdown = calculateCountdown(missions.expiresAt);
  const progressPercent = missions.completedCount ? (missions.completedCount / missions.missions.length) * 100 : 0;
  const allCompleted = missions.allCompleted || missions.completedCount === missions.missions.length;

  // Trigger confetti if all missions are just completed
  useEffect(() => {
    if (allCompleted && missions.completedCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [allCompleted, missions.completedCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="eco-card p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[var(--t1)] font-ui font-bold text-lg md:text-xl flex items-center gap-2">
            📋 {t('missions.thisWeek') || "This Week's Missions"}
          </h2>
          {countdown && (
            <p className="text-[var(--t2)] text-sm mt-1">{t('missions.resets') || 'Resets in'} {countdown}</p>
          )}
        </div>
        {
          allCompleted && missions.completedCount > 0 && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              ✅ {t('missions.complete') || 'Complete!'}
            </div>
          )
        }
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[var(--t2)] text-xs font-medium">
            {missions.completedCount}/{missions.missions.length} {t('missions.completed') || 'completed'}
          </span>
          <span className="text-[var(--t2)] text-xs font-medium">
            🪙 +{missions.totalReward || 0} {t('missions.points') || 'points'}
          </span>
        </div>
        <div className="h-2 bg-[var(--b1)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Mission Rows */}
      <div className="space-y-3">
        {missions.missions.map((mission, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              mission.completed
                ? 'bg-green-50 border-green-300'
                : 'bg-[var(--s2)] border-[var(--b2)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: Icon + Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{mission.icon}</span>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-sm md:text-base ${
                      mission.completed
                        ? 'text-green-700 line-through'
                        : 'text-[var(--t1)]'
                    }`}>
                      {mission.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--t2)] mt-1">
                      {mission.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Progress or Checkmark */}
              <div className="flex-shrink-0 text-right">
                {mission.completed ? (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl">✅</div>
                    <span className="text-xs font-semibold text-green-700 mt-1">+{mission.reward} pts</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-bold text-[var(--t1)]">
                      {mission.progress}/{mission.target}
                    </span>
                    <span className="text-xs text-[var(--t2)] mt-1">
                      {Math.round((mission.progress / mission.target) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inline Progress Bar (if not completed) */}
            {!mission.completed && mission.target > 1 && (
              <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--v1)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* All Completed CTA */}
      {allCompleted && missions.completedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 rounded-lg text-center"
        >
          <p className="text-green-800 font-bold text-sm md:text-base">
            🎉 {t('missions.allDone') || 'All missions completed this week!'} {missions.totalReward || 0} bonus points earned!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WeeklyMissionsCard;
