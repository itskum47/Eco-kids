import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

const formatNumber = (value) => Number(value || 0).toLocaleString();

const SchoolAdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [activityMetrics, setActivityMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError('');

                const [dashboardRes, activityRes] = await Promise.all([
                    apiRequest('GET', '/v1/school-admin/dashboard'),
                    apiRequest('GET', '/v1/school-admin/activity-metrics')
                ]);

                setDashboard(dashboardRes?.data || dashboardRes || null);
                setActivityMetrics(activityRes?.data || activityRes || null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load school admin dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const derivedStats = useMemo(() => {
        const totalStudents = Number(dashboard?.totalStudents || 0);
        const totalTeachers = Number(dashboard?.totalTeachers || 0);
        const activeThisWeek = Number(dashboard?.recentActivityCount || 0);
        const totalEcoPoints = Number(dashboard?.totalEcoPoints || 0);
        const avgEcoScore = totalStudents > 0 ? Math.round(totalEcoPoints / totalStudents) : 0;

        return {
            totalStudents,
            totalTeachers,
            activeThisWeek,
            avgEcoScore
        };
    }, [dashboard]);

    const feedItems = useMemo(() => {
        if (!activityMetrics && !dashboard) return [];

        return [
            {
                id: 'week-activity',
                title: `${formatNumber(dashboard?.recentActivityCount)} activities recorded this week`,
                subtitle: 'Weekly engagement update',
                tone: 'bg-green-100 text-green-700'
            },
            {
                id: 'approved',
                title: `${formatNumber(activityMetrics?.approved)} activities approved`,
                subtitle: 'Verified by teachers',
                tone: 'bg-emerald-100 text-emerald-700'
            },
            {
                id: 'pending',
                title: `${formatNumber(activityMetrics?.pending)} activities pending review`,
                subtitle: 'Awaiting teacher action',
                tone: 'bg-amber-100 text-amber-700'
            },
            {
                id: 'rejected',
                title: `${formatNumber(activityMetrics?.rejected)} activities rejected`,
                subtitle: 'Needs correction and resubmission',
                tone: 'bg-red-100 text-red-700'
            }
        ];
    }, [activityMetrics, dashboard]);

    const handleDownloadData = () => {
        const payload = {
            exportedAt: new Date().toISOString(),
            schoolName: dashboard?.schoolName || 'School',
            dashboard,
            activityMetrics
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `school-admin-dashboard-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-72 rounded-xl bg-gray-200 animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">School Admin Dashboard</h1>
                <p className="mt-1 text-gray-600">Overview for {dashboard?.schoolName || 'your school'}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{formatNumber(derivedStats.totalStudents)}</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{formatNumber(derivedStats.totalTeachers)}</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-600">Active This Week</p>
                    <p className="mt-2 text-3xl font-bold text-green-700">{formatNumber(derivedStats.activeThisWeek)}</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-600">Avg Eco Score</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{formatNumber(derivedStats.avgEcoScore)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity Feed</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {feedItems.map((item) => (
                            <div key={item.id} className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                                <div>
                                    <p className="font-medium text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.tone}`}>Live</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            to="/school-admin/teachers"
                            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center font-semibold text-green-700 hover:bg-green-100"
                        >
                            Add Teacher
                        </Link>
                        <Link
                            to="/school-admin/students"
                            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center font-semibold text-green-700 hover:bg-green-100"
                        >
                            Add Student
                        </Link>
                        <Link
                            to="/school-admin/analytics"
                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            View Reports
                        </Link>
                        <button
                            type="button"
                            onClick={handleDownloadData}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Download Data
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SchoolAdminDashboard;
