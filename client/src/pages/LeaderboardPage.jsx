/**
 * LeaderboardPage.jsx — Demo-hardened version
 *
 * What changed vs the old version:
 * - Animated rows: framer-motion layout animations on data change
 * - Points flash: when a row's points change, a green glow pulses on the cell
 * - Rank badge: top-3 get medal emojis; current user row gets a glowing highlight
 * - Rank delta: animated ↑N badge appears when rank improves
 * - Loading: premium skeleton instead of plain text
 * - Live pulse indicator: green dot shows data is refreshing
 */
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import socket from '../services/socket';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

/* ── Single leaderboard row with flash-on-change ─────────────── */
function LeaderboardRow({ student, index, isMe, prevPoints }) {
  const pts = student.ecoPoints || student.totalPoints || 0;
  const justScored = prevPoints !== undefined && pts > prevPoints;

  return (
    <motion.tr
      layout
      key={student.id || student._id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.15) }}
      className={`border-b border-gray-100 transition-colors ${
        isMe
          ? 'bg-green-50 ring-1 ring-inset ring-green-200'
          : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
      }`}
    >
      {/* Rank */}
      <td className="px-4 py-3 w-12">
        <span className="text-lg">
          {MEDALS[student.rank || index + 1] || (
            <span className="text-sm font-bold text-gray-500">#{student.rank || index + 1}</span>
          )}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">
            {student.name}
            {isMe && <span className="ml-1 text-[10px] font-bold text-green-600 uppercase tracking-wide"> (You)</span>}
          </span>
        </div>
        {student.school && (
          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{student.school}</div>
        )}
      </td>

      {/* Points — unmissable flash when value increases */}
      <td className="px-4 py-3 text-right relative">
        <AnimatePresence>
          {justScored && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -25, scale: [0.5, 1.2, 1, 1] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 right-12 text-green-600 font-black font-mono text-base pointer-events-none drop-shadow-md z-10"
            >
              +{pts - prevPoints}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span
          key={pts}
          className={`font-mono font-bold text-sm px-2 py-1 rounded-md inline-block ${
            justScored ? 'text-green-700' : 'text-green-600'
          }`}
          animate={justScored ? {
            scale: [1, 1.4, 1.1, 1],
            backgroundColor: ['#ffffff', '#86efac', '#dcfce7', '#ffffff'],
            boxShadow: ['0 0 0px #22c55e', '0 0 16px #22c55e', '0 0 6px #22c55e', '0 0 0px #22c55e'],
          } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {pts.toLocaleString('en-IN')}
        </motion.span>
      </td>


      {/* Level */}
      <td className="px-4 py-3 text-right text-sm text-gray-500">Lv {student.level || 1}</td>

      {/* Streak */}
      <td className="px-4 py-3 text-right text-sm text-gray-500">
        {student.streak || 0} 🔥
      </td>
    </motion.tr>
  );
}

/* ── Skeleton loading row ─────────────────────────────────────── */
function SkeletonRow({ i }) {
  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      {[1, 2, 3, 4, 5].map(col => (
        <td key={col} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: col === 2 ? '60%' : '40%' }} />
        </td>
      ))}
    </tr>
  );
}

const LeaderboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const [leaderboards, setLeaderboards] = useState({ global: [], school: [], myRank: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('school');
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);          // shows green pulse when data arrived
  const [rankDelta, setRankDelta] = useState(0);
  const previousRankRef = useRef(null);
  const prevPointsMap = useRef({});                      // id → previous points for flash detection

  useEffect(() => {
    fetchLeaderboards();
    const interval = setInterval(() => fetchLeaderboards({ silent: true }), 5000);

    socket.emit('watch-leaderboard', { leaderboardType: 'global' });
    socket.emit('watch-leaderboard', { leaderboardType: 'school' });
    socket.on('leaderboard-update', () => fetchLeaderboards({ silent: true }));

    return () => {
      clearInterval(interval);
      socket.off('leaderboard-update');
    };
  }, []);

  const fetchLeaderboards = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const schoolId = user?.profile?.schoolId || user?.schoolId;

      const reqs = [
        axios.get('/api/v1/leaderboards/global', { headers: h }),
        axios.get('/api/v1/leaderboards/my-rank', { headers: h }),
        ...(schoolId ? [axios.get(`/api/v1/leaderboards/school/${schoolId}`, { headers: h })] : [])
      ];

      const [globalRes, myRankRes, schoolRes] = await Promise.all(reqs);

      // Rank delta tracking
      const prev = previousRankRef.current;
      const next = myRankRes?.data?.globalRank || myRankRes?.data?.rank || null;
      if (Number.isFinite(prev) && Number.isFinite(next)) setRankDelta(prev - next);
      if (Number.isFinite(next)) previousRankRef.current = next;

      // Snapshot previous points for flash detection
      const global = globalRes?.data?.leaderboard || [];
      global.forEach(s => { prevPointsMap.current[s.id || s._id] = s.ecoPoints || 0; });

      setLeaderboards({
        global,
        school: schoolRes?.data?.leaderboard || [],
        myRank: myRankRes?.data || null
      });

      setIsLive(true);
      setTimeout(() => setIsLive(false), 1500);
      setError(null);
    } catch {
      setError('Leaderboard unavailable — refresh to retry');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const currentData = leaderboards[activeTab] || [];
  const myId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">🏆 Leaderboard</h1>
            <AnimatePresence>
              {isLive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 bg-green-100 border border-green-300 rounded-full px-2.5 py-1"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-gray-500 text-sm">Real-time eco-points from schools across India.</p>
        </div>

        {/* My Rank Card */}
        {leaderboards.myRank && (
          <motion.div
            className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 mb-6 shadow-lg shadow-green-200"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Your Rank</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black">
                    #{leaderboards.myRank.globalRank || leaderboards.myRank.rank || '–'}
                  </span>
                  {rankDelta !== 0 && (
                    <motion.span
                      key={rankDelta}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-bold mb-2 ${rankDelta > 0 ? 'text-green-200' : 'text-red-300'}`}
                    >
                      {rankDelta > 0 ? `↑${rankDelta}` : `↓${Math.abs(rankDelta)}`}
                    </motion.span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Eco Points</p>
                <motion.p
                  key={leaderboards.myRank.ecoPoints}
                  className="text-4xl font-black tabular-nums"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.4 }}
                >
                  {(leaderboards.myRank.ecoPoints || 0).toLocaleString('en-IN')}
                </motion.p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-green-400/40 pt-4">
              <div>
                <p className="text-green-200 text-xs">Level</p>
                <p className="font-bold text-lg">{leaderboards.myRank.level || 1}</p>
              </div>
              <div>
                <p className="text-green-200 text-xs">Streak</p>
                <p className="font-bold text-lg">{leaderboards.myRank.streak || 0} days 🔥</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Bar */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-4 shadow-sm">
          {[
            { key: 'school', label: '🏫 My School' },
            { key: 'global', label: '🌍 Global' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    No data yet — be the first to earn eco-points!
                  </td>
                </tr>
              ) : (
                currentData.map((student, index) => (
                  <LeaderboardRow
                    key={student.id || student._id || index}
                    student={student}
                    index={index}
                    isMe={student.id === myId || student._id === myId}
                    prevPoints={prevPointsMap.current[student.id || student._id]}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Refreshes every 5 seconds · Powered by real-time socket events
        </p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
