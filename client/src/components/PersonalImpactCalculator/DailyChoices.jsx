import React, { useMemo, useState } from 'react';

const ACTIONS = [
  { actionType: 'shower-5min', label: 'I took a 5-min shower', co2: 0.5 },
  { actionType: 'segregated-waste', label: 'I segregated waste today', co2: 0.25 },
  { actionType: 'turned-off-lights', label: 'I turned off lights', co2: 0.14 },
  { actionType: 'bus-instead-of-car', label: 'I used bus instead of car', co2: 2 },
  { actionType: 'planted-something', label: 'I planted something', co2: 20 }
];

export default function DailyChoices({ onSubmit, loading }) {
  const [selected, setSelected] = useState('');
  const [customText, setCustomText] = useState('');
  const [customCo2, setCustomCo2] = useState('');

  const selectedAction = useMemo(
    () => ACTIONS.find((item) => item.actionType === selected),
    [selected]
  );

  const handlePreset = async (actionType) => {
    setSelected(actionType);
    await onSubmit({ actionType, date: new Date().toISOString() });
  };

  const handleCustom = async (event) => {
    event.preventDefault();
    if (!customText.trim()) return;

    await onSubmit({
      actionType: `custom-${customText.trim().toLowerCase().replace(/\s+/g, '-')}`,
      customImpact: {
        co2Prevented: Number(customCo2 || 0)
      },
      date: new Date().toISOString()
    });

    setCustomText('');
    setCustomCo2('');
  };

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold text-slate-900">My Daily Choices</h2>
      <p className="mt-1 text-sm text-slate-600">Single tap logging for eco actions.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <button
            key={action.actionType}
            type="button"
            onClick={() => handlePreset(action.actionType)}
            disabled={loading}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div>{action.label}</div>
            <div className="mt-1 text-xs text-emerald-700">Approx CO2 saved: {action.co2} kg</div>
          </button>
        ))}
      </div>

      {selectedAction ? (
        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Logged: {selectedAction.label}
        </div>
      ) : null}

      <form onSubmit={handleCustom} className="mt-5 space-y-3 rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-900">Add custom action</h3>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Describe your action"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={customCo2}
          onChange={(e) => setCustomCo2(e.target.value)}
          placeholder="Estimated CO2 saved (kg)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          Save Custom Action
        </button>
      </form>
    </section>
  );
}
