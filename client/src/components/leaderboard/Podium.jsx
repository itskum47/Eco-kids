import React from 'react';
import { motion } from 'framer-motion';

const Podium = ({ topThree = [] }) => {
    const safeTopThree = [...topThree, null, null, null].slice(0, 3);

    const displayOrder = [
        { rank: 2, data: safeTopThree[1], position: 'left' },
        { rank: 1, data: safeTopThree[0], position: 'center' },
        { rank: 3, data: safeTopThree[2], position: 'right' }
    ];

    return (
        <div className="flex items-end justify-center gap-3 md:gap-8 h-[300px] md:h-[380px] mb-20 relative">
            <div className="absolute bottom-0 w-[80%] h-48 bg-[var(--amber)] blur-[120px] opacity-[0.15] pointer-events-none rounded-full" />

            {displayOrder.map((item, idx) => {
                if (!item.data) return <div key={`empty-${item.rank}`} className="w-1/3 max-w-[150px]" />;
                return <PodiumPillar key={item.data.id || item.rank} {...item} index={idx} />;
            })}
        </div>
    );
};

const PodiumPillar = ({ rank, data, position, index }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const heightClass = isFirst ? 'h-[180px] md:h-[230px]' : isSecond ? 'h-[130px] md:h-[170px]' : 'h-[100px] md:h-[130px]';

    const metallicGold = 'linear-gradient(135deg, #ffd700 0%, #ffdf00 50%, #d4af37 100%)';
    const metallicSilver = 'linear-gradient(135deg, #e4e4e4 0%, #ffffff 50%, #c0c0c0 100%)';
    const metallicBronze = 'linear-gradient(135deg, #cd7f32 0%, #e6a15c 50%, #8b4513 100%)';

    const topGradient = isFirst ? metallicGold : isSecond ? metallicSilver : metallicBronze;
    const activeColor = isFirst ? '#ffd700' : isSecond ? '#e4e4e4' : '#cd7f32';

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: 'spring', damping: 15 }}
            className={`flex flex-col items-center w-[30%] max-w-[160px] ${isFirst ? 'z-20 relative' : 'z-10 relative'}`}
        >

            {isFirst && (
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-[-20px] z-30 text-5xl md:text-6xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                >
                    👑
                </motion.div>
            )}

            <div className={`relative mb-6 rounded-full ${isFirst ? 'w-[80px] h-[80px] md:w-[110px] md:h-[110px]' : 'w-16 h-16 md:w-[88px] md:h-[88px]'}`}>
                <div
                    className={`w-full h-full rounded-full border-[4px] flex items-center justify-center text-3xl md:text-5xl bg-[var(--s1)] overflow-hidden`}
                    style={{
                        borderColor: activeColor,
                        boxShadow: `0 0 25px ${activeColor}50, inset 0 0 15px rgba(0,0,0,0.8)`
                    }}
                >
                    {data.avatar || '👤'}
                </div>

                <div
                    className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-display font-black text-[#03050a] text-xl md:text-2xl border-[4px] border-[var(--bg)] shadow-[0_5px_15px_rgba(0,0,0,0.5)]`}
                    style={{ background: topGradient }}
                >
                    {rank}
                </div>
            </div>

            <div className="text-center mb-4 w-full px-1">
                <h3 className={`font-ui font-black tracking-wider truncate w-full px-1 drop-shadow-md ${isFirst ? 'text-xl md:text-2xl text-[var(--t1)]' : 'text-base md:text-lg text-[var(--t2)]'}`}>{data.name}</h3>
                <p className="font-ui text-[9px] md:text-[11px] uppercase tracking-widest text-[var(--t3)] truncate w-full mt-1 opacity-80">{data.school || 'School'}</p>
            </div>

            <div className={`font-mono font-bold ${isFirst ? 'text-2xl md:text-3xl text-[var(--amber)] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]' : 'text-lg md:text-xl text-[var(--t1)]'} mb-4`}>
                {data.ecoPoints?.toLocaleString()} <span className="text-[10px] md:text-xs text-[var(--t3)] uppercase font-ui tracking-widest">XP</span>
            </div>

            {/* Premium Podium Block */}
            <div
                className={`w-[105%] md:w-[110%] rounded-t-3xl md:rounded-t-[40px] border-t-[3px] border-l border-r ${heightClass} relative overflow-hidden flex flex-col items-center justify-start pt-4`}
                style={{
                    backgroundColor: 'var(--s1)',
                    borderColor: `${activeColor}80`,
                    boxShadow: `inset 0 10px 40px ${activeColor}20, 0 15px 50px rgba(0,0,0,0.6)`
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-2 md:h-3 opacity-90" style={{ background: topGradient }} />

                <div className="absolute top-0 w-1/2 h-full bg-white opacity-5 mix-blend-overlay skew-x-12 transform origin-left" />

                <div className="absolute inset-0 opacity-[0.08]" style={{ background: `linear-gradient(to bottom, ${activeColor}, transparent)` }} />
            </div>

        </motion.div>
    );
};

export default Podium;
