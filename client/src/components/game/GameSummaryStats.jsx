const GameSummaryStats = ({ title, ctaLabel, onCta, stats }) => {
  return (
    <div className="rounded-[34px] border border-emerald-100 bg-white p-8 shadow-2xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onCta}
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white"
        >
          {ctaLabel}
        </button>
      </div>
      <div className={`grid gap-4 ${stats.length >= 4 ? 'md:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {stats.map((item) => (
          <div key={item.id} className={`rounded-3xl p-4 text-center ${item.className}`}>
            <div className="text-sm font-bold">{item.label}</div>
            <div className="text-3xl font-black text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSummaryStats;
