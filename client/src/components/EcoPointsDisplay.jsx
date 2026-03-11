import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGradeBand } from '../hooks/useGradeBand';
import GradeAdaptive from './GradeAdaptive';

// Removed: import '../styles/EcoPointsDisplay.css';

const EcoPointsDisplay = () => {
  const [summary, setSummary] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const { band } = useGradeBand();

  useEffect(() => {
    if (token) {
      fetchEcoPointsData();
    }
  }, [token]);

  const fetchEcoPointsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, rankingRes] = await Promise.all([
        axios.get('/api/v1/eco-points/summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/v1/eco-points/ranking', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data.data);
      setRanking(rankingRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch eco-points data');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="w-full text-center p-8 text-gray-400 font-bold uppercase tracking-widest text-sm">
        Loading eco-points...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center p-8 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!summary || !ranking) return null;

  const isKiddie = band === 'seedling';
  const isExpert = band === 'expert' || band === 'challenger';

  const SeedlingDisplay = () => (
    <div className="w-full bg-gradient-to-br from-green-100 to-green-50 rounded-[32px] p-6 sm:p-8 shadow-sm border-2 border-green-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-['Fredoka_One'] text-2xl text-[var(--eco-dark)]">Your Impact</h2>
        <div className="text-4xl animate-bounce">🌍</div>
      </div>

      <div className="text-center mb-8 pb-6 border-b-2 border-green-200 border-dashed">
        <span className="block font-['Fredoka_One'] text-6xl text-[var(--eco-green)] mb-2">{summary.totalEcoPoints}</span>
        <span className="font-bold text-green-700 text-lg">Eco-Points Earned! ⭐</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-[20px] p-4 text-center shadow-sm border border-green-100">
          <span className="block font-bold text-green-600 text-sm mb-1 uppercase tracking-wider">Level</span>
          <span className="block font-['Fredoka_One'] text-2xl text-[var(--eco-dark)]">{summary.currentLevel}</span>
        </div>
        <div className="bg-white rounded-[20px] p-4 text-center shadow-sm border border-green-100">
          <span className="block font-bold text-green-600 text-sm mb-1 uppercase tracking-wider">Badges</span>
          <span className="block font-['Fredoka_One'] text-2xl text-[var(--eco-dark)]">{summary.badges.length}</span>
        </div>
        <div className="bg-white rounded-[20px] p-4 text-center shadow-sm border border-green-100">
          <span className="block font-bold text-orange-500 text-sm mb-1 uppercase tracking-wider">Streak</span>
          <span className="block font-['Fredoka_One'] text-2xl text-[var(--eco-dark)]">{summary.streak.current} <span className="text-lg">🔥</span></span>
        </div>
      </div>

      {ranking && (
        <div className="bg-yellow-100/50 rounded-2xl p-4 flex justify-between items-center mb-8 border border-yellow-200">
          <div className="font-['Fredoka_One'] text-yellow-800 text-lg">Global Rank: #{ranking.globalRank}</div>
          <div className="text-3xl">🏆</div>
        </div>
      )}

      {summary.badges.length > 0 && (
        <div>
          <h3 className="font-bold text-green-700 mb-3 text-lg">Recent Badges</h3>
          <div className="flex flex-wrap gap-2">
            {summary.badges.slice(0, 5).map((badge, index) => (
              <div key={index} className="bg-white rounded-full px-4 py-2 flex items-center gap-2 border border-green-200 shadow-sm">
                <span className="text-xl">🏆</span>
                <span className="font-bold text-[var(--eco-dark)]">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const DefaultDisplay = () => (
    <div className={`w-full rounded-[24px] p-6 sm:p-8 ${isExpert ? 'bg-white border border-gray-300 shadow-sm' : 'bg-gradient-to-br from-[var(--eco-green)] to-[var(--eco-dark)] text-white shadow-lg'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${isExpert ? "font-['DM_Sans'] text-2xl font-bold text-gray-900" : "font-['Nunito'] font-black text-2xl m-0"}`}>Eco-Points Overview</h2>
        <div className={isExpert ? "text-2xl opacity-50 grayscale" : "text-3xl"}>🌍</div>
      </div>

      <div className={`text-center mb-8 pb-6 border-b ${isExpert ? 'border-gray-200' : 'border-white/20'}`}>
        <span className={`block text-5xl font-black mb-2 ${isExpert ? 'text-gray-900 font-mono' : ''}`}>{summary.totalEcoPoints.toLocaleString()}</span>
        <span className={`text-sm ${isExpert ? 'text-gray-500 uppercase font-bold tracking-wider' : 'opacity-90'}`}>Total Eco-Points</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className={`text-center p-4 rounded-xl ${isExpert ? 'bg-gray-50 border border-gray-100' : 'bg-white/10'}`}>
          <span className={`block text-xs uppercase tracking-wider mb-2 ${isExpert ? 'font-bold text-gray-500' : 'opacity-80'}`}>Level</span>
          <span className={`block text-2xl font-bold ${isExpert ? 'text-gray-900' : ''}`}>{summary.currentLevel}</span>
        </div>
        <div className={`text-center p-4 rounded-xl ${isExpert ? 'bg-gray-50 border border-gray-100' : 'bg-white/10'}`}>
          <span className={`block text-xs uppercase tracking-wider mb-2 ${isExpert ? 'font-bold text-gray-500' : 'opacity-80'}`}>Badges</span>
          <span className={`block text-2xl font-bold ${isExpert ? 'text-gray-900' : ''}`}>{summary.badges.length}</span>
        </div>
        <div className={`text-center p-4 rounded-xl ${isExpert ? 'bg-orange-50 border border-orange-100' : 'bg-white/10'}`}>
          <span className={`block text-xs uppercase tracking-wider mb-2 ${isExpert ? 'font-bold text-orange-600' : 'opacity-80'}`}>Streak</span>
          <span className={`block text-2xl font-bold ${isExpert ? 'text-orange-700' : ''}`}>{summary.streak.current} days</span>
        </div>
      </div>

      {ranking && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-xl text-center ${isExpert ? 'bg-gray-100 border border-gray-200' : 'bg-white/10'}`}>
            <span className={`block text-xs uppercase tracking-wider mb-2 ${isExpert ? 'font-bold text-gray-500' : 'opacity-80'}`}>Global Rank</span>
            <span className={`block text-xl font-bold ${isExpert ? 'text-gray-900 font-mono' : ''}`}>{ranking.globalRank} <span className="text-sm opacity-60">of {ranking.globalTotal}</span></span>
          </div>
          <div className={`p-4 rounded-xl text-center ${isExpert ? 'bg-gray-100 border border-gray-200' : 'bg-white/10'}`}>
            <span className={`block text-xs uppercase tracking-wider mb-2 ${isExpert ? 'font-bold text-gray-500' : 'opacity-80'}`}>School Rank</span>
            <span className={`block text-xl font-bold ${isExpert ? 'text-gray-900 font-mono' : ''}`}>{ranking.schoolRank} <span className="text-sm opacity-60">of {ranking.schoolTotal}</span></span>
          </div>
        </div>
      )}

      <div className={`pt-6 border-t ${isExpert ? 'border-gray-200' : 'border-white/20'}`}>
        {summary.badges.length > 0 ? (
          <>
            <h3 className={`text-sm tracking-wider uppercase mb-4 ${isExpert ? 'font-bold text-gray-400' : ''}`}>Recent Commendations</h3>
            <div className="flex flex-wrap gap-3">
              {summary.badges.slice(0, 5).map((badge, index) => (
                <div key={index} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${isExpert ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-white/20'}`}>
                  <span>🏆</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={isExpert ? 'text-gray-500 text-sm' : 'opacity-80 text-sm'}>Complete operations to earn commendations</p>
        )}
      </div>
    </div>
  );

  return (
    <GradeAdaptive
      seedling={<SeedlingDisplay />}
      explorer={<DefaultDisplay />}
      expert={<DefaultDisplay />}
      fallback={<DefaultDisplay />}
    />
  );
};

export default EcoPointsDisplay;
