import React from "react";
import { motion } from "framer-motion";

export default function StreakCard({ streak }) {
    return (
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 text-white py-2 px-4 rounded-full font-bold text-base shadow-sm border border-orange-500 cursor-default"
        >
            <span className="mr-2 text-xl">🔥</span>
            {streak} Day Streak
        </motion.div>
    );
}
