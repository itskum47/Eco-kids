import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StateAdminDistricts = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await axios.get('/api/state-admin/districts');
                if (response.data.success) {
                    setDistricts(response.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching district network data');
            } finally {
                setLoading(false);
            }
        };
        fetchDistricts();
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

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">District Network</h1>
                    <p className="text-slate-500 mt-2">Activity and engagement aggregates across all registered districts in your state.</p>
                </div>
                <div className="text-sm font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    {districts.length} Active Districts
                </div>
            </div>

            <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">District Name</th>
                                <th scope="col" className="px-6 py-4">Schools Enrolled</th>
                                <th scope="col" className="px-6 py-4">Total Students</th>
                                <th scope="col" className="px-6 py-4">Total EcoPoints</th>
                                <th scope="col" className="px-6 py-4 text-right">CO2 Prevented (kg)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {districts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No districts actively participating in your state yet.</td>
                                </tr>
                            ) : (
                                districts.map((district) => (
                                    <tr key={district.districtName} className="bg-[var(--s1)] hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200 uppercase">
                                                {district.districtName.substring(0, 2)}
                                            </div>
                                            {district.districtName}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-indigo-600">
                                            {district.schoolCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {district.studentCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-black tracking-tight text-emerald-600">
                                            {district.totalEcoPoints.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                                            {district.co2Prevented.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StateAdminDistricts;
