import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../utils/api';
import Navbar from '../components/layout/Navbar';
import GradeAdaptive from '../components/GradeAdaptive';
import { useGradeBand } from '../hooks/useGradeBand';
import { useTranslation } from 'react-i18next';

const toSafePoints = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeRanking = (ranking = {}, index = 0) => {
  const nestedUser = ranking.user || {};
  const points = toSafePoints(
    ranking.ecoPoints ?? ranking.points ?? ranking.score ?? ranking.totalPoints
  );

  return {
    ...ranking,
    id: ranking.id || ranking._id || nestedUser.id || nestedUser._id || `lb-${index + 1}`,
    name: ranking.name || nestedUser.name || ranking.firstName || `Player ${index + 1}`,
    school: ranking.school || nestedUser.school || ranking.schoolName || '-',
    grade: ranking.grade || nestedUser.grade,
    avatar: ranking.avatar || '🧑',
    ecoPoints: points
  };
};

// Seedling Row
const SeedlingRow = ({ ranking, index }) => (
  <div className="flex items-center gap-4 bg-white rounded-full p-3 pr-6 shadow-sm border-2 border-transparent hover:border-[#ffb74d] hover:-translate-y-1 transition-all mb-3">
    <div className="w-12 h-12 rounded-full bg-[#fff3e0] text-[#ff8f00] font-['Fredoka_One'] text-2xl flex items-center justify-center shrink-0 border-2 border-[#ffe082]">
      {index + 4}
    </div>
    <div className="text-4xl shrink-0">{ranking.avatar}</div>
    <div className="flex-1 min-w-0">
      <div className="font-['Fredoka_One'] text-xl text-[var(--eco-dark)] truncate">{ranking.name}</div>
    </div>
    <div className="bg-[var(--eco-green)] text-white px-4 py-1.5 rounded-full font-bold text-lg shadow-sm whitespace-nowrap">
      {ranking.ecoPoints} ⭐
    </div>
  </div>
);

