import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Navbar from '../../components/layout/Navbar';
import SeasonalEventBanner from '../../components/SeasonalEventBanner';
import api from '../../utils/api';

// Components
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';
import StreakFlame from '../../components/dashboard/StreakFlame';
import LevelRing from '../../components/dashboard/LevelRing';
import ActiveMissionCard from '../../components/dashboard/ActiveMissionCard';
import WeeklyMissionsCard from '../../components/dashboard/WeeklyMissionsCard';
import BadgeRow from '../../components/dashboard/BadgeRow';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import SkeletonCard from '../../components/SkeletonCard';
import Onboarding from '../../components/Onboarding';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [gamification, setGamification] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const res = await api.get('/v1/gamification/me');
        setGamification(res.data.data);
      } catch (err) {
        console.error('Failed to fetch gamification profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/v1/student/assignments');
        setAssignments(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch assignments', err);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ecokids_onboarding_complete') !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col pt-16">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center w-full max-w-[1020px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
              <div className="md:col-span-8 flex flex-col gap-8">
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="md:col-span-4 flex flex-col gap-8">
                <SkeletonCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ecoPoints = gamification?.ecoPoints ?? user?.gamification?.ecoPoints ?? 0;
  const level = gamification?.level ?? user?.gamification?.level ?? 1;
  const badges = gamification?.badges ?? user?.gamification?.badges ?? [];
  const streak =
    gamification?.streak?.current ??
    gamification?.streak ??
    user?.gamification?.streak?.current ??
    user?.gamification?.streak ??
    0;

  // Calculate next level XP (mock formula for now: level * 100)
  const nextLevelPoints = gamification?.nextLevelPoints ?? (level * 100);

  // Mock metrics
  const treesPlanted = 12;
  const waterSaved = 450;
  const co2Prevented = 85;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10">
      <Navbar />
      <SeasonalEventBanner />
      <Onboarding isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

      <main className="max-w-[1020px] mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-[var(--t1)] font-ui font-bold text-xl md:text-2xl">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <div className="inline-flex items-center gap-2 bg-[var(--s2)] border border-[var(--b2)] rounded-full px-4 py-2">
            <span className="text-lg" role="img" aria-label="streak flame">🔥</span>
            <span className="font-mono text-[var(--t1)] font-semibold">{streak}</span>
            <span className="text-[var(--t2)] text-sm font-medium">day streak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

          {/* LEFT COLUMN (70% width on desktop) */}
          <div className="md:col-span-8 flex flex-col gap-6 md:gap-8">

            {/* Hero Points Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="eco-card overflow-visible p-8 md:p-12 text-center"
              style={{
                background: 'linear-gradient(180deg, var(--s2) 0%, var(--s1) 100%)',
                borderColor: 'var(--v1)',
                boxShadow: 'var(--shadow-glow-v), inset 0 0 40px rgba(108,71,255,0.1)'
              }}
            >
              <h2 className="text-[var(--t2)] font-ui font-bold text-sm tracking-widest uppercase mb-2">Your Eco-Points</h2>
              <AnimatedCounter value={ecoPoints} className="font-mono text-6xl md:text-[80px] font-semibold text-[var(--amber)] leading-none mb-8 drop-shadow-[0_0_40px_rgba(255,204,0,0.5)]" />

              {/* Stat Pills Row */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6">
                <div className="bg-[var(--s2)] border border-[var(--b2)] rounded-full px-4 py-2 flex items-center gap-2">
                  <span>🌱</span>
                  <AnimatedCounter value={treesPlanted} className="font-mono text-[var(--t1)] font-medium" />
                  <span className="text-[var(--t2)] text-sm">Trees</span>
                </div>
                <div className="bg-[var(--s2)] border border-[var(--b2)] rounded-full px-4 py-2 flex items-center gap-2">
                  <span>💧</span>
                  <AnimatedCounter value={waterSaved} className="font-mono text-[var(--t1)] font-medium" />
                  <span className="text-[var(--t2)] text-sm">L Water</span>
                </div>
                <div className="bg-[var(--s2)] border border-[var(--b2)] rounded-full px-4 py-2 flex items-center gap-2">
                  <span>♻️</span>
                  <AnimatedCounter value={co2Prevented} className="font-mono text-[var(--t1)] font-medium" />
                  <span className="text-[var(--t2)] text-sm">kg CO₂</span>
                </div>
              </div>
            </motion.div>

            {/* Streak Section */}
            <StreakFlame streak={streak} />

            {/* Active Mission Card */}
            <ActiveMissionCard />

            {/* Weekly Missions Card */}
            <WeeklyMissionsCard />

            {/* Recent Badges Row */}
            <BadgeRow badges={badges} />

            {/* My Assignments */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="eco-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[var(--t1)] font-ui font-bold text-lg">My Assignments</h2>
              </div>

              {assignments.length === 0 ? (
                <p className="text-sm text-[var(--t2)]">No assignments yet.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="border border-[var(--b1)] rounded-lg p-4 bg-[var(--s2)]">
                      <p className="text-[var(--t1)] font-semibold">{assignment.title}</p>
                      <p className="text-sm text-[var(--t2)] mt-1">
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${assignment.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Activity Feed (below fold) */}
            <ActivityFeed />

          </div>

          {/* RIGHT COLUMN (30% width on desktop) */}
          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">

            {/* Level Progress Arc */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="eco-card p-6 flex flex-col items-center text-center sticky top-24"
            >
              <h2 className="text-[var(--t1)] font-ui font-bold text-lg mb-6">Current Level</h2>

              <LevelRing
                level={level}
                currentXP={ecoPoints}
                nextLevelXP={nextLevelPoints}
                levelName={
                  level >= 7 ? 'Eco Champion' :
                    level >= 5 ? 'Planet Protector' :
                      level >= 3 ? 'Green Guardian' :
                        'Eco Explorer'
                }
              />

              <div className="mt-8 w-full border-t border-[var(--b1)] pt-6">
                <h3 className="text-[var(--t2)] font-ui font-bold text-xs tracking-wider uppercase mb-4 text-left">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <Link to="/submit-activity" className="btn-primary w-full shadow-[0_0_20px_rgba(108,71,255,0.2)] hover:shadow-[0_0_30px_rgba(108,71,255,0.4)]">
                    📸 Log Activity
                  </Link>
                  <Link to="/dashboard/trees" className="btn-primary w-full shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    🌱 Trees NEW
                  </Link>
                  <Link to="/leaderboard" className="btn-ghost w-full">
                    🏆 View Leaderboard
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
