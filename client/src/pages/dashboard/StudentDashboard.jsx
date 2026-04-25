import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Navbar from '../../components/layout/Navbar';
import SeasonalEventBanner from '../../components/SeasonalEventBanner';
import api from '../../utils/api';
import socket from '../../services/socket';
import SubmissionCelebration from '../../components/SubmissionCelebration';

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
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [schoolComparison, setSchoolComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reward, setReward] = useState(null); // triggered by socket points-earned

  // 🎉 Listen for AI-approval socket event while student is on dashboard
  useEffect(() => {
    const handlePointsEarned = (data) => {
      const pts = data.points || data.pointsAwarded || 50;
      const label = data.activityType?.replace(/-/g, ' ') || 'Eco Activity';
      // verified=true because socket only fires AFTER AI worker confirms
      setReward({ points: pts, activityLabel: label, verified: true });
      // Refresh gamification bar silently
      api.get('/v1/gamification/me')
        .then(res => setGamification(res.data.data))
        .catch(() => {});
    };
    socket.on('points-earned', handlePointsEarned);
    return () => socket.off('points-earned', handlePointsEarned);
  }, []);

  const ecoPoints = gamification?.ecoPoints ?? user?.gamification?.ecoPoints ?? 0;
  const level = gamification?.level ?? user?.gamification?.level ?? 1;
  const badges = gamification?.badges ?? user?.gamification?.badges ?? [];
  const streak =
    gamification?.streak?.current ??
    gamification?.streak ??
    user?.gamification?.streak?.current ??
    user?.gamification?.streak ??
    0;

  // Calculate next level XP using a simple linear progression when server value is unavailable.
  const nextLevelPoints = gamification?.nextLevelPoints ?? (level * 100);

  const treesPlanted = user?.environmentalImpact?.treesPlanted ?? 0;
  const waterSaved = Math.round(user?.environmentalImpact?.waterSaved ?? 0);
  const co2Prevented = Math.round(user?.environmentalImpact?.co2Prevented ?? 0);
  const activeMission = assignments.find((assignment) => assignment.status !== 'Submitted') || null;
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
        setAssignmentsError(null);
        const res = await api.get('/v1/student/assignments');
        setAssignments(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch assignments', err);
        setAssignmentsError('Unable to load missions right now.');
      } finally {
        setAssignmentsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ecokids_onboarding_complete') !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      const schoolId = user?.profile?.schoolId || user?.schoolId;
      if (!schoolId) return;

      try {
        const [schoolRes, rankRes] = await Promise.all([
          api.get(`/v1/leaderboards/school/${schoolId}`),
          api.get('/v1/leaderboards/my-rank')
        ]);

        const leaderboard = schoolRes?.data?.leaderboard || [];
        if (leaderboard.length === 0) return;

        const points = leaderboard
          .map((entry) => Number(entry.ecoPoints || 0))
          .sort((a, b) => a - b);

        const median = points[Math.floor(points.length / 2)] || 0;
        const q3 = points[Math.floor(points.length * 0.75)] || 0;

        setSchoolComparison({
          schoolMedian: median,
          topQuartile: q3,
          schoolRank: rankRes?.data?.schoolRank || null,
          userPoints: rankRes?.data?.ecoPoints || ecoPoints,
        });
      } catch {
        // Non-blocking comparison card; ignore fetch failures.
      }
    };

    fetchComparison();
  }, [user?.profile?.schoolId, user?.schoolId, ecoPoints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col pt-16" style={lightPageVars}>
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



  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-10" style={lightPageVars}>
      {/* AI-approval celebration overlay */}
      <AnimatePresence>
        {reward && (
          <SubmissionCelebration
            points={reward.points}
            activityLabel={reward.activityLabel}
            verified={reward.verified ?? false}
            onDone={() => setReward(null)}
          />
        )}
      </AnimatePresence>

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

            {streak > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="eco-card p-4 border-l-4 border-amber-400 bg-amber-50"
              >
                <p className="text-sm text-amber-900 font-semibold">🔥 Streak Protection</p>
                <p className="text-sm text-amber-800">You are on a {streak}-day streak. Log one verified action today to avoid losing momentum.</p>
              </motion.div>
            )}

            {schoolComparison && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="eco-card p-5"
              >
                <h3 className="text-[var(--t1)] font-ui font-bold text-base mb-3">Class Comparison Snapshot</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[var(--b2)] bg-[var(--s2)] p-3">
                    <p className="text-xs text-[var(--t2)] uppercase tracking-wider">Your Points</p>
                    <p className="font-mono text-xl text-[var(--t1)]">{schoolComparison.userPoints}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--b2)] bg-[var(--s2)] p-3">
                    <p className="text-xs text-[var(--t2)] uppercase tracking-wider">School Median</p>
                    <p className="font-mono text-xl text-[var(--t1)]">{schoolComparison.schoolMedian}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--b2)] bg-[var(--s2)] p-3">
                    <p className="text-xs text-[var(--t2)] uppercase tracking-wider">Top Quartile</p>
                    <p className="font-mono text-xl text-[var(--t1)]">{schoolComparison.topQuartile}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--t2)] mt-3">
                  {schoolComparison.schoolRank ? `Current school rank: #${schoolComparison.schoolRank}. ` : ''}
                  Return trigger: one verified action can move your relative position this week.
                </p>
              </motion.div>
            )}

            {/* Active Mission Card */}
            <ActiveMissionCard mission={activeMission} loading={assignmentsLoading} error={assignmentsError} />

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

              {assignmentsLoading ? (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="h-16 rounded-lg bg-gray-100 animate-pulse" />
                </div>
              ) : assignmentsError ? (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{assignmentsError}</p>
              ) : assignments.length === 0 ? (
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
                  <Link to="/leaderboards" className="btn-ghost w-full">
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
