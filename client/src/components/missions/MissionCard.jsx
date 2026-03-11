import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MissionCard = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const res = await api.get('/v1/missions/current');
                setMissions(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch missions', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    const handleClaim = async (missionId) => {
        setClaimingId(missionId);
        try {
            const res = await api.post(`/missions/${missionId}/claim`);
            if (res.data.success) {
                setMissions(prev =>
                    prev.map(m =>
                        m._id === missionId
                            ? { ...m, progress: { ...m.progress, rewardClaimed: true } }
                            : m
                    )
                );
            }
        } catch (err) {
            console.error('Claim error:', err);
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (missions.length === 0) return null;

    return (
        <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Missions</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Resets weekly
                </span>
            </div>

            <div className="space-y-3">
                {missions.map((mission) => {
                    const prog = mission.progress;
                    const allDone = prog?.allObjectivesCompleted;
                    const claimed = prog?.rewardClaimed;

                    return (
                        <div
                            key={mission._id}
                            className={`p-4 rounded-lg border transition-colors ${claimed
                                    ? 'bg-green-50 border-green-200'
                                    : allDone
                                        ? 'bg-amber-50 border-amber-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{mission.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{mission.title}</p>
                                        <p className="text-xs text-gray-500">{mission.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mission.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        mission.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {mission.difficulty}
                                </span>
                            </div>

                            {/* Objective progress bars */}
                            <div className="space-y-1.5 mb-3">
                                {prog?.objectives?.map((obj, i) => {
                                    const target = mission.objectives[i]?.target || 1;
                                    const current = Math.min(obj.current, target);
                                    const pct = Math.round((current / target) * 100);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                                                <span>{mission.objectives[i]?.description || 'Objective'}</span>
                                                <span className="font-medium">{current}/{target}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${obj.completed ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reward footer */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">
                                    Reward: <span className="text-green-700 font-semibold">{mission.reward.ep} EP</span>
                                    {mission.reward.badgeName && (
                                        <span className="ml-1 text-amber-600">+ {mission.reward.badgeName}</span>
                                    )}
                                </span>

                                {claimed ? (
                                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                        Claimed
                                    </span>
                                ) : allDone ? (
                                    <button
                                        onClick={() => handleClaim(mission._id)}
                                        disabled={claimingId === mission._id}
                                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        {claimingId === mission._id ? 'Claiming...' : 'Claim Reward'}
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium">In progress</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MissionCard;
