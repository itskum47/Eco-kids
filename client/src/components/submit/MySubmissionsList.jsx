import React from 'react';
import { motion } from 'framer-motion';

const STATUS_BADGE = {
    pending: { bg: 'bg-[rgba(255,204,0,0.1)]', text: 'text-[var(--amber)]', border: 'border-[var(--amber)]', icon: '⏳', label: 'In Review' },
    approved: { bg: 'bg-[rgba(0,255,136,0.1)]', text: 'text-[var(--g1)]', border: 'border-[var(--g1)]', icon: '✅', label: 'Approved' },
    teacher_approved: { bg: 'bg-[rgba(0,255,136,0.1)]', text: 'text-[var(--g1)]', border: 'border-[var(--g1)]', icon: '✅', label: 'Approved' },
    rejected: { bg: 'bg-[rgba(255,64,96,0.1)]', text: 'text-[var(--red)]', border: 'border-[var(--red)]', icon: '⚠️', label: 'Rejected' },
    teacher_rejected: { bg: 'bg-[rgba(255,64,96,0.1)]', text: 'text-[var(--red)]', border: 'border-[var(--red)]', icon: '⚠️', label: 'Rejected' },
    appealed: { bg: 'bg-[rgba(59,130,246,0.1)]', text: 'text-blue-600', border: 'border-blue-400', icon: '📩', label: 'Appeal Pending' },
    appeal_rejected: { bg: 'bg-[rgba(107,114,128,0.15)]', text: 'text-gray-600', border: 'border-gray-400', icon: '❌', label: 'Appeal Rejected' }
};

const MySubmissionsList = ({
    submissions,
    setView,
    appealDrafts = {},
    appealSubmitting = {},
    appealSuccess = {},
    onStartAppeal,
    onAppealReasonChange,
    onSubmitAppeal
}) => {
    if (submissions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white dark:bg-[var(--s1)] border border-gray-200 dark:border-[var(--b1)] rounded-3xl"
            >
                <div className="text-6xl mb-6 opacity-80">📸</div>
                <h2 className="font-display text-2xl text-gray-900 dark:text-[var(--t1)] mb-3">No Submissions Yet</h2>
                <p className="font-ui text-gray-600 dark:text-[var(--t2)] mb-8 max-w-[300px] mx-auto">
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
                const canAppeal = ['rejected', 'teacher_rejected'].includes(sub.status) && !sub.appealedAt;
                const isAppealed = sub.status === 'appealed' || !!sub.appealedAt;
                const submissionId = sub._id || idx;
                const hasAppealDraft = Object.prototype.hasOwnProperty.call(appealDrafts, submissionId);
                const draftReason = appealDrafts[submissionId] || '';
                const isAppealSubmitting = !!appealSubmitting[submissionId];
                const isAppealSuccess = !!appealSuccess[submissionId];

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
                            <div className="md:w-48 h-40 md:h-auto flex-shrink-0 bg-white dark:bg-[var(--s2)] relative overflow-hidden">
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
                                <div className={`${sub.evidence?.imageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center flex-col text-gray-500 dark:text-[var(--t3)] bg-white dark:bg-[var(--s1)] border-r border-gray-200 dark:border-[var(--b1)]`}>
                                    <span className="text-3xl mb-2">📸</span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold">No Image</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-display text-xl text-gray-900 dark:text-[var(--t1)]">
                                            {sub.activityType.replace(/-/g, ' ').toUpperCase()}
                                        </h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider border ${statusItem.bg} ${statusItem.border} ${statusItem.text}`}>
                                            <span>{statusItem.icon}</span>
                                            {statusItem.label}
                                        </div>
                                    </div>

                                    <p className="font-ui text-xs text-gray-500 dark:text-[var(--t3)] mb-4">
                                        Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>

                                    <p className="font-ui text-sm text-gray-600 dark:text-[var(--t2)] leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                                        "{sub.evidence?.description || sub.description}"
                                    </p>
                                </div>

                                {/* Feedback / Status Footer */}
                                <div className="pt-4 border-t border-gray-300 dark:border-[var(--b2)] flex justify-between items-center">

                                    {['rejected', 'teacher_rejected'].includes(sub.status) && sub.rejectionReason ? (
                                        <div className="flex bg-[rgba(255,64,96,0.05)] w-full rounded-lg p-3 border border-[rgba(255,64,96,0.1)] gap-3 items-start">
                                            <span className="text-xl mt-0.5">💬</span>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-[var(--red)] tracking-wider mb-1">Teacher Feedback</p>
                                                <p className="text-xs text-gray-600 dark:text-[var(--t2)] leading-tight">{sub.rejectionReason}</p>
                                            </div>
                                        </div>
                                    ) : sub.impactApplied ? (
                                        <div className="flex items-center gap-2 text-[var(--g1)] font-ui font-bold text-xs uppercase tracking-wider">
                                            ✨ Impact Applied
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-[var(--t3)] font-ui font-bold text-[10px] uppercase tracking-wider">
                                            Pending final validation
                                        </div>
                                    )}

                                </div>

                                {canAppeal && !isAppealSuccess && (
                                    <div className="mt-4 p-3 rounded-lg border border-gray-300 dark:border-[var(--b2)] bg-white dark:bg-[var(--s2)]">
                                        {!hasAppealDraft ? (
                                            <button
                                                onClick={() => onStartAppeal && onStartAppeal(submissionId)}
                                                className="w-full sm:w-auto px-4 py-2 rounded-lg font-ui font-bold text-xs uppercase tracking-wider border border-[var(--v1)] text-[var(--v1)] hover:bg-[rgba(108,71,255,0.08)] transition-colors"
                                            >
                                                Dispute this decision
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="font-ui text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[var(--t3)]">
                                                    Tell your teacher why this should be reconsidered
                                                </p>
                                                <textarea
                                                    value={draftReason}
                                                    maxLength={200}
                                                    onChange={(e) => onAppealReasonChange && onAppealReasonChange(submissionId, e.target.value)}
                                                    className="w-full min-h-[90px] rounded-lg border border-gray-300 dark:border-[var(--b2)] bg-white dark:bg-[var(--s1)] p-3 text-sm text-gray-800 dark:text-[var(--t1)]"
                                                    placeholder="Write your reason (max 200 characters)"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-ui uppercase tracking-wider text-gray-500 dark:text-[var(--t3)]">
                                                        {draftReason.length}/200
                                                    </span>
                                                    <button
                                                        onClick={() => onSubmitAppeal && onSubmitAppeal(submissionId)}
                                                        disabled={isAppealSubmitting || !draftReason.trim()}
                                                        className="px-4 py-2 rounded-lg font-ui font-bold text-xs uppercase tracking-wider bg-[var(--v1)] text-white disabled:opacity-50"
                                                    >
                                                        {isAppealSubmitting ? 'Submitting...' : 'Submit Appeal'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(isAppealed || isAppealSuccess) && (
                                    <div className="mt-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-ui">
                                        Your appeal has been submitted. Your teacher will review it within 48 hours.
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MySubmissionsList;
