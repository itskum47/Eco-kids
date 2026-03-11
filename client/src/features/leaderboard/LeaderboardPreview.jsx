import React from "react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { useUser } from "../../hooks/useUser";

export default function LeaderboardPreview() {
    const { data: leaderboardRes, isLoading } = useLeaderboard();
    const { data: userData } = useUser();

    if (isLoading || !leaderboardRes) return null;

    const top5 = leaderboardRes.data?.slice(0, 5) || [];
    const neighbors = leaderboardRes.neighbors || [];
    const currentUser = userData?.user || userData?.data || userData;
    const currentUserId = currentUser?._id;

    // Deduplicate logic
    // We show Top 5
    // Then an ellipsis if there's a gap
    // Then neighbors
    const top5Ids = new Set(top5.map(u => u._id));
    const distinctNeighbors = neighbors.filter(u => !top5Ids.has(u._id));

    const showEllipsis = distinctNeighbors.length > 0 && distinctNeighbors[0].rank > 6;

    const renderUser = (user, isHighlight) => (
        <div
            key={user._id}
            className={`flex justify-between items-center p-3 transition-colors ${isHighlight
                    ? 'bg-emerald-50 border border-emerald-200 rounded-lg my-1'
                    : 'bg-transparent border-b border-slate-100 last:border-0'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`font-bold w-6 text-sm ${user.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                    #{user.rank}
                </span>
                <span className={`text-slate-800 ${isHighlight ? 'font-bold' : 'font-medium'}`}>
                    {isHighlight ? "You" : user.name.split(' ')[0]}
                </span>
            </div>
            <strong className="text-emerald-600 tabular-nums">
                {user.totalPoints || user.gamification?.ecoPoints || 0} <span className="text-xs font-semibold text-emerald-600/70">pts</span>
            </strong>
        </div>
    );

    return (
        <div className="bg-[var(--s1)] p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="m-0 mb-4 text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <span className="text-xl">🏆</span> Eco Champions
            </h3>

            <div className="flex flex-col">
                {top5.map(user => renderUser(user, user._id === currentUserId))}

                {showEllipsis && (
                    <div className="text-center text-slate-300 py-1 font-bold text-lg">
                        •••
                    </div>
                )}

                {distinctNeighbors.map(user => renderUser(user, user._id === currentUserId))}
            </div>
        </div>
    );
}
