import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';

const StateAdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await apiRequest('GET', '/state-admin/dashboard');
                if (response.success || response.data) {
                    setMetrics(response.data || response);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
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
    if (!metrics) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">State Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg">High-level environmental policy metrics for the state of <strong className="text-slate-800 font-bold uppercase tracking-widest">{metrics.stateName}</strong>.</p>
                </div>
                <div className="bg-[var(--s1)] border border-slate-200 shadow-sm rounded-lg px-4 py-2 flex items-center justify-between md:min-w-[200px]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Sync</span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Real-time
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Metric 1: Districts */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200/60 ring-1 ring-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
                            <span className="text-2xl">📍</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Districts</p>
                            <p className="text-3xl font-black text-slate-900">{metrics.totalDistricts.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 2: Schools */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200/60 ring-1 ring-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
                            <span className="text-2xl">🏫</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Schools</p>
                            <p className="text-3xl font-black text-slate-900">{metrics.totalSchools.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 3: Students */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200/60 ring-1 ring-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/50">
                            <span className="text-2xl">👨‍🎓</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled Students</p>
                            <p className="text-3xl font-black text-slate-900">{metrics.totalStudents.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 4: Total Eco Points */}
                <div className="bg-neutral-900 rounded-xl shadow-sm p-6 border border-neutral-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/20 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-800">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest drop-shadow-sm">State EcoPoints</p>
                            <p className="text-3xl font-black">{metrics.totalEcoPoints.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Environmental Impact Summary */}
            <h2 className="text-xl font-bold text-slate-900 pt-4 border-b border-slate-200 pb-2">Macro Environmental Output</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--s1)] p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
                    <div className="text-4xl mb-2">🌳</div>
                    <p className="text-3xl font-black text-slate-800">{metrics.totalImpact.treesPlanted.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Trees Planted</p>
                </div>
                <div className="bg-[var(--s1)] p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
                    <div className="text-4xl mb-2">💧</div>
                    <p className="text-3xl font-black text-slate-800">{metrics.totalImpact.waterSaved.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Water Saved (L)</p>
                </div>
                <div className="bg-[var(--s1)] p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
                    <div className="text-4xl mb-2">☁️</div>
                    <p className="text-3xl font-black text-slate-800">{metrics.totalImpact.co2Prevented.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">CO2 Prevented (kg)</p>
                </div>
                <div className="bg-[var(--s1)] p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
                    <div className="text-4xl mb-2">♻️</div>
                    <p className="text-3xl font-black text-slate-800">{metrics.totalImpact.plasticReduced.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Plastic Reduced</p>
                </div>
            </div>
        </div>
    );
};

export default StateAdminDashboard;
