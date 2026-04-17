import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ImpactComparison({ comparison, trend }) {
  const delta = comparison?.delta || {};
  const current = comparison?.current || {};
  const baseline = comparison?.baseline || {};
  const percent = Number(delta.percentChange || 0);
  const good = percent >= 0;

  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">Impact Comparison</h2>
      <p className="mt-1 text-sm text-slate-600">Baseline vs current monthly impact.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DeltaCard label="CO2 change" value={`${percent.toFixed(1)}%`} good={good} />
        <DeltaCard label="Water delta" value={`${Number(delta.waterDelta || 0).toFixed(1)} L`} good={Number(delta.waterDelta || 0) >= 0} />
        <DeltaCard label="Plastic delta" value={`${Number(delta.plasticDelta || 0).toFixed(1)} kg`} good={Number(delta.plasticDelta || 0) >= 0} />
        <DeltaCard label="Energy delta" value={`${Number(delta.energyDelta || 0).toFixed(1)} kWh`} good={Number(delta.energyDelta || 0) >= 0} />
      </div>

      <div className="mt-6 h-64 rounded-2xl bg-slate-50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend || []}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="baselineCo2" stroke="#ef4444" strokeDasharray="6 4" name="Baseline CO2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="co2" stroke="#16a34a" name="Current CO2" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        Current: CO2 {Number(current.co2 || 0).toFixed(1)} kg, Water {Number(current.water || 0).toFixed(1)} L, Plastic {Number(current.plastic || 0).toFixed(1)} kg, Energy {Number(current.energy || 0).toFixed(1)} kWh.
        {' '}
        Baseline CO2: {Number(baseline.co2 || 0).toFixed(1)} kg.
      </div>
    </section>
  );
}

function DeltaCard({ label, value, good }) {
  return (
    <div className={`rounded-xl border px-3 py-4 text-center ${good ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
      <div className={`mt-2 text-lg font-black ${good ? 'text-emerald-700' : 'text-rose-700'}`}>{value}</div>
    </div>
  );
}
