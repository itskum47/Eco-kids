import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ImpactCard from './ImpactCard';
import DailyChoices from './DailyChoices';
import ImpactComparison from './ImpactComparison';
import {
  fetchImpactBaseline,
  fetchImpactComparison,
  fetchImpactMetrics,
  fetchImpactTrend,
  saveImpactBaseline,
  submitDailyAction
} from './impactAPI';

const PERIODS = [
  { label: '7 Days', value: 'week' },
  { label: '30 Days', value: 'month' },
  { label: '90 Days', value: 'quarter' },
  { label: 'All Time', value: 'all-time' }
];

export default function MyEcoImpact() {
  const [period, setPeriod] = useState('month');
  const [metrics, setMetrics] = useState({});
  const [baseline, setBaseline] = useState(null);
  const [comparison, setComparison] = useState({});
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [baselineForm, setBaselineForm] = useState({
    showerDuration: 8,
    transportMode: 'bus',
    meatDaysPerWeek: 2,
    waterUsagePerDay: 120
  });

  const loadData = useCallback(async (selectedPeriod = period) => {
    setLoading(true);
    try {
      const [metricsData, baselineData, comparisonData, trendData] = await Promise.all([
        fetchImpactMetrics(selectedPeriod),
        fetchImpactBaseline(),
        fetchImpactComparison(selectedPeriod),
        fetchImpactTrend(6)
      ]);
      setMetrics(metricsData);
      setBaseline(baselineData);
      setComparison(comparisonData);
      setTrend(trendData);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load impact data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData(period);
  }, [loadData, period]);

  const handleDailyAction = useCallback(async (payload) => {
    try {
      const data = await submitDailyAction(payload);
      toast.success(data?.message || 'Daily action logged');
      await loadData(period);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to log action');
    }
  }, [loadData, period]);

  const handleBaselineSubmit = async (event) => {
    event.preventDefault();
    try {
      await saveImpactBaseline(baselineForm);
      toast.success('Baseline saved for comparison');
      await loadData(period);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save baseline');
    }
  };

  const co2Status = useMemo(() => {
    const current = Number(metrics.co2 || 0);
    const baselineCo2 = Number(baseline?.co2 || 0);
    if (!baselineCo2) return 'Set your baseline to see progress';
    const diff = baselineCo2 - current;
    const pct = (diff / baselineCo2) * 100;
    return `${pct >= 0 ? 'Down' : 'Up'} ${Math.abs(pct).toFixed(1)}% from baseline`;
  }, [metrics.co2, baseline]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dcfce7,transparent_55%),radial-gradient(circle_at_bottom_left,#e0f2fe,transparent_45%),#f8fafc] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-emerald-200 bg-white/95 p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">My Eco Impact</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Your monthly CO2 footprint: {Number(metrics.co2 || 0).toFixed(1)} kg</h1>
              <p className="mt-1 text-sm text-slate-600">{co2Status}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
              {PERIODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPeriod(item.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${period === item.value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactCard title="Water Saved" value={metrics.water} unit="L" icon="💧" tone="blue" />
          <ImpactCard title="Plastic Avoided" value={metrics.plastic} unit="kg" icon="♻️" tone="amber" />
          <ImpactCard title="Energy Saved" value={metrics.energy} unit="kWh" icon="⚡" tone="teal" />
          <ImpactCard title="Trees Planted" value={metrics.trees} unit="trees" icon="🌱" tone="green" />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <DailyChoices onSubmit={handleDailyAction} loading={loading} />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Set Baseline (Optional)</h2>
            <p className="mt-1 text-sm text-slate-600">Create your before/after benchmark for monthly comparison.</p>
            <form onSubmit={handleBaselineSubmit} className="mt-4 space-y-3">
              <Field label="Shower duration (minutes)">
                <input type="number" min="1" max="30" value={baselineForm.showerDuration} onChange={(e) => setBaselineForm((p) => ({ ...p, showerDuration: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </Field>
              <Field label="Transport mode">
                <select value={baselineForm.transportMode} onChange={(e) => setBaselineForm((p) => ({ ...p, transportMode: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="walk">Walk</option>
                </select>
              </Field>
              <Field label="Meat meals per week">
                <input type="number" min="0" max="7" value={baselineForm.meatDaysPerWeek} onChange={(e) => setBaselineForm((p) => ({ ...p, meatDaysPerWeek: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </Field>
              <Field label="Water usage per day (L)">
                <input type="number" min="0" value={baselineForm.waterUsagePerDay} onChange={(e) => setBaselineForm((p) => ({ ...p, waterUsagePerDay: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </Field>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Save Baseline</button>
            </form>
          </section>
        </div>

        <ImpactComparison comparison={comparison} trend={trend} />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
    </label>
  );
}
