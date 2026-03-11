import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PointsToast({ data }) {
    return (
        <AnimatePresence>
            {data && (
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 20, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-500 to-amber-400 text-white py-4 px-6 rounded-full shadow-lg z-[9999] flex items-center gap-3 font-bold text-lg"
                >
                    <span className="text-2xl">⭐</span>
                    <div>
                        <div className="text-xl">+{data.points} Points Earned!</div>
                        {data.message && <div className="text-sm opacity-90 font-normal mt-0.5">{data.message}</div>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
