import { useState, useEffect, useRef } from 'react';

/**
 * Hook to animate a number counting up from starting value to ending value
 * ONLY triggers when the element enters the viewport.
 * 
 * @param {number} from - starting value
 * @param {number} to - ending value
 * @param {number} duration - animation duration in ms
 */
export const useCountUp = (from = 0, to, duration = 2000) => {
    const [value, setValue] = useState(from);
    const elementRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const node = elementRef.current;
        if (!node || hasAnimated.current) return;

        let startTime = null;
        let animationFrame;

        // easeOutQuart
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedProgress = easeOutQuart(percentage);

            const current = Math.floor(from + (to - from) * easedProgress);
            setValue(current);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setValue(to);
                hasAnimated.current = true;
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    animationFrame = requestAnimationFrame(animate);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(node);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            if (node) {
                observer.unobserve(node);
            }
            observer.disconnect();
        };
    }, [from, to, duration]);

    return { value, elementRef };
};
