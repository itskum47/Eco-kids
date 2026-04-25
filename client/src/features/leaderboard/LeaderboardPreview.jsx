import React from "react";
import { useLeaderboard } from "../../hooks/useLeaderboard";

export default function LeaderboardPreview() {
    const { data: leaderboardRes, isLoading } = useLeaderboard();

    if (isLoading || !leaderboardRes) return null;

    const top5 = leaderboardRes.leaderboard?.slice(0, 5) || [];

    const renderUser = (user) => (
        <div
            key={user.id || user._id || user.rank}
            className="flex justify-between items-center p-3 transition-colors bg-transparent border-b border-slate-100 last:border-0"
        >
            <div className="flex items-center gap-3">
                <span className={`font-bold w-6 text-sm ${user.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                    #{user.rank}
                </span>
                <span className="text-slate-800 font-medium">
                    {user.name?.split(' ')[0] || 'Student'}
                </span>
            </div>
            <strong className="text-emerald-600 tabular-nums">
                {user.ecoPoints || user.totalPoints || user.gamification?.ecoPoints || 0} <span className="text-xs font-semibold text-emerald-600/70">pts</span>
            </strong>
        </div>
    );

    return (
        <div className="bg-[var(--s1)] p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="m-0 mb-4 text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <span className="text-xl">🏆</span> Eco Champions
            </h3>

            <div className="flex flex-col">
                {top5.map(user => renderUser(user))}
            </div>
        </div>
    );
}
