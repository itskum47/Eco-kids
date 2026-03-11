import React from 'react';
import { motion } from 'framer-motion';

const LeaderboardRow = ({ ranking, isYou, index }) => {
    const isTopThree = ranking.rank <= 3;
    const rankMedal = isTopThree ? ['🥇', '🥈', '🥉'][ranking.rank - 1] : `#${ranking.rank}`;

    const renderRankChange = (change) => {
        if (change === 'NEW') {
            return (
                <span className="font-ui font-bold text-[8px] md:text-[10px] bg-[rgba(0,212,255,0.1)] text-[var(--c1)] px-2 py-1 rounded-md whitespace-nowrap border border-[var(--c1)]/30 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                    NEW
                </span>
            );
        }

        if (change > 0) {
            return (
                <div className="flex items-center justify-end gap-1 text-[var(--g1)] font-mono font-bold text-xs md:text-sm drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]">
                    <span className="text-sm md:text-base">↑</span> {change}
                </div>
            );
        }

        if (change < 0) {
            return (
                <div className="flex items-center justify-end gap-1 text-[var(--red)] font-mono font-bold text-xs md:text-sm drop-shadow-[0_0_5px_rgba(255,68,68,0.3)]">
                    <span className="text-sm md:text-base">↓</span> {Math.abs(change)}
                </div>
            );
        }

        return <div className="text-[var(--t3)] font-mono font-bold text-xs md:text-sm text-right pr-2">—</div>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.05), duration: 0.4, type: 'spring', damping: 20 }}
            className={`flex items-center justify-between p-4 md:p-5 mb-4 rounded-[24px] border transition-all duration-300 group
                ${isYou
                    ? 'bg-[var(--v1)]/10 border-[var(--v1)]/50 shadow-[0_10px_30px_rgba(167,139,250,0.2)] z-30 sticky bottom-4 md:bottom-auto backdrop-blur-xl hover:bg-[var(--v1)]/15 hover:-translate-y-1'
                    : 'bg-[var(--s1)]/80 backdrop-blur-sm border-[var(--b1)] shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-[var(--v2)] hover:bg-[var(--s2)] z-10 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]'
                }`}
        >
            <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">

                <div className={`w-10 md:w-14 text-center font-display text-2xl md:text-3xl flex-shrink-0 ${isTopThree ? 'drop-shadow-md' : 'text-[var(--t3)] group-hover:text-[var(--v2)] transition-colors'}`}>
                    {rankMedal}
                </div>

                <div className="relative">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--bg)] border-2 border-[var(--b2)] group-hover:border-[var(--v1)] transition-colors flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl md:text-3xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] z-10 relative">
                        {ranking.avatar || '👤'}
                    </div>
                    {isYou && (
                        <div className="absolute inset-0 rounded-full bg-[var(--v1)] blur-[10px] opacity-40 z-0"></div>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h4 className={`font-ui font-black tracking-wide text-base md:text-lg truncate ${isYou ? 'text-[var(--t1)] drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'text-[var(--t1)]'}`}>
                            {ranking.name}
                        </h4>
                        {isYou && (
                            <span className="font-ui font-bold text-[9px] uppercase tracking-widest bg-[var(--v1)] text-[#03050a] px-2.5 py-0.5 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(167,139,250,0.4)]">
                                You
                            </span>
                        )}
                        {ranking.level && (
                            <span className="font-mono text-[10px] bg-[var(--amber)]/10 text-[var(--amber)] px-2 py-0.5 rounded border border-[var(--amber)]/20 flex-shrink-0 drop-shadow-[0_0_5px_rgba(255,215,0,0.2)]">
                                Lvl {ranking.level}
                            </span>
                        )}
                    </div>
                    <p className="font-ui text-[11px] md:text-xs text-[var(--t2)] truncate uppercase tracking-wider opacity-80">
                        {ranking.school} {ranking.grade && ranking.grade !== 'N/A' && <><span className="mx-1 text-[var(--t3)]">//</span> Class {ranking.grade}</>}
                    </p>
                </div>

            </div>

            <div className="flex items-center gap-6 md:gap-10 flex-shrink-0 pl-4 border-l border-[var(--b1)] group-hover:border-[var(--v1)]/30 transition-colors ml-2">
                <div className="text-right flex flex-col items-end">
                    <div className="font-mono font-bold text-[18px] md:text-2xl text-[var(--amber)] leading-none mb-1 group-hover:drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all">
                        {ranking.ecoPoints?.toLocaleString() || 0}
                    </div>
                    <div className="font-ui font-bold text-[9px] uppercase tracking-widest text-[var(--t3)]">
                        XP Earned
                    </div>
                </div>

                <div className="w-10 md:w-14 flex justify-end">
                    {renderRankChange(ranking.rankChange !== undefined ? ranking.rankChange : (Math.floor(Math.random() * 5) - 2))}
                </div>
            </div>

        </motion.div>
    );
};

export default LeaderboardRow;
