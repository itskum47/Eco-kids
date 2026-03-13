const THEME_MAP = {
  emerald: {
    wrapper: 'border-emerald-100 bg-white/85',
    eyebrow: 'text-emerald-700',
  },
  cyan: {
    wrapper: 'border-cyan-100 bg-white/85',
    eyebrow: 'text-cyan-700',
  },
  violet: {
    wrapper: 'border-violet-100 bg-white/90',
    eyebrow: 'text-violet-700',
  },
};

const GameHeader = ({ eyebrow, title, subtitle, badges = [], theme = 'emerald' }) => {
  const style = THEME_MAP[theme] || THEME_MAP.emerald;

  return (
    <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border p-5 shadow-xl backdrop-blur ${style.wrapper}`}>
      <div>
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${style.eyebrow}`}>{eyebrow}</p>
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="ml-auto flex flex-wrap gap-3 text-sm font-bold">
        {badges.map((badge) => (
          <div key={badge.id} className={`rounded-full px-4 py-2 ${badge.className}`}>
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameHeader;
