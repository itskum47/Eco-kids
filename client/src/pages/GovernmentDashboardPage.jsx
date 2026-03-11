import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const GovernmentDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/v1/government/dashboard/summary');
        setSummary(data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load government dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-gray-700">Loading government dashboard...</div>;
  }

  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-red-700">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
        <h1 className="text-3xl font-extrabold">Government Reporting Dashboard</h1>
        <p className="mt-2 text-slate-200">State-level compliance and reporting metrics for official review.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Readiness Score" value={`${summary?.metrics?.readinessScore || 0}/100`} />
        <MetricCard label="Reports" value={summary?.metrics?.reportsCount || 0} />
        <MetricCard label="Schools" value={summary?.metrics?.schoolsCount || 0} />
        <MetricCard label="Students" value={summary?.metrics?.studentsCount || 0} />
        <MetricCard label="Approved Submissions" value={summary?.metrics?.approvedSubmissions || 0} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Government Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-2 pr-4">Report ID</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.latestReports || []).map((report) => (
                <tr key={report._id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">{report.reportId}</td>
                  <td className="py-2 pr-4">{report.state || '-'}</td>
                  <td className="py-2 pr-4">{report.district || '-'}</td>
                  <td className="py-2 pr-4">{report.status}</td>
                  <td className="py-2 pr-4">{new Date(report.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(summary?.latestReports || []).length === 0 && (
            <p className="text-sm text-gray-600 mt-3">No reports available for the selected scope.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">{label}</p>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

export default GovernmentDashboardPage;
