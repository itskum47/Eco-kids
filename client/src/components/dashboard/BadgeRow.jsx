import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BadgeRow = ({ badges = [] }) => {
    // Mock recent badges if none provided
    const recentBadges = badges.length > 0 ? badges.slice(0, 3) : [
        { id: 1, name: 'First Tree', rarity: 'common', icon: '🌱' },
        { id: 2, name: 'Water Saver', rarity: 'rare', icon: '💧' },
        { id: 3, name: 'Eco Warrior', rarity: 'legendary', icon: '⭐' }
    ];

    const getRarityStyles = (rarity) => {
        switch (rarity?.toLowerCase()) {
            case 'legendary':
                return 'border-[var(--amber)] shadow-[0_0_40px_rgba(0,255,136,0.5)] animate-[pulse-fast_2s_ease-in-out_infinite]';
            case 'epic':
                return 'border-[var(--v2)] shadow-[0_0_40px_rgba(108,71,255,0.35)]';
            case 'rare':
                return 'border-[var(--c1)] shadow-[0_0_40px_rgba(0,229,255,0.25)]';
            case 'common':
            default:
                return 'border-[var(--t3)]';
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-ui font-bold text-[13px] text-[var(--t1)]">Recent Badges</h3>
            </div>

            {/* Horizontal Scrollable Row */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                {recentBadges.map((badge, idx) => (
                    <motion.div
                        key={badge.id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className={`flex-shrink-0 snap-start w-[80px] h-[80px] rounded-xl flex items-center justify-center bg-[var(--s2)] border-2 transition-transform hover:-translate-y-1 cursor-pointer ${getRarityStyles(badge.rarity)}`}
                    >
                        <span className="text-4xl drop-shadow-md">{badge.icon || '🎖️'}</span>
                    </motion.div>
                ))}

                {/* View All Card */}
                <Link
                    to="/badges"
                    className="flex-shrink-0 snap-start w-[80px] h-[80px] rounded-xl flex flex-col items-center justify-center bg-[rgba(108,71,255,0.05)] border border-[rgba(108,71,255,0.2)] hover:border-[var(--v1)] hover:bg-[rgba(108,71,255,0.1)] transition-all group"
                >
                    <span className="text-[var(--v2)] text-sm mb-1 group-hover:translate-x-1 transition-transform">→</span>
                    <span className="font-ui font-bold text-[10px] text-[var(--t2)] uppercase tracking-wider text-center px-1 leading-tight">
                        See All<br />{badges.length || 3} Badges
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default BadgeRow;
