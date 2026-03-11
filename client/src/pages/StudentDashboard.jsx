import React from "react";
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";

import StreakCard from "../features/profile/StreakCard";
import OnboardingQuestBanner from "../features/profile/OnboardingQuestBanner";
import PointsCounter from "../features/profile/PointsCounter";
import ActivityFeed from "../features/feed/ActivityFeed";
import LeaderboardPreview from "../features/leaderboard/LeaderboardPreview";
import SkeletonCard from "../components/SkeletonCard";
import useRealtimePoints from "../hooks/useRealtimePoints";
import PointsToast from "../components/PointsToast";
import RollbackToast from "../components/RollbackToast";
import LevelUpOverlay from "../components/LevelUpOverlay";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
    const { data: userData, isLoading } = useUser();
    const { toastData, rollbackToast } = useRealtimePoints();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    // Assuming API payload structure returns { success: true, user: { ... } }
    // Adjust based on your actual /api/auth/me response pattern
    const user = userData?.user || userData?.data || userData;

    if (!user) return null;

    const currentLevel = user?.gamification?.level || 1;
    const currentPoints = user?.gamification?.ecoPoints || 0;
    const nextLevelPoints = currentLevel * 500; // Formula for next level
    const pointsToNextLevel = Math.max(0, nextLevelPoints - currentPoints);

    // 1. Streak Protection Psychology
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursLeft = (midnight - now) / (1000 * 60 * 60);

    const lastActivityStr = user?.gamification?.lastActivityDate;
    const lastActivityDate = lastActivityStr ? new Date(lastActivityStr) : null;
    const submittedToday = lastActivityDate && lastActivityDate.toDateString() === now.toDateString();

    const currentStreak = user?.gamification?.streak?.current || 0;
    const showStreakWarning = currentStreak > 0 && hoursLeft < 12 && !submittedToday;

    // 2. Collective Goal (School Progress Placeholder)
    const schoolSavedCO2 = 1240 + (submittedToday ? 2 : 0); // Simulated dynamic

    // 3. Optional Micro-Commitment State
    const [inspirationText, setInspirationText] = React.useState("");
    const [inspirationSent, setInspirationSent] = React.useState(false);

    // 4. Level Up Celebration State
    const [leveledUpLevel, setLeveledUpLevel] = React.useState(null);
    const prevLevelRef = React.useRef(currentLevel);

    React.useEffect(() => {
        if (currentLevel > prevLevelRef.current) {
            setLeveledUpLevel(currentLevel);
        }
        prevLevelRef.current = currentLevel;
    }, [currentLevel]);

    const isLevelingUp = leveledUpLevel !== null;

    // --- Gating Logic: Only ONE high-intensity trigger per session ---
    // Rule 1: Level-Up suppresses Streak Warning
    // Rule 2: Streak Warning suppresses Micro-Commitment
    const showStreakWarningGate = currentStreak > 0 && hoursLeft < 12 && !submittedToday;
    const finalShowStreakWarning = !isLevelingUp && showStreakWarningGate;
    const finalShowMicroCommitment = submittedToday && !inspirationSent && !finalShowStreakWarning && !isLevelingUp;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 px-4 pt-4 pb-20 max-w-2xl mx-auto font-sans"
        >
            <PointsToast data={toastData} />
            <RollbackToast isVisible={rollbackToast} />
            {isLevelingUp && <LevelUpOverlay level={leveledUpLevel} onComplete={() => setLeveledUpLevel(null)} />}

            {/* HEADER: Profile, Streak, Points Anchor */}
            <div className="flex justify-between items-center bg-[var(--s1)] p-5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 m-0 tracking-tight">Hello, {user?.name?.split(' ')[0] || 'EcoWarrior'}!</h2>
                    <p className="m-0 text-slate-500 text-sm font-medium mt-1">Level {currentLevel}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <StreakCard streak={user?.gamification?.streak?.current || 0} />
                </div>
            </div>

            {/* BEHAVIORAL LAYER 1: Streak Protection (Loss Aversion) */}
            {finalShowStreakWarning && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 border-l-4 border-red-500 py-3 px-4 rounded-xl flex items-center gap-3 overflow-hidden shadow-sm"
                >
                    <span className="text-2xl">🔥</span>
                    <div>
                        <p className="m-0 text-red-800 font-bold text-sm">
                            You will lose your {currentStreak}-day streak in {Math.floor(hoursLeft)} hours.
                        </p>
                        <p className="m-0 text-red-700 text-xs mt-1">Submit an activity now to keep it alive!</p>
                    </div>
                </motion.div>
            )}

            {/* HERO SECTION: Dynamic Dopamine Anchor + Eco Power combined */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white text-center shadow-sm border border-emerald-600">
                <div className="flex justify-between items-center mb-6 text-left">
                    <div>
                        <span className="text-emerald-100 font-bold uppercase tracking-wider text-xs">Your Eco-Power ⚡</span>
                        <motion.h2
                            key={currentPoints}
                            initial={{ scale: 0.8, color: "#34d399" }}
                            animate={{ scale: 1, color: "white" }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="text-4xl font-black mt-1 m-0 tabular-nums"
                        >
                            {currentPoints}
                        </motion.h2>
                    </div>
                    <div className="text-right">
                        <span className="text-emerald-100 font-bold uppercase tracking-wider text-xs">Impact Acts</span>
                        <h3 className="m-0 mt-1 text-2xl font-bold tabular-nums">
                            {user?.environmentalImpact?.activitiesCompleted || 0}
                        </h3>
                    </div>
                </div>

                <div className="bg-emerald-800/30 rounded-xl p-4 backdrop-blur-sm border border-emerald-400/20">
                    <h3 className="m-0 mb-2 text-sm font-bold text-emerald-50">
                        Next Milestone 🎯
                    </h3>
                    <p className="m-0 mb-4 text-xl font-black">
                        Only {pointsToNextLevel} to Level {currentLevel + 1}
                    </p>
                    <div className="bg-emerald-900/40 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (currentPoints / nextLevelPoints) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-[var(--s1)] h-full rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* PRIMARY ACTION: High Visibility Submit CTA */}
            <Link to="/submit-activity" className="block outline-none no-underline">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[var(--s1)] border-2 border-dashed border-emerald-500 rounded-xl p-5 flex items-center justify-center gap-4 shadow-sm cursor-pointer transition-transform"
                >
                    <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-emerald-200">
                        📸
                    </div>
                    <div>
                        <h3 className="m-0 text-emerald-600 text-lg font-bold tracking-tight">Log My Action 🌍</h3>
                        <p className="m-0 text-slate-500 text-sm font-medium mt-0.5">Earn points right now</p>
                    </div>
                </motion.div>
            </Link>

            {/* BEHAVIORAL LAYER 2: Micro-Commitment (Post-Submission) */}
            {finalShowMicroCommitment && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                >
                    <div>
                        <h4 className="m-0 text-slate-800 text-base font-bold">Want to inspire others? 🌟</h4>
                        <p className="m-0 mt-1 text-slate-500 text-sm">Add one sentence about what you did today.</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="I watered the plants..."
                            value={inspirationText}
                            onChange={(e) => setInspirationText(e.target.value)}
                            aria-label="Inspire others with your eco action"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm text-sm"
                        />
                        <button
                            onClick={() => setInspirationSent(true)}
                            aria-label="Share your eco action"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
                        >
                            Share
                        </button>
                    </div>
                </motion.div>
            )}

            {/* BEHAVIORAL LAYER 3: Visible Collective Goal */}
            <div className="bg-blue-50/50 rounded-xl p-4 flex flex-col gap-3 border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-bold text-sm tracking-tight">🌍 School Collective Impact</span>
                    <span className="text-blue-700 font-bold tabular-nums">{schoolSavedCO2}kg CO₂</span>
                </div>
                <div className="bg-blue-200/50 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "60%" }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-blue-500 h-full rounded-full"
                    />
                </div>
                <p className="m-0 text-blue-600 text-xs text-right font-medium">Goal: 1,500kg this month</p>
            </div>

            {/* SOCIAL PROOF */}
            <ActivityFeed />

            {/* LEADERBOARD ARCHITECTURE (Neighbors included) */}
            <LeaderboardPreview />

        </motion.div>
    );
}
