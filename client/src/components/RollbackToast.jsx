import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RollbackToast({ isVisible }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 20, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-red-500 to-red-600 text-white py-4 px-6 rounded-full shadow-lg flex items-center gap-3 z-[9999] font-bold text-sm w-max max-w-[90vw]"
                    role="alert"
                    aria-live="assertive"
                >
                    <span className="text-2xl" aria-hidden="true">🌱</span>
                    <div>
                        <div className="font-normal leading-relaxed">
                            We’re double-checking that action. If it doesn’t show up in a moment, try again!
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
