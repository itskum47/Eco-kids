import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BadgeRow = ({ badges = [] }) => {
    const recentBadges = badges.length > 0
        ? [...badges]
            .sort((a, b) => new Date(b.earnedAt || 0) - new Date(a.earnedAt || 0))
            .slice(0, 3)
        : [];

    const getBadgeIcon = (name = '') => {
        const normalized = String(name).toLowerCase();
        if (normalized.includes('tree')) return '🌳';
        if (normalized.includes('water')) return '💧';
        if (normalized.includes('energy')) return '⚡';
        if (normalized.includes('recycle') || normalized.includes('waste')) return '♻️';
        if (normalized.includes('streak')) return '🔥';
        if (normalized.includes('leader')) return '🏅';
        return '🎖️';
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-ui font-bold text-[13px] text-[var(--t1)]">Recent Badges</h3>
            </div>

            {/* Horizontal Scrollable Row */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                {recentBadges.length === 0 && (
                    <div className="flex-shrink-0 snap-start w-full rounded-xl border border-dashed border-[var(--b2)] bg-[var(--s2)] px-4 py-5 text-sm text-[var(--t2)]">
                        No badges yet. Complete verified activities to unlock your first badge.
                    </div>
                )}

                {recentBadges.map((badge, idx) => (
                    <motion.div
                        key={badge.badgeId || badge.id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className="flex-shrink-0 snap-start w-[180px] rounded-xl bg-[var(--s2)] border border-[var(--b2)] p-3 transition-transform hover:-translate-y-1"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{badge.icon || getBadgeIcon(badge.name)}</span>
                            <div>
                                <p className="text-sm font-semibold text-[var(--t1)] leading-tight">{badge.name || 'Eco Milestone'}</p>
                                <p className="text-[11px] text-[var(--t2)] mt-1">
                                    {badge.earnedAt ? `Earned ${new Date(badge.earnedAt).toLocaleDateString()}` : 'Milestone unlocked'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* View All Card */}
                <Link
                    to="/badges"
                    className="flex-shrink-0 snap-start w-[140px] h-[80px] rounded-xl flex flex-col items-center justify-center bg-[rgba(108,71,255,0.05)] border border-[rgba(108,71,255,0.2)] hover:border-[var(--v1)] hover:bg-[rgba(108,71,255,0.1)] transition-all group"
                >
                    <span className="text-[var(--v2)] text-sm mb-1 group-hover:translate-x-1 transition-transform">→</span>
                    <span className="font-ui font-bold text-[10px] text-[var(--t2)] uppercase tracking-wider text-center px-1 leading-tight">
                        See All<br />{badges.length} Badges
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default BadgeRow;
