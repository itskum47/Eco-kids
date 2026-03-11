import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import { apiRequest } from '../utils/api';

const USE_HARDCODED = true;

const CATEGORIES = [
  { id: 'all', icon: '🎮' },
  { id: 'waste', icon: '♻️' },
  { id: 'water', icon: '💧' },
  { id: 'energy', icon: '⚡' },
  { id: 'biodiversity', icon: '🦋' },
  { id: 'climate', icon: '🌡️' },
];

const GRADES = [
  { id: 'all', label: 'All' },
  { id: '1-3', label: 'Class 1–3', min: 1, max: 3 },
  { id: '4-6', label: 'Class 4–6', min: 4, max: 6 },
  { id: '7-9', label: 'Class 7–9', min: 7, max: 9 },
  { id: '10-12', label: 'Class 10–12', min: 10, max: 12 },
];

const GAMES = [
  {
    id: 1,
    name: 'Eco Adventure',
    slug: 'eco-adventure',
    nameHi: 'इको एडवेंचर',
    emoji: '🌍',
    gradient: 'linear-gradient(135deg,#bbf7d0,#dcfce7)',
    description: 'Side-scrolling eco mission with grade-adaptive challenges from fruits to policy simulation.',
    descriptionHi: 'कक्षा के अनुसार बदलती चुनौतियों के साथ इको मिशन: फलों से लेकर नीति सिमुलेशन तक।',
    gradeMin: 1,
    gradeMax: 12,
    difficulty: 'medium',
    ecoPointsReward: 90,
    timeMinutes: 12,
    category: 'climate'
  },
  {
    id: 2,
    name: 'Eco Maze',
    slug: 'eco-maze',
    nameHi: 'इको मेज़',
    emoji: '🧭',
    gradient: 'linear-gradient(135deg,#bae6fd,#cffafe)',
    description: 'Navigate clean-energy mazes with checkpoints, path insights, and policy mode for senior grades.',
    descriptionHi: 'क्लीन-एनर्जी मेज़ में रास्ता खोजो: चेकपॉइंट, पाथ इनसाइट और सीनियर ग्रेड के लिए पॉलिसी मोड।',
    gradeMin: 1,
    gradeMax: 12,
    difficulty: 'medium',
    ecoPointsReward: 85,
    timeMinutes: 10,
    category: 'water'
  },
  {
    id: 3,
    name: 'Eco Connect Dots',
    slug: 'eco-connect-dots',
    nameHi: 'इको कनेक्ट डॉट्स',
    emoji: '🔗',
    gradient: 'linear-gradient(135deg,#fef08a,#dcfce7)',
    description: 'Connect ecological chains from simple shapes to climate-system networks.',
    descriptionHi: 'सरल आकृतियों से जलवायु-तंत्र नेटवर्क तक पारिस्थितिक कड़ियों को जोड़ो।',
    gradeMin: 1,
    gradeMax: 12,
    difficulty: 'medium',
    ecoPointsReward: 80,
    timeMinutes: 9,
    category: 'biodiversity'
  },
  {
    id: 4,
    name: 'Memory Match',
    slug: 'memory-match',
    nameHi: 'मेमोरी मैच',
    emoji: '🧠',
    gradient: 'linear-gradient(135deg,#fde68a,#dbeafe)',
    description: 'Match eco vocabulary pairs that adapt from emoji cards to policy and concept cards.',
    descriptionHi: 'इमोजी कार्ड से नीति और अवधारणा कार्ड तक, ग्रेड-अनुसार बदलते इको शब्दों का मैच।',
    gradeMin: 1,
    gradeMax: 12,
    difficulty: 'medium',
    ecoPointsReward: 75,
    timeMinutes: 8,
    category: 'energy'
  },
  {
    id: 5,
    name: 'Waste Sorting Game',
    slug: 'waste-sorting',
    nameHi: 'वेस्ट सॉर्टिंग गेम',
    emoji: '♻️',
    gradient: 'linear-gradient(135deg,#bbf7d0,#dbeafe)',
    description: 'Sort waste streams from primary basics to higher-grade city policy strategy.',
    descriptionHi: 'प्राइमरी बेसिक्स से लेकर हायर-ग्रेड सिटी पॉलिसी रणनीति तक कचरा छाँटो।',
    gradeMin: 1,
    gradeMax: 12,
    difficulty: 'hard',
    ecoPointsReward: 95,
    timeMinutes: 14,
    category: 'waste'
  }
];

