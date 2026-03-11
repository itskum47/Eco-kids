import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StateAdminImpact = () => {
    const [impactData, setImpactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/state-admin/impact');
                if (response.data.success) {
                    setImpactData(response.data.data);
                }
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
    if (!impactData) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Macro State Analytics</h1>
                <p className="text-slate-500 mt-2 text-lg">Top-level environmental verification and aggregation metrics for the entire state territory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-2">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">State-Wide Impact Summary</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase mb-3">Verified Student Activities</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-slate-900">{impactData.totalActivities.toLocaleString()}</p>
                                <span className="text-2xl opacity-60">✅</span>
                            </div>
                        </div>

                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 shadow-sm">
                            <p className="text-sky-700 font-bold tracking-widest text-xs uppercase mb-3">Litres of Water Saved</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-sky-900">{impactData.waterSaved.toLocaleString()}</p>
                                <span className="text-2xl opacity-80">💧</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-sm">
                            <p className="text-emerald-700 font-bold tracking-widest text-xs uppercase mb-3">Trees Planted</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-emerald-900">{impactData.treesPlanted.toLocaleString()}</p>
                                <span className="text-2xl opacity-80">🌳</span>
                            </div>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 text-white rounded-xl p-6 shadow-sm">
                            <p className="text-neutral-400 font-bold tracking-widest text-xs uppercase mb-3">kg of CO2 Prevented</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-white">{impactData.co2Prevented.toLocaleString()}</p>
                                <span className="text-2xl opacity-80">☁️</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                            <p className="text-amber-700 font-bold tracking-widest text-xs uppercase mb-3">Energy Saved (kWh)</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-amber-900">{impactData.energySaved.toLocaleString()}</p>
                                <span className="text-2xl opacity-80">⚡</span>
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm">
                            <p className="text-rose-700 font-bold tracking-widest text-xs uppercase mb-3">Plastic Reduced</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-rose-900">{impactData.plasticReduced.toLocaleString()}</p>
                                <span className="text-2xl opacity-80">♻️</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StateAdminImpact;
