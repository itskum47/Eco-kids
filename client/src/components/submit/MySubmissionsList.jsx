import React from 'react';
import { motion } from 'framer-motion';

const STATUS_BADGE = {
    pending: { bg: 'bg-[rgba(255,204,0,0.1)]', text: 'text-[var(--amber)]', border: 'border-[var(--amber)]', icon: '⏳', label: 'In Review' },
    approved: { bg: 'bg-[rgba(0,255,136,0.1)]', text: 'text-[var(--g1)]', border: 'border-[var(--g1)]', icon: '✅', label: 'Approved' },
    rejected: { bg: 'bg-[rgba(255,64,96,0.1)]', text: 'text-[var(--red)]', border: 'border-[var(--red)]', icon: '⚠️', label: 'Needs Action' }
};

const MySubmissionsList = ({ submissions, setView }) => {
    if (submissions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-[var(--s1)] border border-[var(--b1)] rounded-3xl"
            >
                <div className="text-6xl mb-6 opacity-80">📸</div>
                <h2 className="font-display text-2xl text-[var(--t1)] mb-3">No Submissions Yet</h2>
                <p className="font-ui text-[var(--t2)] mb-8 max-w-[300px] mx-auto">
                    Start documenting your eco-friendly activities to earn impact credits and climb the leaderboard!
                </p>
                <button
                    onClick={() => setView('submit')}
                    className="btn-primary shadow-[0_0_20px_rgba(108,71,255,0.2)]"
                >
                    Submit First Activity
                </button>
            </motion.div>
        );
    }

    return (
        <div className="grid gap-6">
            {submissions.map((sub, idx) => {
                const statusItem = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;

                return (
                    <motion.div
                        key={sub._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="eco-card overflow-hidden group hover:border-[var(--v1)] transition-colors duration-300"
                    >
                        <div className="flex flex-col md:flex-row">

                            {/* Image Thumbnail */}
                            <div className="md:w-48 h-40 md:h-auto flex-shrink-0 bg-[var(--s2)] relative overflow-hidden">
                                {sub.evidence?.imageUrl ? (
                                    <img
                                        src={sub.evidence.imageUrl}
                                        alt="Activity evidence"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                {/* Fallback */}
                                <div className={`${sub.evidence?.imageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center flex-col text-[var(--t3)] bg-[var(--s1)] border-r border-[var(--b1)]`}>
                                    <span className="text-3xl mb-2">📸</span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold">No Image</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-display text-xl text-[var(--t1)]">
                                            {sub.activityType.replace(/-/g, ' ').toUpperCase()}
                                        </h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider border ${statusItem.bg} ${statusItem.border} ${statusItem.text}`}>
                                            <span>{statusItem.icon}</span>
                                            {statusItem.label}
                                        </div>
                                    </div>

                                    <p className="font-ui text-xs text-[var(--t3)] mb-4">
                                        Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>

                                    <p className="font-ui text-sm text-[var(--t2)] leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                                        "{sub.evidence?.description || sub.description}"
                                    </p>
                                </div>

                                {/* Feedback / Status Footer */}
                                <div className="pt-4 border-t border-[var(--b2)] flex justify-between items-center">

                                    {sub.status === 'rejected' && sub.rejectionReason ? (
                                        <div className="flex bg-[rgba(255,64,96,0.05)] w-full rounded-lg p-3 border border-[rgba(255,64,96,0.1)] gap-3 items-start">
                                            <span className="text-xl mt-0.5">💬</span>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-[var(--red)] tracking-wider mb-1">Teacher Feedback</p>
                                                <p className="text-xs text-[var(--t2)] leading-tight">{sub.rejectionReason}</p>
                                            </div>
                                        </div>
                                    ) : sub.impactApplied ? (
                                        <div className="flex items-center gap-2 text-[var(--g1)] font-ui font-bold text-xs uppercase tracking-wider">
                                            ✨ Impact Applied
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[var(--t3)] font-ui font-bold text-[10px] uppercase tracking-wider">
                                            Pending final validation
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MySubmissionsList;
