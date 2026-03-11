import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActiveMissionCard = () => {
    // Mock mission data for demonstration purposes
    const mission = {
        title: 'Plastic Patrol',
        deadline: '3 days left',
        tasks: [
            { id: 1, text: 'Collect 10 plastic bottles', completed: true },
            { id: 2, text: 'Drop at recycling center', completed: false },
            { id: 3, text: 'Upload photo proof', completed: false }
        ],
        progress: 33
    };

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
                        ⏳ {mission.deadline}
                    </span>
                </div>

                <h3 className="font-display text-[22px] text-[var(--t1)] mb-4">{mission.title}</h3>

                {/* Task Pills */}
                <div className="flex flex-col gap-2 mb-6">
                    {mission.tasks.map(task => (
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
                        animate={{ width: `${mission.progress}%` }}
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
                    <span>Complete Next Task</span>
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
