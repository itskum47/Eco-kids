import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActiveMissionCard = ({ mission, loading = false, error = null }) => {
    const missionTitle = mission?.title || 'No Active Mission';
    const missionDeadline = mission?.dueDate
        ? `${Math.max(Math.ceil((new Date(mission.dueDate) - new Date()) / (1000 * 60 * 60 * 24)), 0)} days left`
        : 'Awaiting assignment';
    const missionTasks = mission
        ? [
            {
                id: 1,
                text: mission.description || 'Complete your assigned mission',
                completed: mission.status === 'Submitted'
            }
        ]
        : [];
    const missionProgress = mission?.status === 'Submitted' ? 100 : mission ? 25 : 0;

    return (
        <div className="relative p-[1px] rounded-xl overflow-hidden mt-2">
            {/* Animated gradient border trick using a spinning pseudo-element */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--v1)] via-[var(--c1)] to-[var(--p1)] opacity-70 animate-[spin_4s_linear_infinite] w-[200%] h-[200%] -top-[50%] -left-[50%]" />

            {/* Inner Card Content */}
            <div className="relative bg-[var(--s1)] rounded-xl p-6 h-full w-full flex flex-col z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-ui text-[10px] font-bold tracking-[0.14em] text-[var(--v1)] uppercase bg-[rgba(108,71,255,0.1)] border border-[rgba(108,71,255,0.22)] rounded-md px-2.5 py-1">
                            🎯 Active Mission
                        </span>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--t2)] font-medium">
                        ⏳ {missionDeadline}
                    </span>
                </div>

                <h3 className="font-display text-[22px] text-[var(--t1)] mb-4">{loading ? 'Loading mission...' : error ? 'Mission Unavailable' : missionTitle}</h3>

                {/* Task Pills */}
                <div className="flex flex-col gap-2 mb-6">
                    {loading ? (
                        <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg border bg-[var(--s2)] border-[var(--b2)] text-[var(--t2)] animate-pulse">
                            <span className="flex-shrink-0 text-base">⏳</span>
                            <span>Fetching your current mission...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg border bg-red-50 border-red-200 text-red-700">
                            <span className="flex-shrink-0 text-base">⚠️</span>
                            <span>{error}</span>
                        </div>
                    ) : missionTasks.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg border bg-[var(--s2)] border-[var(--b2)] text-[var(--t2)]">
                            <span className="flex-shrink-0 text-base">🧭</span>
                            <span>No mission assigned yet. Check back after teacher assignment.</span>
                        </div>
                    ) : missionTasks.map(task => (
                        <div
                            key={task.id}
                            className={`flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-lg border ${task.completed ? 'bg-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.2)] text-[var(--g1)]' : 'bg-[var(--s2)] border-[var(--b2)] text-[var(--t2)]'}`}
                        >
                            <span className="flex-shrink-0 text-base">{task.completed ? '✅' : '⏳'}</span>
                            <span className={task.completed ? 'opacity-80 line-through' : ''}>
                                {task.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[var(--s2)] rounded-full overflow-hidden mb-6 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${missionProgress}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--g1)] to-[var(--c1)] rounded-full"
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>

                {/* CTA */}
                <Link
                    to="/submit-activity"
                    className="btn-eco w-full shadow-[0_0_20px_rgba(0,255,136,0.15)] flex justify-between items-center group"
                >
                    <span>{loading ? 'Loading...' : error ? 'Retry Later' : mission ? 'Complete Next Task' : 'Log First Activity'}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
        </div>
    );
};

export default ActiveMissionCard;
