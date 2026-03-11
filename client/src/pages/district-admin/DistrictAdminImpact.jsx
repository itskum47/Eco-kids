import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Droplet, Trees, Cloud, Zap, Recycle, Download, Loader2 } from 'lucide-react';

const DistrictAdminImpact = () => {
    const [impactData, setImpactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    // Assuming we also want to fetch the district name to include in the CSV
    const [districtName, setDistrictName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetching district dashboard to get the district name,
                // Alternatively, the impact endpoint could return districtName as well
                const [impactRes, dashboardRes] = await Promise.all([
                    apiRequest('GET', '/district-admin/impact'),
                    apiRequest('GET', '/district-admin/dashboard')
                ]);

                if (impactRes.success && dashboardRes.success) {
                    setImpactData(impactRes.data);
                    setDistrictName(dashboardRes.data.districtName);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExportCsv = async () => {
        try {
            setExporting(true);
            const response = await apiRequest('GET', '/district-admin/schools');

            if (!response.success || !response.data || response.data.length === 0) {
                toast.error('No school data found to export');
                setExporting(false);
                return;
            }

            const schoolsData = response.data;

            // Generate CSV Headers
            const headers = [
                'District',
                'School Name',
                'UDISE Code',
                'Total Students',
                'Total Verified Actions',
                'Total CO₂ Offset (kg)',
                'Total Water Saved (L)',
                'Total Energy Saved (kWh)'
            ];

            // Generate CSV Rows
            const csvRows = [headers.join(',')];

            const sanitizeCsvValue = (val) => {
                if (val === null || val === undefined) return 0;
                if (typeof val === 'number') return val; // Raw integer
                if (typeof val === 'string') {
                    // Prevent Excel formula injection
                    let clean = val;
                    if (/^[=+\-@]/.test(clean)) {
                        clean = "'" + clean;
                    }
                    // Escape quotes
                    return `"${clean.replace(/"/g, '""')}"`;
                }
                return val;
            };

            schoolsData.forEach(school => {
                const row = [
                    sanitizeCsvValue(districtName || 'Unknown'),
                    sanitizeCsvValue(school._id || 'Unknown School'),
                    sanitizeCsvValue(school.schoolId || 'N/A'),
                    school.studentCount || 0,
                    school.totalActivities || 0,
                    school.co2Prevented || 0,
                    school.waterSaved || 0,
                    school.energySaved || 0
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Get local date string YYYY-MM-DD
            const today = new Date();
            const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `District_Impact_Report_${localDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export CSV report');
        } finally {
            setExporting(false);
        }
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Broad Analytics</h1>
                    <p className="text-slate-500 mt-2 text-lg">Cross-district environmental verification and yield monitoring.</p>
                </div>
                <div>
                    <button
                        onClick={handleExportCsv}
                        disabled={exporting}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors w-full sm:w-auto"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Exporting Data...
                            </>
                        ) : (
                            <>
                                <Download className="-ml-1 mr-2 h-5 w-5" />
                                Export District Report (.csv)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-2">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">District Wide Impact Metrics</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="bg-[var(--s1)] border border-slate-200 rounded-xl p-5 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-wide text-xs uppercase mb-3">Verified Activities</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-slate-800">{impactData.totalActivities.toLocaleString()}</p>
                                <CheckCircle2 className="w-8 h-8 text-indigo-600 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-[var(--s1)] border border-slate-200 rounded-xl p-5 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-wide text-xs uppercase mb-3">Litres of Water Saved</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-slate-800">{impactData.waterSaved.toLocaleString()}</p>
                                <Droplet className="w-8 h-8 text-blue-500 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-[var(--s1)] border border-slate-200 rounded-xl p-5 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-wide text-xs uppercase mb-3">Trees Planted</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-slate-800">{impactData.treesPlanted.toLocaleString()}</p>
                                <Trees className="w-8 h-8 text-emerald-600 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 text-white rounded-xl p-5 shadow-sm">
                            <p className="text-slate-400 font-bold tracking-wide text-xs uppercase mb-3">kg of CO2 Prevented</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-white">{impactData.co2Prevented.toLocaleString()}</p>
                                <Cloud className="w-8 h-8 text-slate-400 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-[var(--s1)] border border-slate-200 rounded-xl p-5 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-wide text-xs uppercase mb-3">Energy Saved (kWh)</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-slate-800">{impactData.energySaved.toLocaleString()}</p>
                                <Zap className="w-8 h-8 text-amber-500 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-[var(--s1)] border border-slate-200 rounded-xl p-5 shadow-sm">
                            <p className="text-slate-500 font-bold tracking-wide text-xs uppercase mb-3">Plastic Reduced</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-semibold tabular-nums text-slate-800">{impactData.plasticReduced.toLocaleString()}</p>
                                <Recycle className="w-8 h-8 text-green-600 opacity-80" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistrictAdminImpact;