function GameCard({ game, currentGrade, t, i18n, onSelect }) {
  const isLocked = currentGrade && game.minGrade && currentGrade < game.minGrade;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div
        onClick={() => { if (!isLocked) onSelect(game); }}
        className={`block bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200 h-full flex flex-col
          ${isLocked
            ? 'opacity-60 cursor-not-allowed border-gray-200 bg-white'
            : 'border-[#e8f5e9] bg-white hover:-translate-y-1.5 hover:border-[#a5d6a7] hover:shadow-lg cursor-pointer'}`}
      >
        {/* Cover: emoji + gradient */}
        <div className={`h-48 flex items-center justify-center text-8xl relative ${isLocked ? 'grayscale' : ''}`}
          style={{ background: isLocked ? '#f3f4f6' : game.gradient }}>
          {game.emoji}
          {/* EP badge */}
          {!isLocked && (
            <span className="absolute top-3 right-3 text-xs font-mono font-black bg-[#fff8e1] border border-[#ffe082] text-[#e65100] px-2 py-1 rounded-full shadow-sm">
              +{game.ecoPointsReward} EP
            </span>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col bg-white">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] px-2 py-0.5 rounded-full">
              {t('grades.class')} {game.gradeMin}–{game.gradeMax}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
              ${game.difficulty === 'easy'
                ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                : game.difficulty === 'medium'
                  ? 'bg-[#fff8e1] text-[#e65100] border-[#ffe082]'
                  : 'bg-[#fce4ec] text-[#880e4f] border-[#f48fb1]'
              }`}>
              {t(`games.difficulty_${game.difficulty}`, { defaultValue: game.difficulty })}
            </span>
            <span className="text-[11px] font-bold text-[#7a9b72] ml-auto">
              🕐 {game.timeMinutes} {t('topics.minRead', { min: '' }).replace('{{min}}', '').replace('{min}', '').trim() || 'min'}
            </span>
          </div>

          <h3 className="font-ui font-bold text-[16px] text-[#1a2e1c] mb-1.5 leading-snug">
            {i18n.language === 'hi' && game.nameHi ? game.nameHi : game.name || game.title}
          </h3>

          <p className="text-[12px] text-[#4a6741] line-clamp-2 mb-4 flex-1 leading-relaxed">
            {i18n.language === 'hi' && game.descriptionHi ? game.descriptionHi : game.description}
          </p>

          <div className="mt-auto">
            {isLocked ? (
              <div className="w-full text-center py-2.5 bg-gray-100 text-gray-500 font-bold text-sm rounded-xl">
                🔒 {t('games.locked', { grade: game.gradeMin, defaultValue: `Unlocks at Class ${game.gradeMin}` })}
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(game); }}
                className="w-full py-2.5 bg-[#2e7d32] text-white font-black text-sm rounded-xl hover:bg-[#1b5e20] transition-colors tracking-wide cursor-pointer"
              >
                {t('games.playNow', { defaultValue: 'Play Game' })} 🎮
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesPage() {
  const [apiGames, setApiGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGrade, setActiveGrade] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const { user } = useSelector(s => s.auth);
  const { t, i18n } = useTranslation();

  const games = USE_HARDCODED ? GAMES : (apiGames || []);
  const currentUserGrade = user?.grade ? parseInt(user.grade) : null;

  useEffect(() => {
    if (!USE_HARDCODED) {
      apiRequest('/games')
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            setApiGames(data);
          } else {
            setApiGames(GAMES);
          }
        })
        .catch(() => setApiGames(GAMES))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const filtered = games.filter(g => {
    const catOk = activeCategory === 'all' || g.category?.toLowerCase() === activeCategory;
    const gradeRange = GRADES.find(gr => gr.id === activeGrade);
    const gradeOk = !gradeRange || gradeRange.id === 'all' || ((g.minGrade || g.gradeMin) >= gradeRange.min && (g.minGrade || g.gradeMin) <= gradeRange.max);
    const searchOk = !search || (g.title || g.name)?.toLowerCase().includes(search.toLowerCase()) || g.nameHi?.includes(search);
    return catOk && gradeOk && searchOk;
  });

  return (
    <div className="min-h-screen bg-[#f9fffe]">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-[#e8f5e9] py-12 pb-14 mt-16 mt-0 pt-28 text-center text-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e8f5e9', border: '1px solid #a5d6a7',
              color: '#1b5e20', padding: '6px 14px', borderRadius: 100,
              fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>
            ← Back
          </button>
          <span style={{ fontSize: 12, color: '#7a9b72' }}>Home / Games</span>
        </div>
        <h1 className="font-black text-5xl text-[#1b5e20] mb-3">
          🎮 Eco-Games
        </h1>
        <p className="text-[#4a6741] text-lg">
          Play games and learn about the environment
        </p>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-24">

        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto mt-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a9b72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_placeholder', { defaultValue: 'Search games...' })}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#c8e6c9] rounded-2xl focus:border-[#4caf50] focus:ring-4 focus:ring-[#e8f5e9] focus:outline-none bg-white text-[#1a2e1c] font-medium shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Grade filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6 mt-4">
          {GRADES.map(gr => (
            <button
              key={gr.id}
              onClick={() => setActiveGrade(gr.id)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all border
                ${activeGrade === gr.id
                  ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-md'
                  : 'bg-white border-[#c8e6c9] text-[#2e7d32] hover:border-[#81c784]'}`}
            >
              {gr.id === 'all' ? t('grades.all', { defaultValue: 'All' }) : gr.label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all flex items-center gap-1.5 border
                ${activeCategory === cat.id
                  ? 'bg-[#2e7d32] border-[#2e7d32] text-white shadow-md'
                  : 'bg-white border-[#c8e6c9] text-[#2e7d32] hover:border-[#81c784]'}`}
            >
              <span>{cat.icon}</span>
              <span className="capitalize">
                {cat.id === 'all' ? t('category.all', { defaultValue: 'All' }) : t(`category.${cat.id}`, { defaultValue: cat.id })}
              </span>
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="rounded-2xl bg-[#e8f5e9] h-80 animate-pulse border-2 border-[#c8e6c9]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-[#4a6741] text-xl font-bold">{t('games.noGames', { defaultValue: 'No games found.' })}</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map(game => (
                <GameCard
                  key={game.id || game._id}
                  game={game}
                  currentGrade={currentUserGrade}
                  t={t}
                  i18n={i18n}
                  onSelect={setSelected}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '32px 16px', overflowY: 'auto'
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 24, maxWidth: 680,
              width: '100%', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,.3)', marginBottom: 40
            }}>

            {/* Header */}
            <div style={{
              background: selected.gradient || '#e8f5e9',
              padding: '32px 32px 24px', position: 'relative'
            }}>
              <button onClick={() => setSelected(null)} style={{
                position: 'absolute', top: 14, right: 14,
                background: 'rgba(0,0,0,.15)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                fontSize: 18, cursor: 'pointer', color: 'white'
              }}>✕</button>
              <div style={{ fontSize: 72, marginBottom: 12 }}>{selected.emoji}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 12px',
                  borderRadius: 100, background: '#e8f5e9',
                  border: '1px solid #a5d6a7', color: '#1b5e20'
                }}>
                  Class {selected.gradeMin}–{selected.gradeMax}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 12px',
                  borderRadius: 100,
                  background: selected.difficulty === 'easy' ? '#e8f5e9'
                    : selected.difficulty === 'medium' ? '#fff8e1' : '#fce4ec',
                  color: selected.difficulty === 'easy' ? '#1b5e20'
                    : selected.difficulty === 'medium' ? '#e65100' : '#880e4f',
                  border: '1px solid #c8e6c9'
                }}>
                  {selected.difficulty}
                </span>
                <span style={{ fontSize: 12, color: '#7a9b72' }}>
                  🕐 {selected.timeMinutes} min
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                  +{selected.ecoPointsReward} EP
                </span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1b5e20', margin: 0 }}>
                {selected.name}
              </h2>
            </div>

            {/* Description */}
            <div style={{ padding: '24px 32px' }}>
              <p style={{ fontSize: 15, color: '#4a6741', lineHeight: 1.7, marginBottom: 20 }}>
                {selected.description}
              </p>

              <div style={{
                background: '#f9fffe', borderRadius: 16,
                padding: 16, border: '1px solid #e8f5e9', marginBottom: 20
              }}>
                <p style={{ fontWeight: 700, color: '#1b5e20', fontSize: 14, marginBottom: 8 }}>
                  🎯 What you will learn:
                </p>
                <p style={{ fontSize: 13, color: '#4a6741', lineHeight: 1.7 }}>
                  {selected.learnObjective || selected.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  navigate(`/games/${selected.slug || ''}`);
                }}
                style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  width: '100%', padding: '14px 0',
                  background: '#2e7d32', color: 'white',
                  border: 'none', borderRadius: 100,
                  fontWeight: 900, fontSize: 16, cursor: 'pointer',
                  letterSpacing: '.04em'
                }}>
                🎮 Start Playing · +{selected.ecoPointsReward} EP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}