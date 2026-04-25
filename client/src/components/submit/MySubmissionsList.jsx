import React from 'react';
import { motion } from 'framer-motion';

const getConfidenceLabel = (score) => {
    const numeric = Number(score);
    if (!Number.isFinite(numeric)) return null;
    if (numeric >= 80) return 'High';
    if (numeric >= 50) return 'Medium';
    return 'Low';
};

const getVerifierIdentity = (submission) => {
    const verifier = submission.verifiedBy || submission.reviewedBy || submission.appealResolvedBy;
    if (!verifier) return null;

    const roleLabel = verifier.role ? verifier.role.replace(/_/g, ' ') : 'Teacher/Admin';
    return `${verifier.name || 'Reviewer'} (${roleLabel})`;
};

const getVerificationTimestamp = (submission) => {
    return submission.reviewedAt || submission.appealResolvedAt || null;
};

const getAppealResolutionLabel = (submission) => {
    if (submission.appealDecision === 'approved') return 'Appeal Approved';
    if (submission.appealDecision === 'rejected' || submission.status === 'appeal_rejected') return 'Appeal Rejected';
    if (submission.status === 'appealed') return 'Appeal Pending';
    return null;
};

const hasFraudFlags = (submission) => {
    const directFlags = Array.isArray(submission.flags) && submission.flags.length > 0;
    const aiFlags = Array.isArray(submission.aiValidation?.flags) && submission.aiValidation.flags.length > 0;
    return directFlags || aiFlags;
};

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
    const rewardTimeline = submissions
        .filter((sub) => ['approved', 'teacher_approved'].includes(sub.status))
        .map((sub) => ({
            id: sub._id,
            points: Number(sub.activityPoints || 0),
            reason: `Verified ${String(sub.activityType || 'activity').replace(/-/g, ' ')}`,
            timestamp: sub.reviewedAt || sub.updatedAt || sub.createdAt
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

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
            {rewardTimeline.length > 0 && (
                <div className="eco-card p-4 md:p-5 border border-green-200/60 dark:border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-ui font-bold text-sm md:text-base text-gray-900 dark:text-[var(--t1)]">Reward Timeline</h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-green-700 dark:text-green-400">Verified Rewards Only</span>
                    </div>
                    <div className="grid gap-2">
                        {rewardTimeline.map((entry) => (
                            <div
                                key={entry.id}
                                className="rounded-lg border border-green-200 dark:border-green-500/30 bg-green-50/70 dark:bg-green-900/20 px-3 py-2 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-xs font-ui font-semibold text-green-800 dark:text-green-300">{entry.reason}</p>
                                    <p className="text-[11px] text-green-700/80 dark:text-green-200/80">{new Date(entry.timestamp).toLocaleString()}</p>
                                </div>
                                <span className="text-xs font-bold text-green-800 dark:text-green-300">+{entry.points} EP</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

                                    {(sub.status === 'teacher_approved' || sub.status === 'approved' || sub.status === 'teacher_rejected' || sub.status === 'rejected' || sub.status === 'appeal_rejected' || sub.status === 'appealed') && (
                                        <div className="mb-4 rounded-lg border border-gray-300 dark:border-[var(--b2)] bg-white dark:bg-[var(--s2)] p-3">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-[var(--t3)] mb-2">Verification Details</p>
                                            <div className="grid gap-1 text-xs text-gray-700 dark:text-[var(--t2)]">
                                                <p><span className="font-bold">Verified by:</span> {getVerifierIdentity(sub) || 'Pending reviewer assignment'}</p>
                                                <p><span className="font-bold">Confidence:</span> {getConfidenceLabel(sub.aiValidation?.confidenceScore) || 'Manual review'}</p>
                                                <p><span className="font-bold">Timestamp:</span> {getVerificationTimestamp(sub) ? new Date(getVerificationTimestamp(sub)).toLocaleString() : 'Pending review'}</p>
                                                {getAppealResolutionLabel(sub) && (
                                                    <p><span className="font-bold">Appeal:</span> {getAppealResolutionLabel(sub)}</p>
                                                )}
                                                {sub.appealResolvedAt && (
                                                    <p><span className="font-bold">Appeal Resolved At:</span> {new Date(sub.appealResolvedAt).toLocaleString()}</p>
                                                )}
                                            </div>
                                            {(sub.status === 'teacher_approved' || sub.status === 'approved') && !hasFraudFlags(sub) && (
                                                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                                                    🛡 Fraud Check Passed
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                        <div className="w-full rounded-lg border border-green-300 bg-green-50 p-3">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-green-700 mb-1">Outcome</p>
                                            <p className="text-xs text-green-800 font-semibold">Before: Pending Review → After: Verified & Impact Applied</p>
                                            <p className="text-xs text-green-700 mt-1">Reward reason: Verified activity credited {sub.activityPoints || 0} eco points.</p>
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
