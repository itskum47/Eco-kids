import React, { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ value, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const prevValueRef = useRef(0);
    const nodeRef = useRef(null);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Only animate if value changed
        if (value === prevValueRef.current) return;

        // Check if element is in viewport
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    startAnimation();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (nodeRef.current) {
            observer.observe(nodeRef.current);
        }

        return () => observer.disconnect();
    }, [value]);

    const startAnimation = () => {
        const start = displayValue;
        const end = value;
        const duration = 1400; // 1.4s as per prompt
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // easeOutExpo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(start + (end - start) * ease);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                triggerParticles();
            }
        };

        requestAnimationFrame(animate);
        prevValueRef.current = value;
    };

    const triggerParticles = () => {
        const newParticles = Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const distance = 40 + Math.random() * 20;
            return {
                id: Date.now() + i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
            };
        });

        setParticles(newParticles);

        setTimeout(() => {
            setParticles([]);
        }, 800);
    };

    return (
        <div ref={nodeRef} className={`relative inline-block ${className}`}>
            {/* Number flash effect on update */}
            <span className="relative z-10 transition-colors duration-300">
                {displayValue.toLocaleString()}
            </span>

            {/* Particles */}
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[var(--amber)] -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"
                    style={{
                        animation: `burst 0.8s ease-out forwards`,
                        '--tx': `${p.x}px`,
                        '--ty': `${p.y}px`
                    }}
                />
            ))}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.5); opacity: 0; }
        }
      `}} />
        </div>
    );
};

export default AnimatedCounter;
