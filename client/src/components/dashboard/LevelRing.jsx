import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const LevelRing = ({ level, currentXP, nextLevelXP, levelName }) => {
    const [offset, setOffset] = useState(0);
    const circleRef = useRef(null);

    // Circle geometry
    const radius = 90;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    useEffect(() => {
        // Calculate percentage (max 100%)
        const safeNextXP = nextLevelXP || 1;
        const progress = Math.min((currentXP / safeNextXP) * 100, 100);
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        // Animate on mount via IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setOffset(strokeDashoffset);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (circleRef.current) {
            observer.observe(circleRef.current);
        }

        return () => observer.disconnect();
    }, [currentXP, nextLevelXP, circumference]);

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* SVG Container */}
            <div
                ref={circleRef}
                className="relative w-[200px] h-[200px] flex items-center justify-center"
            >
                <svg
                    height="100%"
                    width="100%"
                    viewBox="0 0 200 200"
                    className="absolute inset-0 -rotate-90"
                >
                    {/* Defs for gradient and glow */}
                    <defs>
                        <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--v1)" />
                            <stop offset="100%" stopColor="var(--p1)" />
                        </linearGradient>

                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background Ring */}
                    <circle
                        stroke="var(--b1)"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx="100"
                        cy="100"
                    />

                    {/* Progress Ring */}
                    <circle
                        stroke="url(#levelGradient)"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 1.5s ease-out'
                        }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx="100"
                        cy="100"
                        filter="url(#glow)"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    {/* Add a subtle glow behind the text */}
                    <div className="absolute w-[80px] h-[80px] rounded-full bg-[var(--v1)] blur-2xl opacity-20 hidden md:block" />

                    <span className="font-display text-[56px] leading-[0.9] text-[var(--t1)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-10">
                        {level}
                    </span>
                    <span className="font-ui text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--t3)] mt-1 z-10">
                        {levelName}
                    </span>
                </div>
            </div>

            {/* XP Label Below Ring */}
            <div className="mt-4 bg-[var(--s2)] border border-[var(--b2)] rounded-full px-4 py-1.5 shadow-sm">
                <span className="font-mono text-xs md:text-[13px] text-[var(--t1)] font-medium">
                    <span className="text-[var(--v2)]">{currentXP.toLocaleString()}</span>
                    <span className="text-[var(--t3)] mx-1">/</span>
                    <span className="text-[var(--t2)]">{nextLevelXP.toLocaleString()} XP</span>
                </span>
            </div>
        </div>
    );
};

export default LevelRing;
