import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const SDGImpactPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/v1/sdg/overview');
        setOverview(data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load SDG impact data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-green-700 font-semibold">Loading SDG impact...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-6">
        <h1 className="text-3xl font-extrabold">SDG Progress Tracking</h1>
        <p className="mt-2 text-emerald-100">
          Live impact mapping aligned with UN SDGs and Indian school sustainability programs.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700 uppercase tracking-wide font-bold">Total SDG-linked submissions</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{overview?.totalSubmissions || 0}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm text-blue-700 uppercase tracking-wide font-bold">SDG goals touched</p>
          <p className="text-3xl font-black text-blue-900 mt-1">{overview?.goals?.length || 0}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Goal-wise impact</h2>
        <div className="space-y-3">
          {(overview?.goals || []).map((goal) => (
            <div key={goal.goal} className="rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: goal.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold text-gray-900">SDG {goal.goal}</p>
                  <p className="text-sm text-gray-600">{goal.title}</p>
                </div>
              </div>
              <p className="text-lg font-extrabold text-gray-900">{goal.submissions}</p>
            </div>
          ))}
          {(!overview?.goals || overview.goals.length === 0) && (
            <div className="text-gray-600 text-sm">No SDG-linked submissions found for the selected scope.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SDGImpactPage;
