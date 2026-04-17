import React from 'react';

export default function ImpactCard({ title, value, unit, icon, tone = 'green' }) {
  const toneMap = {
    green: 'from-emerald-500 to-lime-500',
    blue: 'from-sky-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
    teal: 'from-teal-500 to-emerald-500'
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-lg" aria-hidden="true">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-black tracking-tight text-slate-900">{Number(value || 0).toFixed(1).replace('.0', '')}</p>
        <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{unit}</p>
      </div>
      <div className={`mt-4 h-2 rounded-full bg-gradient-to-r ${toneMap[tone] || toneMap.green}`} />
    </div>
  );
}