// Explorer Row
const ExplorerRow = ({ ranking, index }) => (
  <div className="flex items-center gap-4 bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all mb-3 relative overflow-hidden group">
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-blue-400 transition-colors" />
    <div className="w-10 font-bold text-gray-400 text-center text-lg">{index + 4}</div>
    <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-2xl">
      {ranking.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-['Nunito'] font-black text-lg text-gray-800 truncate">{ranking.name}</div>
      <div className="text-sm text-gray-500 truncate">{ranking.school}</div>
    </div>
    <div className="text-right">
      <div className="font-bold text-[var(--blue)] text-lg">{toSafePoints(ranking.ecoPoints).toLocaleString()}</div>
      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Points</div>
    </div>
  </div>
);

// Expert Row
const ExpertRow = ({ ranking, index }) => (
  <div className="flex items-center gap-4 bg-gray-50/50 border-b border-gray-200 p-3 hover:bg-white transition-colors">
    <div className="font-mono text-gray-400 w-8 text-right text-sm">{String(index + 4).padStart(2, '0')}</div>
    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
      <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
        <span className="text-xl">{ranking.avatar}</span>
        <span className="font-['DM_Sans'] font-bold text-gray-900">{ranking.name}</span>
      </div>
      <div className="col-span-5 lg:col-span-5 text-sm text-gray-500 truncate">
        {ranking.school}
      </div>
      <div className="col-span-3 lg:col-span-4 text-right">
        <span className="font-mono font-bold text-[var(--eco-dark)] bg-green-50 px-2 py-1 rounded">
          {toSafePoints(ranking.ecoPoints).toLocaleString()} EP
        </span>
      </div>
    </div>
  </div>
);

// Adaptive Podium
const AdaptivePodium = ({ topThree, band }) => {
  const isKiddie = band === 'seedling';
  const isExpert = band === 'expert' || band === 'challenger';

  const [second, first, third] = [topThree[1], topThree[0], topThree[2]];

  if (isExpert) {
    return (
      <div className="mb-12">
        <div className="flex justify-between items-end border-b-2 border-gray-800 pb-2 mb-4 px-4">
          <div className="font-mono text-xs font-bold uppercase text-gray-500">Global Top 3 (Live)</div>
          <div className="font-mono text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 border border-green-200">SYNCED</div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { pos: 2, data: second, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' },
            { pos: 1, data: first, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-400' },
            { pos: 3, data: third, color: 'text-amber-700', bg: 'bg-orange-50', border: 'border-orange-300' }
          ].map(item => item.data && (
            <div key={item.pos} className={`border ${item.border} ${item.bg} p-4 rounded-lg flex items-center gap-4`}>
              <div className={`font-mono text-4xl font-black ${item.color} opacity-30`}>#{item.pos}</div>
              <div>
                <div className="text-2xl mb-1">{item.data.avatar}</div>
                <div className="font-['DM_Sans'] font-bold text-gray-900">{item.data.name}</div>
                <div className="font-mono text-sm font-bold text-green-700">{toSafePoints(item.data.ecoPoints).toLocaleString()} EP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Visual Podium for Seedling & Explorer
  return (
    <div className="flex items-end justify-center h-[280px] md:h-[320px] mb-16 gap-2 md:gap-6 mt-16 px-2">
      {/* 2nd Place */}
      {second && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center flex-1 max-w-[140px] z-10 w-1/3">
          <div className="mb-2 relative">
            <div className={`text-4xl md:text-6xl bg-white rounded-full ${isKiddie ? 'border-4 border-gray-300 w-16 h-16 md:w-20 md:h-20' : 'shadow-md w-16 h-16 md:w-24 md:h-24'} flex items-center justify-center mx-auto z-10 relative`}>
              {second.avatar}
            </div>
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-white font-black text-xs md:text-sm px-2 py-0.5 rounded-full z-20 shadow-sm border-2 border-white`}>#2</div>
          </div>
          <div className="font-bold text-center text-sm md:text-base text-gray-700 truncate w-full px-1">{second.name}</div>
          <div className="text-xs md:text-sm font-bold text-gray-500 mb-2">{second.ecoPoints}</div>
          <div className="w-full h-[100px] md:h-[120px] bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-2xl md:rounded-t-3xl border-t-4 border-gray-300 shadow-inner" />
        </motion.div>
      )}

      {/* 1st Place */}
      {first && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center flex-1 max-w-[160px] z-20 w-1/3">
          <div className="mb-2 relative">
            <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 text-5xl md:text-6xl animate-bounce drop-shadow-md z-0">👑</div>
            <div className={`text-5xl md:text-7xl bg-white rounded-full ${isKiddie ? 'border-4 border-yellow-400 w-20 h-20 md:w-28 md:h-28' : 'shadow-lg w-20 h-20 md:w-28 md:h-28'} flex items-center justify-center mx-auto z-10 relative`}>
              {first.avatar}
            </div>
            <div className={`absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white font-black text-sm md:text-base px-3 py-0.5 rounded-full z-20 shadow-sm border-2 border-white`}>#1</div>
          </div>
          <div className="font-black text-center text-base md:text-xl text-yellow-600 truncate w-full px-1">{first.name}</div>
          <div className="text-sm md:text-base font-black text-yellow-500 mb-2">{first.ecoPoints} EP!</div>
          <div className="w-full h-[140px] md:h-[160px] bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-2xl md:rounded-t-3xl border-t-4 border-yellow-400 shadow-[0_-5px_20px_rgba(250,204,21,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIj48L2NpcmNsZT4KPC9zdmc+')] opacity-50" />
          </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {third && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center flex-1 max-w-[140px] z-10 w-1/3">
          <div className="mb-2 relative">
            <div className={`text-4xl md:text-6xl bg-white rounded-full ${isKiddie ? 'border-4 border-orange-300 w-16 h-16 md:w-20 md:h-20' : 'shadow-md w-16 h-16 md:w-24 md:h-24'} flex items-center justify-center mx-auto z-10 relative`}>
              {third.avatar}
            </div>
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white font-black text-xs md:text-sm px-2 py-0.5 rounded-full z-20 shadow-sm border-2 border-white`}>#3</div>
          </div>
          <div className="font-bold text-center text-sm md:text-base text-gray-700 truncate w-full px-1">{third.name}</div>
          <div className="text-xs md:text-sm font-bold text-orange-500 mb-2">{third.ecoPoints}</div>
          <div className="w-full h-[80px] md:h-[100px] bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-2xl md:rounded-t-3xl border-t-4 border-orange-300 shadow-inner" />
        </motion.div>
      )}
    </div>
  );
};

const Leaderboard = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { band } = useGradeBand();
  const { t } = useTranslation();

  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('global');
  const [timeframe, setTimeframe] = useState('all-time');

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line
  }, [scope, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ scope, timeframe, limit: 10 });
      if (scope === 'school' && user?.profile?.school) {
        params.set('school', user.profile.school);
      } else if (scope === 'district' && user?.profile?.district) {
        params.set('district', user.profile.district);
        if (user?.profile?.state) params.set('state', user.profile.state);
      }

      const response = await apiRequest(`/gamification/leaderboards?${params.toString()}`);
      
      if (response && response.data) {
        // API returns: { leaderboard: { rankings: [...] }, userPosition: {...} }
        const normalizedRankings = (response.data.leaderboard?.rankings || []).map((ranking, index) => normalizeRanking(ranking, index));
        setRankings(normalizedRankings);
        
        if (isAuthenticated && response.data.userPosition) {
          setUserRank(response.data.userPosition);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const scopeOptions = [
    { value: 'class', label: 'Class' },
    { value: 'school', label: 'School' },
    { value: 'district', label: 'District' },
    { value: 'state', label: 'State' },
    { value: 'global', label: 'National' }
  ];

  const timeOptions = [
    { value: 'all-time', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  const isKiddie = band === 'seedling';
  const isExpert = band === 'expert' || band === 'challenger';

  return (
    <div className={`min-h-screen ${isExpert ? 'bg-gray-100' : 'bg-[#f0f9ff]'} pb-24 md:pb-16`}>
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 pt-24 md:pt-32 relative z-10">

        {/* Adaptive Header */}
        <div className="text-center mb-8 md:mb-12">
          <GradeAdaptive
            seedling={
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold mb-4 shadow-sm">
                ⭐ Our Top Friends
              </div>
            }
            explorer={
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs uppercase tracking-wider mb-6">
                🏆 Leaderboard
              </div>
            }
            expert={
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 font-mono text-xs font-bold uppercase mb-4 rounded border border-gray-300">
                SYS.RANKINGS &gt;
              </div>
            }
          />

          <GradeAdaptive
            seedling={<h1 className="font-['Fredoka_One'] text-5xl md:text-6xl mb-4 text-[#ff8f00]">Star Players! ⭐</h1>}
            explorer={<h1 className="font-['Nunito'] font-black text-4xl md:text-5xl mb-4 text-gray-900">Eco Champions Board</h1>}
            expert={<h1 className="font-['DM_Sans'] font-bold text-4xl md:text-5xl mb-4 text-gray-900 tracking-tight">Global Rankings</h1>}
            fallback={<h1 className="font-['Nunito'] font-black text-4xl md:text-5xl mb-4 text-gray-900">Eco Champions Board</h1>}
          />

          <GradeAdaptive
            seedling={<p className="font-['Nunito'] text-lg text-gray-600 max-w-xl mx-auto font-bold">Look at our amazing friends helping the planet! 🌍💚</p>}
            explorer={<p className="font-['Nunito'] text-base md:text-lg text-gray-600 max-w-xl mx-auto">Compete with students worldwide. Complete modules, earn XP, and secure your place.</p>}
            expert={<p className="font-['Nunito_Sans'] text-gray-600 max-w-xl mx-auto">Real-time data stream of top performing nodes in the network. Earn XP to climb.</p>}
          />
        </div>

        {/* Filters */}
        <div className={`mb-12 rounded-[24px] overflow-hidden ${isExpert ? 'bg-white border border-gray-300 shadow-sm' : 'bg-white shadow-[var(--shadow-sm)] border border-gray-100'} p-4 md:p-6`}>
          <div className="flex flex-col gap-4">
            {/* Scope (Class, School, etc) */}
            <div className="flex flex-wrap justify-center items-center gap-2">
              {scopeOptions.map(opt => {
                const isActive = scope === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setScope(opt.value)}
                    className={`px-4 py-2 ${isKiddie ? "font-['Fredoka_One'] text-base rounded-full" : "font-bold text-xs uppercase tracking-wider rounded-full md:rounded-lg"} transition-all ${isActive
                      ? isExpert ? 'bg-gray-800 text-white' : 'bg-[var(--sky)] text-white shadow-md'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className={`w-full h-px ${isExpert ? 'bg-gray-200' : 'bg-gradient-to-r from-transparent via-gray-200 to-transparent'}`} />

            {/* Timeframe */}
            <div className="flex justify-center gap-2">
              {timeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeframe(opt.value)}
                  className={`px-4 py-1.5 font-bold text-[10px] md:text-xs uppercase tracking-wider rounded-full transition-all border ${timeframe === opt.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rankings List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 flex flex-col items-center justify-center"
            >
              <div className={`w-12 h-12 border-4 border-gray-200 border-t-[var(--sky)] rounded-full animate-spin mb-6`} />
              <div className="font-bold text-gray-400 uppercase tracking-widest text-xs">Syncing Data...</div>
            </motion.div>
          ) : rankings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white border border-gray-200 rounded-[32px] shadow-sm"
            >
              <div className="text-6xl mb-6 opacity-50">🧭</div>
              <h3 className="font-['Nunito'] font-black text-2xl text-gray-800 mb-3">Uncharted Territory</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                No active players in this zone yet. Complete a mission to secure the #1 spot!
              </p>
              <Link to="/quizzes" className="px-8 py-3 rounded-full font-bold text-sm bg-[var(--sky)] text-white hover:shadow-md transition-shadow inline-block">
                Play Now
              </Link>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              <AdaptivePodium topThree={topThree} band={band} />

              <div className={`flex flex-col ${isExpert ? 'bg-white border border-gray-300 rounded-lg overflow-hidden' : 'mt-8'}`}>
                {isExpert && (
                  <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 border-b border-gray-300 font-mono text-[10px] font-bold text-gray-500 uppercase">
                    <div className="hidden">#</div>
                    <div className="col-span-4 lg:col-span-3 ml-12">User Node</div>
                    <div className="col-span-5 lg:col-span-5">Institution Area</div>
                    <div className="col-span-3 lg:col-span-4 text-right">Yield</div>
                    <div className="col-start-1 -mt-4 w-8 text-right">#</div>
                  </div>
                )}

                {restRankings.map((ranking, index) => (
                  <GradeAdaptive
                    key={ranking.id || ranking.rank || index}
                    seedling={<SeedlingRow ranking={ranking} index={index} />}
                    explorer={<ExplorerRow ranking={ranking} index={index} />}
                    challenger={<ExpertRow ranking={ranking} index={index} />}
                    expert={<ExpertRow ranking={ranking} index={index} />}
                    fallback={<ExplorerRow ranking={ranking} index={index} />}
                  />
                ))}
              </div>

              {isAuthenticated && userRank && !rankings.some(r => r.name === user?.name) && (
                <div className="mt-12">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400 px-4 py-1 rounded-full border border-gray-200 text-center bg-gray-50">
                      Your Position
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <GradeAdaptive
                    seedling={<SeedlingRow ranking={{ rank: scope === 'school' ? userRank.schoolRank : userRank.globalRank, name: user?.name, ecoPoints: toSafePoints(userRank.userEcoPoints), avatar: '🧑‍🚀' }} index={userRank.globalRank - 5} />}
                    explorer={<ExplorerRow ranking={{ rank: scope === 'school' ? userRank.schoolRank : userRank.globalRank, name: user?.name, school: user?.profile?.school, ecoPoints: toSafePoints(userRank.userEcoPoints), avatar: '🧑‍🚀' }} index={userRank.globalRank - 5} />}
                    expert={<ExpertRow ranking={{ rank: scope === 'school' ? userRank.schoolRank : userRank.globalRank, name: user?.name, school: user?.profile?.school, ecoPoints: toSafePoints(userRank.userEcoPoints), avatar: '🧑‍🚀' }} index={userRank.globalRank - 5} />}
                    fallback={<ExplorerRow ranking={{ rank: scope === 'school' ? userRank.schoolRank : userRank.globalRank, name: user?.name, school: user?.profile?.school, ecoPoints: toSafePoints(userRank.userEcoPoints), avatar: '🧑‍🚀' }} index={userRank.globalRank - 5} />}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isAuthenticated && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-20 text-center max-w-[600px] mx-auto p-12 rounded-[32px] relative overflow-hidden group border ${isExpert ? 'border-gray-300 bg-white shadow-sm' : 'border-blue-100 bg-white shadow-[var(--shadow-lg)]'}`}
          >
            <h2 className={`${isKiddie ? "font-['Fredoka_One'] text-[#ff8f00]" : "font-['Nunito'] font-black text-gray-900"} text-3xl md:text-4xl mb-4 relative z-10`}>Ascend the Ranks</h2>
            <p className="font-['Nunito'] text-gray-500 mb-8 relative z-10 max-w-md mx-auto">Create an account to track your impact, earn XP multipliers, and represent your school globally.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/register" className={`px-10 py-4 rounded-full font-bold text-sm tracking-wider ${isExpert ? 'bg-gray-800 text-white' : 'bg-[var(--sky)] text-white'} shadow-md hover:-translate-y-1 transition-all`}>
                Enlist Now
              </Link>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default Leaderboard;
