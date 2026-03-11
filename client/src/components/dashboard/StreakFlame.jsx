import React from 'react';

const StreakFlame = ({ streak }) => {
    // Determine flame style based on streak count
    const getFlameClass = () => {
        if (streak === 0) return 'text-[var(--t2)] scale-75 opacity-50';
        if (streak < 8) return 'text-[#ff9500] scale-100 animate-[flicker_3s_ease-in-out_infinite]';
        if (streak < 30) return 'text-[#ff4060] scale-110 drop-shadow-[0_0_15px_rgba(255,64,96,0.5)] animate-[pulse-fast_2s_ease-in-out_infinite]';
        return 'text-[#ff0033] scale-125 drop-shadow-[0_0_25px_rgba(255,0,51,0.8)] animate-[burn_1.5s_ease-in-out_infinite]';
    };

    return (
        <div className="eco-card p-4 md:p-6 flex items-center justify-between overflow-hidden relative">
            <div className="flex items-center gap-4 md:gap-6 z-10 w-full">
                {/* Flame SVG Wrapper */}
                <div className={`transition-all duration-500 origin-bottom flex-shrink-0 w-16 h-16 flex items-center justify-center ${getFlameClass()}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-16 md:h-16">
                        <path d="M12 2C12 2 10.5 5.5 8 8.5C5.5 11.5 4 14.5 4 17C4 21.4183 7.58172 25 12 25C16.4183 25 20 21.4183 20 17C20 14.5 18.5 11.5 16 8.5C13.5 5.5 12 2 12 2ZM12 20.5C10.067 20.5 8.5 18.933 8.5 17C8.5 15.5 9.5 14 11 12.5C11 15 12 16.5 12 16.5C12 16.5 15.5 14.5 15.5 17C15.5 18.933 13.933 20.5 12 20.5Z" />
                    </svg>
                </div>

                {/* Text Details */}
                <div className="flex-1">
                    <h3 className="font-display text-3xl md:text-[42px] font-normal leading-none mb-1 text-[var(--t1)]">
                        {streak === 0 ? 'Start' : streak} {streak !== 0 && 'Day Streak'}
                    </h3>
                    <p className="font-ui font-bold text-[var(--t2)] text-xs md:text-sm">
                        {streak === 0
                            ? 'Complete a mission to start your streak!'
                            : `Keep going! ${7 - (streak % 7)} days until next milestone`}
                    </p>
                </div>
            </div>

            {/* Decorative pulse ring for high streaks */}
            {streak >= 30 && (
                <div className="absolute left-[34px] md:left-[42px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-[var(--red)] rounded-full animate-[ping_3s_ease-out_infinite] opacity-30 pointer-events-none" />
            )}

            {/* CSS Animations defined inline for portability */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: hue-rotate(0deg); }
          50% { transform: scale(1.05) rotate(3deg); filter: hue-rotate(15deg); }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1.1) rotate(0deg); filter: brightness(1); }
          50% { transform: scale(1.15) rotate(2deg); filter: brightness(1.2); }
        }
        @keyframes burn {
          0%, 100% { transform: scale(1.25) skewX(-2deg); filter: brightness(1) drop-shadow(0 0 25px rgba(255,0,51,0.8)); }
          33% { transform: scale(1.28) skewX(3deg); filter: brightness(1.3) drop-shadow(0 0 35px rgba(255,0,51,1)); }
          66% { transform: scale(1.23) skewX(-1deg); filter: brightness(1.1) drop-shadow(0 0 20px rgba(255,0,51,0.6)); }
        }
      `}} />
        </div>
    );
};

export default StreakFlame;
