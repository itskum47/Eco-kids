import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient as api } from '../../utils/api';
import PendingApprovals from './PendingApprovals';
import AssignmentsTab from './AssignmentsTab';
import AppealsTab from './AppealsTab';

const TeacherDashboard = () => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('approvals');
    const [dashData, setDashData] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation(['teacher', 'common']);

    // Security Guard
    if (!isAuthenticated || user?.role !== 'teacher') {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dashRes, rankRes] = await Promise.all([
                    api.get('/teacher/dashboard'),
                    api.get('/teacher/school-rankings')
                ]);
                setDashData(dashRes.data);
                setRankings(rankRes.data?.rankings || []);
                setMyRank(rankRes.data?.myRank || null);
            } catch (e) {
                setError(e.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="p-6 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-sm text-red-600 bg-red-50 rounded-xl">
                Failed to load dashboard: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Teacher Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.5334l.058.028a2.535 2.535 0 00.02.009l.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                        {user?.profile?.school?.name || user?.profile?.school || "Mapped Institutional School"}
                    </p>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: t('teacher:totalStudents'), value: dashData?.stats?.totalStudents, bg: 'bg-teal-50 text-teal-800' },
                    { label: t('teacher:activeThisWeek'), value: dashData?.stats?.activeThisWeek, bg: 'bg-green-50 text-green-800' },
                    { label: t('teacher:avgEcoPoints'), value: dashData?.stats?.avgEcoPoints, bg: 'bg-amber-50 text-amber-800' },
                    { label: t('teacher:pendingReviews'), value: dashData?.stats?.pendingVerifications, bg: 'bg-orange-50 text-orange-800' },
                ].map(card => (
                    <div key={card.label} className={`rounded-xl p-4 ${card.bg}`}>
                        <p className="text-2xl font-medium">{card.value ?? '—'}</p>
                        <p className="text-xs mt-1 opacity-70">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* District School Leaderboard */}
            {rankings?.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">District Leaderboard</h3>
                        {myRank && <span className="text-sm text-gray-600">Your school rank: #{myRank}</span>}
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Rank</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">School</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Eco-Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {rankings.slice(0, 5).map((school, idx) => {
                                    const rank = idx + 1;
                                    const highlight = myRank === rank || school._id === user?.profile?.schoolId;
                                    return (
                                        <tr key={school._id} className={highlight ? 'bg-emerald-50' : ''}>
                                            <td className="px-4 py-2 text-sm text-gray-700">#{rank}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{school.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{school.totalEcoPoints || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`${activeTab === 'approvals'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors`}
                            aria-current={activeTab === 'approvals' ? 'page' : undefined}
                        >
                            Pending Approvals
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`${activeTab === 'assignments'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors`}
                            aria-current={activeTab === 'assignments' ? 'page' : undefined}
                        >
                            Assignments Support
                        </button>
                        <button onClick={() => setActiveTab('appeals')}
                            className={`${activeTab === 'appeals' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors inline-flex items-center gap-2`}
                            aria-current={activeTab === 'appeals' ? 'page' : undefined}>
                            Appeals
                            {(dashData?.stats?.appealed_submissions_count || 0) > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                    {dashData.stats.appealed_submissions_count}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="py-4">
                {activeTab === 'approvals' && <PendingApprovals />}
                {activeTab === 'assignments' && <AssignmentsTab />}
                {activeTab === 'appeals' && <AppealsTab />}
            </div>
        </div>
    );
};

export default TeacherDashboard;
