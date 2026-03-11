import React from 'react';
import { motion } from 'framer-motion';

const GhostIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--t3)]">
        <path d="M9 10h.01"></path><path d="M15 10h.01"></path>
        <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
    </svg>
);

const EmptyState = ({
    title = 'No Data Found',
    message = "There's nothing here yet.",
    icon = <GhostIcon />,
    action = null
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center p-12 text-center rounded-[var(--r-lg)] border-2 border-dashed border-[var(--b2)] bg-[var(--s1)]/50 mx-auto"
        >
            <div className="mb-4 opacity-70">
                {icon}
            </div>
            <h3 className="font-display text-xl text-[var(--t2)] mb-2">
                {title}
            </h3>
            <p className="font-ui text-sm text-[var(--t3)] max-w-sm mx-auto mb-6">
                {message}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
