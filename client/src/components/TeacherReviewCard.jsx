import React, { useState } from 'react';
import { Check, X, MapPin, Clock, AlertTriangle, ChevronDown, ChevronUp, Eye } from 'lucide-react';

/**
 * Simplified teacher verification card — approve/reject with single tap.
 * Shows key info at a glance: student, activity type, timestamp, location, image.
 */
const TeacherReviewCard = ({ submission, onApprove, onReject, isProcessing = false }) => {
    const [expanded, setExpanded] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!submission) return null;

    const { user, activityType, evidence, createdAt, geoLocation, status } = submission;

    const activityIcons = {
        'tree-planting': '🌳',
        'waste-recycling': '🗑️',
        'water-saving': '💧',
        'energy-saving': '⚡',
        'plastic-reduction': '♻️',
        'composting': '🌱',
        'biodiversity-survey': '🦋'
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleApprove = () => {
        onApprove?.(submission._id);
    };

    const handleReject = () => {
        if (showRejectInput && rejectReason.trim()) {
            onReject?.(submission._id, rejectReason);
            setShowRejectInput(false);
            setRejectReason('');
        } else {
            setShowRejectInput(true);
        }
    };

    const isPending = status === 'pending';

    return (
        <div className="rounded-xl border border-white/5 bg-[var(--s1)]/[0.02] overflow-hidden
                    hover:border-white/10 transition-all duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm">
                    {activityIcons[activityType] || '🌍'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">
                        {user?.name || 'Student'}
                    </p>
                    <p className="text-xs text-white/40 capitalize">
                        {activityType?.replace(/-/g, ' ')}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <Clock className="w-3 h-3" />
                    {timeAgo(createdAt)}
                </div>
            </div>

            {/* Image */}
            {evidence?.imageUrl && (
                <div className="relative">
                    <img
                        src={evidence.imageUrl}
                        alt={`${activityType} evidence`}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                    />
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/70
                       hover:bg-black/70 transition-colors backdrop-blur-sm"
                        aria-label="Toggle details"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {/* Expandable details */}
            {expanded && (
                <div className="px-4 py-3 border-t border-white/5 space-y-2">
                    {evidence?.description && (
                        <p className="text-xs text-white/50 leading-relaxed">
                            {evidence.description}
                        </p>
                    )}
                    {geoLocation?.lat && geoLocation?.lng && (
                        <div className="flex items-center gap-1.5 text-xs text-white/30">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>{geoLocation.lat.toFixed(4)}, {geoLocation.lng.toFixed(4)}</span>
                            {geoLocation.accuracy && (
                                <span className="text-white/20">±{geoLocation.accuracy.toFixed(0)}m</span>
                            )}
                        </div>
                    )}
                    {!geoLocation?.lat && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/70">
                            <AlertTriangle className="w-3 h-3" />
                            <span>No GPS data attached</span>
                        </div>
                    )}
                </div>
            )}

            {/* Reject reason input */}
            {showRejectInput && (
                <div className="px-4 py-2 border-t border-white/5">
                    <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10
                       text-sm text-white placeholder-white/30 outline-none
                       focus:border-red-400/50 transition-colors"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleReject()}
                    />
                </div>
            )}

            {/* Action buttons */}
            {isPending && (
                <div className="flex border-t border-white/5">
                    <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium
                       text-red-400 hover:bg-red-500/10 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed
                       border-r border-white/5"
                        aria-label="Reject submission"
                    >
                        <X className="w-4 h-4" />
                        Reject
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium
                       text-emerald-400 hover:bg-emerald-500/10 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Approve submission"
                    >
                        <Check className="w-4 h-4" />
                        Approve
                    </button>
                </div>
            )}

            {/* Already reviewed badge */}
            {!isPending && (
                <div className={`px-4 py-2 text-xs font-medium text-center border-t border-white/5
          ${status === 'approved' ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'}`}>
                    {status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </div>
            )}
        </div>
    );
};

export default TeacherReviewCard;
