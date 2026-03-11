import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchoolAdminImpact = () => {
    const [impactData, setImpactData] = useState(null);
    const [activityMetrics, setActivityMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [impactRes, activityRes] = await Promise.all([
                    axios.get('/api/v1/school-admin/impact'),
                    axios.get('/api/v1/school-admin/activity-metrics')
                ]);

                if (impactRes.data.success) setImpactData(impactRes.data.data);
                if (activityRes.data.success) setActivityMetrics(activityRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div>
            <div className="w-full h-40 bg-[var(--s2)] rounded-3xl animate-[shimmer_1.5s_infinite] mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[var(--s2)] h-32 rounded-2xl animate-[shimmer_1.5s_infinite]"></div>
                ))}
            </div>
        </div>
    );
    if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>;
    if (!impactData || !activityMetrics) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Impact Analytics</h1>
                <p className="text-gray-500 mt-2 text-lg">Detailed breakdown of environmental contributions and verification funnel.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Environmental Impact Breakdown */}
                <div className="bg-[var(--s1)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Total Environmental Output</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">🌳</div>
                                <div>
                                    <p className="text-sm font-semibold text-green-900">Trees Planted</p>
                                    <p className="text-2xl font-black text-green-700">{impactData.treesPlanted.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">💧</div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">Water Saved (Liters)</p>
                                    <p className="text-2xl font-black text-blue-700">{impactData.waterSaved.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">☁️</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">CO2 Prevented (kg)</p>
                                    <p className="text-2xl font-black text-gray-700">{impactData.co2Prevented.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">♻️</div>
                                <div>
                                    <p className="text-sm font-semibold text-orange-900">Plastic Reduced</p>
                                    <p className="text-2xl font-black text-orange-700">{impactData.plasticReduced.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">⚡</div>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-900">Energy Saved (kWh)</p>
                                    <p className="text-2xl font-black text-yellow-700">{impactData.energySaved.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Funnel */}
                <div className="space-y-8">
                    <div className="bg-[var(--s1)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Activity Verification Funnel</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative w-48 h-48 rounded-full border-8 border-indigo-100 flex items-center justify-center mb-6">
                                    <div className="text-center">
                                        <span className="block text-4xl font-black text-indigo-600">{activityMetrics.approvalRate}%</span>
                                        <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-1">Approval Rate</span>
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-green-500" strokeDasharray={`${activityMetrics.approvalRate * 2.89} 289`} />
                                    </svg>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <span className="w-3 h-3 rounded-full bg-green-500"></span> Approved
                                        </span>
                                        <span className="font-bold text-gray-900">{activityMetrics.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Pending Review
                                        </span>
                                        <span className="font-bold text-gray-900">{activityMetrics.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <span className="w-3 h-3 rounded-full bg-red-400"></span> Rejected
                                        </span>
                                        <span className="font-bold text-gray-900">{activityMetrics.rejected}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolAdminImpact;
