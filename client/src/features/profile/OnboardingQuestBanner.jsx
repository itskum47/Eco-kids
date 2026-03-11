import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingQuestBanner({ isCompleted, onDismiss }) {
    return (
        <AnimatePresence>
            {!isCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white p-5 rounded-xl mb-6 shadow-md relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="m-0 mb-2 text-xl flex items-center gap-2 font-bold tracking-tight">
                            <span className="text-2xl">🎯</span> Welcome Mission!
                        </h2>
                        <p className="m-0 text-base opacity-90 leading-relaxed font-medium">
                            Complete your first eco activity to earn <strong className="text-yellow-300 font-bold">50 bonus points</strong> and an exclusive badge!
                        </p>
                    </div>

                    {/* Decorative background elements */}
                    <div className="absolute -right-4 -top-8 text-9xl opacity-10 rotate-12 pointer-events-none">
                        🌱
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
