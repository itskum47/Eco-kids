import React, { useState, useEffect } from 'react';
import { School, Users, UserCog, Leaf, Trees, Droplet, Cloud, Recycle } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const DistrictAdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [veiAsm, setVeiAsm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, veiRes] = await Promise.all([
                    apiRequest('GET', '/district-admin/dashboard'),
                    apiRequest('GET', '/district-admin/vei-asm').catch(() => null)
                ]);
                if (dashRes.success || dashRes.data) {
                    setMetrics(dashRes.data || dashRes);
                }
                if (veiRes?.success || veiRes?.data) {
                    setVeiAsm(veiRes.data || veiRes);
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">District Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg">Top-level operational metrics for <strong className="text-slate-700 font-semibold">{metrics.districtName}</strong>, {metrics.stateName}.</p>
                </div>
                <div className="bg-[var(--s1)] border border-slate-200 shadow-sm rounded-lg px-4 py-2 flex items-center justify-between md:min-w-[200px]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync Status</span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1: Schools */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                            <School className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Schools</p>
                            <p className="text-4xl font-semibold tabular-nums text-slate-900">{metrics.totalSchools.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 2: Students */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Students</p>
                            <p className="text-4xl font-semibold tabular-nums text-slate-900">{metrics.totalStudents.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 3: Teachers */}
                <div className="bg-[var(--s1)] rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100/50">
                            <UserCog className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teachers</p>
                            <p className="text-4xl font-semibold tabular-nums text-slate-900">{metrics.totalTeachers.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Metric 4: Total Eco Points */}
                <div className="bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-700 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600">
                            <Leaf className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">District EcoPoints</p>
                            <p className="text-4xl font-semibold tabular-nums text-white">{metrics.totalEcoPoints.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VEI/ASM North Star Metric */}
            {veiAsm && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">North Star Metric</p>
                            <h3 className="text-2xl font-bold mt-1">VEI / ASM</h3>
                            <p className="text-sm text-emerald-100 mt-1">Verified Environmental Impact per Active Student per Month</p>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-bold tabular-nums">{veiAsm.veiPerAsm}</p>
                            <p className="text-xs text-emerald-200 mt-1">Score</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-emerald-500/30">
                        <div>
                            <p className="text-xs text-emerald-200 font-medium">VEI Score</p>
                            <p className="text-lg font-semibold tabular-nums">{veiAsm.veiScore.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-200 font-medium">Active Students (30d)</p>
                            <p className="text-lg font-semibold tabular-nums">{veiAsm.activeStudentsMonthly}</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-200 font-medium">Total Students</p>
                            <p className="text-lg font-semibold tabular-nums">{veiAsm.totalStudents}</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-200 font-medium">Total Activities</p>
                            <p className="text-lg font-semibold tabular-nums">{veiAsm.totalActivities}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Environmental Impact Summary */}
            <div className="pt-4 border-b border-slate-200 pb-2 flex justify-between items-end">
                <h2 className="text-xl font-bold text-slate-900">District Environmental Output</h2>
                <span className="text-xs text-slate-500 font-medium tracking-wide">Last calculated: {new Date().toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--s1)] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">Trees Planted</p>
                        <p className="text-3xl font-semibold tabular-nums text-slate-800">{metrics.totalImpact.treesPlanted.toLocaleString()}</p>
                    </div>
                    <div><Trees className="w-8 h-8 text-emerald-600 opacity-80" /></div>
                </div>
                <div className="bg-[var(--s1)] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">Water Saved (L)</p>
                        <p className="text-3xl font-semibold tabular-nums text-slate-800">{metrics.totalImpact.waterSaved.toLocaleString()}</p>
                    </div>
                    <div><Droplet className="w-8 h-8 text-blue-500 opacity-80" /></div>
                </div>
                <div className="bg-[var(--s1)] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">CO2 Prevented (kg)</p>
                        <p className="text-3xl font-semibold tabular-nums text-slate-800">{metrics.totalImpact.co2Prevented.toLocaleString()}</p>
                    </div>
                    <div><Cloud className="w-8 h-8 text-slate-400 opacity-80" /></div>
                </div>
                <div className="bg-[var(--s1)] p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mb-1">Plastic Reduced</p>
                        <p className="text-3xl font-semibold tabular-nums text-slate-800">{metrics.totalImpact.plasticReduced.toLocaleString()}</p>
                    </div>
                    <div><Recycle className="w-8 h-8 text-green-600 opacity-80" /></div>
                </div>
            </div>
        </div>
    );
};

export default DistrictAdminDashboard;
