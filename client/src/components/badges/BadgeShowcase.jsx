import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const rarityColors = {
    common: { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600', label: 'Common' },
    rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', label: 'Rare' },
    epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', label: 'Epic' },
    legendary: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', label: 'Legendary' }
};

const categoryIcons = {
    achievement: '🏆',
    milestone: '🎯',
    special: '⭐',
    seasonal: '🌿'
};

const BadgeShowcase = () => {
    const [badges, setBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const [profileRes, badgesRes] = await Promise.all([
                    api.get('/v1/gamification/me'),
                    api.get('/v1/gamification/badges')
                ]);
                setBadges(profileRes.data.data?.badges || []);
                setAllBadges(badgesRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch badges', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, []);

    if (loading) {
        return (
            <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 w-20 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    const earnedBadgeIds = new Set(badges.map(b => b.badgeId));
    const earnedCount = badges.length;
    const totalCount = allBadges.length;

    // Show earned badges first, then locked ones
    const displayBadges = expanded ? allBadges : allBadges.slice(0, 6);

    if (totalCount === 0 && earnedCount === 0) return null;

    return (
        <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {earnedCount}/{totalCount}
                    </span>
                </div>
                {totalCount > 6 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {expanded ? 'Show less' : 'View all'}
                    </button>
                )}
            </div>

            {earnedCount === 0 ? (
                <div className="text-center py-6">
                    <p className="text-3xl mb-2">🔒</p>
                    <p className="text-sm text-gray-500">Complete activities to earn your first badge!</p>
                </div>
            ) : (
                <>
                    {/* Earned badges row */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Earned</p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((badge, i) => {
                                const def = allBadges.find(b => b._id === badge.badgeId);
                                const rarity = rarityColors[def?.rarity || 'common'];
                                const category = categoryIcons[def?.category || 'achievement'];
                                return (
                                    <div
                                        key={i}
                                        className={`relative flex flex-col items-center p-3 rounded-lg border ${rarity.bg} ${rarity.border} min-w-[80px] transition-transform hover:scale-105`}
                                        title={`${badge.name} — Earned ${new Date(badge.earnedAt).toLocaleDateString()}`}
                                    >
                                        <span className="text-2xl mb-1">{def?.icon || category}</span>
                                        <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                                            {badge.name}
                                        </span>
                                        <span className={`text-[10px] font-medium mt-0.5 ${rarity.text}`}>
                                            {rarity.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Locked badges preview */}
            {totalCount > earnedCount && (
                <div>
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Locked</p>
                    <div className="flex flex-wrap gap-2">
                        {displayBadges
                            .filter(b => !earnedBadgeIds.has(b._id))
                            .map((badge) => {
                                const rarity = rarityColors[badge.rarity || 'common'];
                                return (
                                    <div
                                        key={badge._id}
                                        className="flex flex-col items-center p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-50 min-w-[80px]"
                                        title={`${badge.name} — ${badge.description}`}
                                    >
                                        <span className="text-2xl mb-1 grayscale">🔒</span>
                                        <span className="text-xs font-medium text-gray-500 text-center leading-tight">
                                            {badge.name}
                                        </span>
                                        <span className={`text-[10px] font-medium mt-0.5 ${rarity.text}`}>
                                            {rarity.label}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BadgeShowcase;
