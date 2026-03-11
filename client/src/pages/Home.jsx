import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useGradeBand } from '../hooks/useGradeBand';

// ── Animated count-up card ────────────────────────────────────────────────────
const StatCard = ({ target, label, color }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const duration = 2000;
          const tick = (now) => {
            const p = Math.min((now - t0) / duration, 1);
            const eased = 1 - (1 - p) ** 3;
            setCount(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const display =
    count >= 1_000_000
      ? `${(count / 1_000_000).toFixed(1)}M`
      : count >= 10_000
        ? `${Math.round(count / 1000)}k`
        : count >= 1000
          ? `${(count / 1000).toFixed(1)}k`
          : count;

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-4 border border-[#e8f5e9] shadow-sm text-center"
    >
      <div className="font-mono font-black text-3xl mb-1" style={{ color }}>
        {display}
      </div>
      <div className="text-xs font-bold text-[#7a9b72] uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

// ── Main Home ─────────────────────────────────────────────────────────────────
const Home = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { band, label: bandLabel, emoji: bandEmoji } = useGradeBand();
  const [liveStats, setLiveStats] = useState({
    treesPlanted: 0,
    co2Saved: 0,
    waterSaved: 0,
    schoolsJoined: 0
  });

  useEffect(() => {
    const loadImpactStats = async () => {
      try {
        const response = await fetch('/api/v1/impact/stats');
        const payload = await response.json();
        if (response.ok && payload?.data) {
          setLiveStats({
            treesPlanted: payload.data.treesPlanted || 0,
            co2Saved: payload.data.co2Saved || 0,
            waterSaved: payload.data.waterSaved || 0,
            schoolsJoined: payload.data.schoolsJoined || 0
          });
        }
      } catch (_) {
      }
    };

    loadImpactStats();
  }, []);

  const missionIcons = [
    { icon: '🌲', key: 'mission.trees' },
    { icon: '♻️', key: 'mission.recycling' },
    { icon: '⚡', key: 'mission.energy' },
    { icon: '🦋', key: 'mission.animals' },
    { icon: '💧', key: 'mission.water' },
    { icon: '🌱', key: 'mission.soil' },
    { icon: '🏫', key: 'mission.schools' },
    { icon: '🌍', key: 'mission.planet' },
  ];

  const games = [
    { emoji: '♻️', name: t('game.waste_sort'), bg: 'linear-gradient(135deg,#a5d6a7,#e8f5e9)', to: '/games' },
    { emoji: '💧', name: t('game.water_journey'), bg: 'linear-gradient(135deg,#b3e5fc,#e1f5fe)', to: '/games' },
    { emoji: '🌳', name: t('game.tree_plant'), bg: 'linear-gradient(135deg,#dcedc8,#f1f8e9)', to: '/games' },
    { emoji: '🌍', name: t('game.climate_sim'), bg: 'linear-gradient(135deg,#ffe0b2,#fff8e1)', to: '/games' },
  ];

  const topics = [
    {
      emoji: '🌡️', category: t('category.climate'), title: t('topic.climate_title'),
      bg: 'linear-gradient(135deg,#fff8e1,#fff3e0)',
      chip: { bg: '#fff8e1', border: '#ffe082', text: '#e65100' },
      to: '/topics?category=climate',
    },
    {
      emoji: '🦋', category: t('category.biodiversity'), title: t('topic.bio_title'),
      bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
      chip: { bg: '#e8f5e9', border: '#a5d6a7', text: '#1b5e20' },
      to: '/topics?category=biodiversity',
    },
    {
      emoji: '💧', category: t('category.water'), title: t('topic.water_title'),
      bg: 'linear-gradient(135deg,#e1f5fe,#b3e5fc)',
      chip: { bg: '#e1f5fe', border: '#b3e5fc', text: '#01579b' },
      to: '/topics?category=water',
    },
    {
      emoji: '♻️', category: t('category.waste'), title: t('topic.waste_title'),
      bg: 'linear-gradient(135deg,#fce4ec,#f8bbd0)',
      chip: { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f' },
      to: '/topics?category=waste',
    },
  ];

  // Sun ray positions
  const sunRays = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="min-h-screen bg-[#f9fffe]">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-14">

          {/* ── Left: Text col ─────────────────────────────────── */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-bold text-[#2e7d32] mb-2 tracking-widest uppercase">
              {t('home.welcome')}
            </p>

            <h1
              className="font-black text-[#064e17] leading-[1.08] mb-3"
              style={{ fontSize: 'clamp(34px, 5.5vw, 72px)' }}
            >
              {t('home.title')}
            </h1>

            <p className="text-xl font-bold text-[#145214] mb-4">
              {t('home.subtitle')}
            </p>

            <p className="text-[15px] text-[#1a3a1a] max-w-lg mb-8 leading-relaxed">
              {t('home.description')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              <Link
                to="/games"
                className="px-8 py-3.5 rounded-full bg-[#2e7d32] text-white font-black text-base tracking-wide shadow-[0_4px_20px_rgba(46,125,50,.35)] hover:bg-[#1b5e20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                {t('home.playCta')} 🎮
              </Link>
              <Link
                to="/topics"
                className="px-8 py-3.5 rounded-full border-2 border-[#2e7d32] text-[#2e7d32] font-bold text-base hover:bg-[#e8f5e9] transition-all duration-200"
              >
                {t('home.exploreCta')} →
              </Link>
            </div>

            {/* Web App CTA — mobile app coming soon */}
            <div className="flex items-center justify-center md:justify-start flex-wrap">
              <div className="relative group inline-block">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-[#2e7d32] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1b5e20] transition-colors shadow-md"
                >
                  📱 {t('home.tryWebApp')} →
                </Link>
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-[#0a1e0a] text-[#f9fffe] text-xs font-semibold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('home.mobileAppComingSoon')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Indian children SVG ──────────────────────── */}
          <div className="flex-shrink-0 w-full md:w-[420px]">
            <svg
              viewBox="0 0 440 420"
              className="w-full drop-shadow-xl"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Two Indian children holding a globe and a sapling"
              role="img"
            >
              <defs>
                <radialGradient id="bgGradHome" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c8e6c9" />
                  <stop offset="100%" stopColor="#e8f5e9" />
                </radialGradient>
              </defs>

              {/* Background circle */}
              <circle cx="220" cy="210" r="200" fill="url(#bgGradHome)" />

              {/* Sky */}
              <path
                d="M60,120 Q220,20 380,120 L380,210 Q220,160 60,210 Z"
                fill="#BBDEFB"
                opacity="0.45"
              />

              {/* Sun */}
              <circle cx="340" cy="78" r="34" fill="#FFD54F" />
              {sunRays.map((deg, i) => (
                <line
                  key={i}
                  x1={340 + Math.cos((deg * Math.PI) / 180) * 39}
                  y1={78 + Math.sin((deg * Math.PI) / 180) * 39}
                  x2={340 + Math.cos((deg * Math.PI) / 180) * 52}
                  y2={78 + Math.sin((deg * Math.PI) / 180) * 52}
                  stroke="#FFD54F"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}

              {/* Hills */}
              <ellipse cx="100" cy="375" rx="210" ry="85" fill="#4CAF50" opacity="0.5" />
              <ellipse cx="350" cy="390" rx="180" ry="78" fill="#2E7D32" opacity="0.62" />
              <ellipse cx="220" cy="402" rx="265" ry="68" fill="#388E3C" opacity="0.38" />

              {/* Trees */}
              <rect x="90" y="294" width="8" height="40" rx="2" fill="#5D4037" />
              <ellipse cx="94" cy="286" rx="22" ry="26" fill="#388E3C" />
              <rect x="333" y="304" width="7" height="36" rx="2" fill="#5D4037" />
              <ellipse cx="336" cy="296" rx="18" ry="22" fill="#2E7D32" />

              {/* ── GIRL — blue school uniform, holding globe ── */}
              {/* Body */}
              <rect x="138" y="210" width="56" height="80" rx="10" fill="#1565C0" />
              {/* Collar */}
              <path d="M155,210 Q166,224 178,210" fill="none" stroke="white" strokeWidth="3" />
              {/* Skirt */}
              <path d="M138,265 Q166,278 194,265 L198,290 Q166,305 134,290 Z" fill="#1E88E5" />
              {/* Legs */}
              <rect x="147" y="286" width="16" height="44" rx="6" fill="#C68642" />
              <rect x="169" y="286" width="16" height="44" rx="6" fill="#C68642" />
              {/* Shoes */}
              <ellipse cx="155" cy="330" rx="12" ry="7" fill="#212121" />
              <ellipse cx="177" cy="330" rx="12" ry="7" fill="#212121" />
              {/* Head */}
              <circle cx="166" cy="178" r="33" fill="#C68642" />
              {/* Pigtails */}
              <path d="M136,166 Q127,142 137,127 Q147,112 153,131" fill="#3E2723" stroke="#3E2723" strokeWidth="2" />
              <path d="M196,166 Q205,142 195,127 Q185,112 179,131" fill="#3E2723" stroke="#3E2723" strokeWidth="2" />
              {/* Hair top */}
              <path d="M133,179 Q141,149 166,143 Q191,149 199,179 Q191,163 166,159 Q141,163 133,179Z" fill="#3E2723" />
              {/* Hair band decorations */}
              <circle cx="140" cy="140" r="4" fill="#E91E63" />
              <circle cx="192" cy="140" r="4" fill="#E91E63" />
              {/* Eyes */}
              <circle cx="157" cy="178" r="5" fill="#1A1A1A" />
              <circle cx="175" cy="178" r="5" fill="#1A1A1A" />
              <circle cx="159" cy="176" r="2" fill="white" />
              <circle cx="177" cy="176" r="2" fill="white" />
              {/* Smile */}
              <path d="M157,192 Q166,202 175,192" fill="none" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <rect x="109" y="216" width="32" height="13" rx="6.5" fill="#C68642" />
              <rect x="191" y="216" width="32" height="13" rx="6.5" fill="#C68642" />
              {/* Globe */}
              <circle cx="101" cy="222" r="21" fill="#1E88E5" />
              <ellipse cx="101" cy="222" rx="21" ry="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.55" />
              <line x1="80" y1="222" x2="122" y2="222" stroke="white" strokeWidth="1.5" opacity="0.55" />
              <ellipse cx="98" cy="212" rx="9" ry="7" fill="#4CAF50" opacity="0.75" />
              <ellipse cx="106" cy="229" rx="7" ry="5" fill="#4CAF50" opacity="0.75" />

              {/* ── BOY — green school uniform, holding sapling ── */}
              {/* Body */}
              <rect x="246" y="210" width="56" height="80" rx="10" fill="#2E7D32" />
              <path d="M263,210 Q274,224 286,210" fill="none" stroke="white" strokeWidth="3" />
              {/* Legs */}
              <rect x="252" y="284" width="17" height="45" rx="6" fill="#1B5E20" />
              <rect x="276" y="284" width="17" height="45" rx="6" fill="#1B5E20" />
              {/* Shoes */}
              <ellipse cx="260" cy="329" rx="12" ry="7" fill="#212121" />
              <ellipse cx="285" cy="329" rx="12" ry="7" fill="#212121" />
              {/* Head */}
              <circle cx="274" cy="178" r="33" fill="#A0522D" />
              {/* Short hair */}
              <path d="M241,173 Q243,139 274,133 Q305,139 307,173 Q299,149 274,145 Q249,149 241,173Z" fill="#1A1A1A" />
              {/* Eyes */}
              <circle cx="265" cy="178" r="5" fill="#1A1A1A" />
              <circle cx="283" cy="178" r="5" fill="#1A1A1A" />
              <circle cx="267" cy="176" r="2" fill="white" />
              <circle cx="285" cy="176" r="2" fill="white" />
              {/* Big smile */}
              <path d="M261,192 Q274,206 287,192" fill="none" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms */}
              <rect x="217" y="216" width="32" height="13" rx="6.5" fill="#A0522D" />
              <rect x="299" y="216" width="32" height="13" rx="6.5" fill="#A0522D" />
              {/* Sapling */}
              <rect x="328" y="182" width="6" height="52" rx="3" fill="#5D4037" />
              <circle cx="331" cy="170" r="19" fill="#4CAF50" />
              <circle cx="320" cy="178" r="12" fill="#66BB6A" />
              <circle cx="342" cy="175" r="13" fill="#388E3C" />
              <line x1="331" y1="189" x2="319" y2="179" stroke="#2E7D32" strokeWidth="2" />
              <line x1="331" y1="189" x2="343" y2="177" stroke="#2E7D32" strokeWidth="2" />

              {/* ── Floating decorations ── */}
              {/* Orange butterfly */}
              <ellipse cx="72" cy="130" rx="13" ry="8" fill="#FF9800" opacity="0.82" transform="rotate(-28,72,130)" />
              <ellipse cx="57" cy="128" rx="13" ry="8" fill="#FFB74D" opacity="0.82" transform="rotate(22,57,128)" />
              <circle cx="65" cy="129" r="3" fill="#E65100" />
              {/* Pink butterfly */}
              <ellipse cx="370" cy="146" rx="11" ry="7" fill="#E91E63" opacity="0.72" transform="rotate(-18,370,146)" />
              <ellipse cx="356" cy="144" rx="11" ry="7" fill="#F48FB1" opacity="0.72" transform="rotate(18,356,144)" />
              <circle cx="363" cy="145" r="3" fill="#880E4F" />
              {/* Leaves */}
              <ellipse cx="60" cy="232" rx="10" ry="4.5" fill="#66BB6A" opacity="0.6" transform="rotate(-38,60,232)" />
              <ellipse cx="380" cy="192" rx="10" ry="4.5" fill="#81C784" opacity="0.6" transform="rotate(28,380,192)" />
              <ellipse cx="200" cy="112" rx="8" ry="4" fill="#A5D6A7" opacity="0.5" transform="rotate(14,200,112)" />
              {/* Sparkles */}
              <text x="81" y="176" fontSize="15" opacity="0.72">✨</text>
              <text x="357" y="232" fontSize="13" opacity="0.62">🌟</text>
              <text x="203" y="96" fontSize="12" opacity="0.5">⭐</text>
            </svg>

            {/* Grade band chip */}
            {user && band && (
              <div className="text-center mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border bg-[#e8f5e9] border-[#a5d6a7] text-[#1b5e20]">
                  {bandEmoji} {bandLabel} · {t('grades.class')} {user?.grade || user?.profile?.gradeLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — MISSION STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f1f8e9] py-10 border-y border-[#c8e6c9]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* 8 eco icons */}
          <div className="flex justify-center flex-wrap gap-5 md:gap-9 mb-7">
            {missionIcons.map(({ icon, key }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-[38px] leading-none">{icon}</span>
                <span className="text-[10px] font-bold text-[#064e17] uppercase tracking-wider">
                  {t(key)}
                </span>
              </div>
            ))}
          </div>

          <h2 className="font-black text-2xl md:text-3xl text-[#064e17] uppercase tracking-widest mb-3">
            {t('home.mission_title')}
          </h2>
          <p className="text-[15px] text-[#1a3a1a] max-w-2xl mx-auto leading-relaxed">
            {t('home.mission_text')}
          </p>

          {/* Live stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard target={liveStats.treesPlanted} label={t('stats.trees')} color="#2e7d32" />
            <StatCard target={liveStats.co2Saved} label={t('stats.co2')} color="#0288d1" />
            <StatCard target={liveStats.waterSaved} label={t('stats.water')} color="#0288d1" />
            <StatCard target={liveStats.schoolsJoined} label={t('stats.schools')} color="#e91e63" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — ECO-GAMES (4 cards)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-black text-3xl text-[#064e17] uppercase tracking-widest text-center mb-2">
            {t('home.games_section')} 🎮
          </h2>
          <p className="text-center text-[#1a3a1a] font-medium mb-10">{t('home.games_subtitle')}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {games.map(({ emoji, name, bg, to }) => (
              <Link
                key={name}
                to={to}
                className="group block bg-white rounded-2xl overflow-hidden border-2 border-[#e8f5e9] shadow-[0_3px_16px_rgba(0,0,0,.07)] hover:-translate-y-1.5 hover:border-[#a5d6a7] hover:shadow-[0_8px_28px_rgba(0,0,0,.12)] transition-all duration-200 cursor-pointer"
              >
                <div className="h-40 flex items-center justify-center text-6xl" style={{ background: bg }}>
                  {emoji}
                </div>
                <div className="p-3 text-center">
                  <p className="font-black text-sm text-[#064e17] uppercase tracking-wide">
                    {name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/games"
              className="inline-block border-2 border-[#145214] text-[#145214] font-bold px-8 py-3 rounded-full hover:bg-[#145214] hover:text-white transition-all duration-200"
            >
              {t('home.more_games')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — ECO-TOPICS (4 article cards)
      ══════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#fafffe]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-black text-3xl text-[#064e17] uppercase tracking-widest text-center mb-2">
            {t('home.topics_section')} 📚
          </h2>
          <p className="text-center text-[#1a3a1a] font-medium mb-10">{t('home.topics_subtitle')}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {topics.map(({ emoji, category, title, bg, chip, to }) => (
              <Link
                key={category}
                to={to}
                className="group block bg-white rounded-2xl overflow-hidden border-2 border-[#e8f5e9] shadow-[0_3px_16px_rgba(0,0,0,.07)] hover:-translate-y-1.5 hover:border-[#a5d6a7] hover:shadow-[0_8px_28px_rgba(0,0,0,.12)] transition-all duration-200 cursor-pointer"
              >
                <div className="h-40 flex items-center justify-center text-6xl" style={{ background: bg }}>
                  {emoji}
                </div>
                <div className="p-4">
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mb-2"
                    style={{ background: chip.bg, borderColor: chip.border, color: chip.text }}
                  >
                    {category}
                  </span>
                  <p className="font-bold text-sm text-[#0a1e0a] leading-snug line-clamp-2">
                    {title}
                  </p>
                  <p className="text-xs text-[#145214] font-semibold mt-2 group-hover:underline">
                    {t('topics.read')} →
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/topics"
              className="inline-block border-2 border-[#145214] text-[#145214] font-bold px-8 py-3 rounded-full hover:bg-[#145214] hover:text-white transition-all duration-200"
            >
              {t('home.more_topics')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — WEB PLATFORM BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#2e7d32] py-10 text-white text-center px-6">
        <p className="font-black text-2xl md:text-3xl mb-2">{t('home.app_banner') || 'Start Your Eco Journey Today'} 🌿</p>
        <p className="text-[#a5d6a7] mb-6 text-base">{t('home.webAppBannerSubtitle')}</p>
        <div className="flex justify-center flex-wrap">
          <div className="relative group inline-block">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-white text-[#2e7d32] px-6 py-3 rounded-xl font-bold hover:bg-[#e8f5e9] transition-colors"
            >
              📱 {t('home.tryWebApp')} →
            </Link>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-lg bg-[#0a1e0a] text-[#f9fffe] text-xs font-semibold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {t('home.mobileAppComingSoon')}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ══════════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
};

export default Home;