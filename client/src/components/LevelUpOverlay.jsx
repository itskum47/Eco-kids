import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LevelUpOverlay({ level, onComplete }) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-emerald-500/95 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center text-white"
                role="dialog"
                aria-modal="true"
                aria-label="Level Up Celebration"
            >
                <motion.div
                    initial={{ scale: 0.5, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center p-5 relative z-10"
                >
                    <span className="text-8xl block mb-4">🌿</span>
                    <h1 className="text-5xl m-0 mb-4 font-black">Level {level} Unlocked!</h1>
                    <p className="text-xl font-bold opacity-90">You're growing into an Eco Guardian!</p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
