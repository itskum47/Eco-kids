import React from "react";
import { useActivityFeed } from "../../hooks/useActivityFeed";
import Skeleton from "react-loading-skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityFeed() {
    const { data, isLoading, isError } = useActivityFeed();
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (isLoading) {
        return (
            <div className="p-4 bg-slate-50 rounded-xl mb-6">
                <h3 className="m-0 mb-3 text-lg text-slate-700">📢 Live Feed</h3>
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={24} width="80%" />
            </div>
        );
    }

    if (isError || !data || data.length === 0) {
        return null; // Don't show empty feed
    }

    return (
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-6 shadow-sm border border-slate-200">
            <h3 className="m-0 mb-4 text-lg text-slate-900 flex items-center gap-2 font-bold tracking-tight">
                <span className="text-xl">📢</span> Live Eco Actions
            </h3>

            <div className="flex flex-col gap-3">
                <AnimatePresence>
                    {(isExpanded ? data : data.slice(0, 2)).map(item => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            layout
                            className="p-3 bg-[var(--s1)] rounded-lg text-sm text-slate-700 flex items-center justify-between gap-2 shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🌱</span>
                                <span>
                                    <strong className="text-slate-800 font-bold">{item.studentName.split(' ')[0]}</strong> earned points
                                </span>
                            </div>
                            <strong className="text-emerald-600 tabular-nums">+{item.pointsEarned}</strong>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {data.length > 2 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-transparent border-none text-emerald-600 font-semibold cursor-pointer py-2 mt-1 text-sm hover:text-emerald-700 transition-colors"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse community feed" : "Expand community feed"}
                    >
                        {isExpanded ? "Collapse" : "View Community"}
                    </button>
                )}
            </div>
        </div>
    );
}
