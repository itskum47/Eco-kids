import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrophy,
  FaMedal,
  FaFire,
  FaStar,
  FaChartLine,
  FaGift,
  FaCrown,
  FaLock,
  FaCertificate,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import { addToast } from '../store/slices/uiSlice';
import { apiRequest } from '../utils/api';

const ProfileGamification = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [gamificationData, setGamificationData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [levels, setLevels] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      fetchGamificationData();
    }
  }, [isAuthenticated]);

  const fetchGamificationData = async () => {
    try {
      const [gamificationRes, badgesRes, levelsRes, certificatesRes] = await Promise.all([
        apiRequest('/gamification/me'),
        apiRequest('/gamification/badges'),
        apiRequest('/gamification/levels'),
        apiRequest('/gamification/me/certificates')
      ]);

      setGamificationData(gamificationRes.data);
      setBadges(badgesRes.data);
      setLevels(levelsRes.data);
      setCertificates(certificatesRes.data);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to load gamification data'
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const response = await apiRequest('/gamification/check-achievements', {
        method: 'POST'
      });

      const { newBadges, levelUp, newLevel, bonusPoints } = response.data;

      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
          dispatch(addToast({
            type: 'success',
            message: `🏆 New badge earned: ${badge.name}!`
          }));
        });
      }

      if (levelUp) {
        dispatch(addToast({
          type: 'success',
          message: `🎉 Level up! You're now ${newLevel.name}! (+${bonusPoints} bonus points)`
        }));
      }

      // Refresh data
      fetchGamificationData();
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: 'Failed to check achievements'
      }));
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'common': return 'shadow-md';
      case 'rare': return 'shadow-lg shadow-blue-200';
      case 'epic': return 'shadow-xl shadow-purple-200';
      case 'legendary': return 'shadow-2xl shadow-yellow-200';
      default: return 'shadow-md';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
        <p className="text-gray-600">Please log in to view your achievements and progress.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="space-y-6 w-full max-w-4xl px-4">
          <div className="w-full bg-[var(--s2)] h-32 rounded-xl animate-[shimmer_1.5s_infinite]"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full bg-[var(--s2)] h-24 rounded-xl animate-[shimmer_1.5s_infinite]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    points,
    level,
    currentLevel,
    nextLevel,
    streaks,
    badges: earnedBadges,
    recentPoints,
    globalRank,
    progress
  } = gamificationData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
              <p className="text-purple-100">
                Track your progress and celebrate your eco-learning journey!
              </p>
            </div>
            <button
              onClick={checkAchievements}
              className="bg-[var(--s1)]/20 hover:bg-[var(--s1)]/30 px-6 py-3 rounded-lg transition-colors"
            >
              <FaGift className="mr-2" />
              Check New Achievements
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--s1)] rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">⭐</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{points}</div>
                <div className="text-sm text-gray-600">EcoPoints</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Global Rank: #{globalRank}</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--s1)] rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{currentLevel?.icon || '🌱'}</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{level}</div>
                <div className="text-sm text-gray-600">{currentLevel?.name}</div>
              </div>
            </div>
            {progress && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--s1)] rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🔥</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{streaks.current}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Best: {streaks.longest} days</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[var(--s1)] rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🏆</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {badges.length - earnedBadges.length} remaining
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[var(--s1)] rounded-xl shadow-md mb-8">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartLine },
              { id: 'badges', label: 'Badges', icon: FaMedal },
              { id: 'levels', label: 'Levels', icon: FaCrown },
              { id: 'certificates', label: 'Certificates', icon: FaCertificate }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Level Progress */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Level Progress</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{currentLevel?.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold">{currentLevel?.name}</h4>
                          <p className="text-sm text-gray-600">Level {level}</p>
                        </div>
                      </div>
                      {nextLevel && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Next: {nextLevel.name}</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {nextLevel.minPoints - points} points to go
                          </div>
                        </div>
                      )}
                    </div>

                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{currentLevel?.minPoints} points</span>
                          <span>{Math.round(progress.percentage)}% complete</span>
                          <span>{nextLevel?.minPoints} points</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Points</h3>
                  <div className="space-y-3">
                    {recentPoints.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-800">{activity.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          +{activity.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Badge Collection ({earnedBadges.length}/{badges.length})
                  </h3>
                  <div className="text-sm text-gray-600">
                    {Math.round((earnedBadges.length / badges.length) * 100)}% complete
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map(badge => {
                    const earned = badge.earned;
                    const earnedBadge = earnedBadges.find(eb => eb.badge._id === badge._id);

                    return (
                      <motion.div
                        key={badge._id}
                        whileHover={earned ? { scale: 1.05 } : {}}
                        className={`
                          relative rounded-xl p-6 border-2 transition-all duration-300
                          ${earned
                            ? `${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)}`
                            : 'border-gray-200 bg-gray-100 opacity-60'
                          }
                        `}
                      >
                        {!earned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[var(--s1)]/80 rounded-xl">
                            <FaLock className="text-2xl text-gray-400" />
                          </div>
                        )}

                        <div className="text-center">
                          <div className="text-4xl mb-3">{badge.icon}</div>
                          <h4 className="font-bold text-gray-800 mb-2">{badge.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{badge.description}</p>

                          <div className="flex items-center justify-between text-xs">
                            <span className={`
                              px-2 py-1 rounded capitalize font-medium
                              ${badge.rarity === 'common' ? 'bg-gray-200 text-gray-800' :
                                badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                                  badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                                    'bg-yellow-200 text-yellow-800'}
                            `}>
                              {badge.rarity}
                            </span>
                            <span className="text-green-600 font-medium">
                              {badge.points} pts
                            </span>
                          </div>

                          {earned && earnedBadge && (
                            <div className="mt-3 text-xs text-gray-500">
                              Earned: {new Date(earnedBadge.awardedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Levels Tab */}
            {activeTab === 'levels' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Level Progression</h3>

                <div className="space-y-4">
                  {levels.map(levelItem => (
                    <div
                      key={levelItem._id}
                      className={`
                        rounded-xl p-6 border-2 transition-all duration-300
                        ${levelItem.current
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : levelItem.unlocked
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{levelItem.icon}</div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">
                              {levelItem.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Level {levelItem.level} • {levelItem.minPoints}-{levelItem.maxPoints} points
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {levelItem.current && (
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Current
                            </span>
                          )}
                          {!levelItem.unlocked && (
                            <FaLock className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      {levelItem.benefits && levelItem.benefits.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                          <ul className="space-y-1">
                            {levelItem.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                <FaStar className="text-yellow-500 text-xs" />
                                {benefit.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Your Certificates ({certificates.length})
                </h3>

                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📜</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">
                      No certificates yet
                    </h4>
                    <p className="text-gray-500">
                      Complete quizzes and reach milestones to earn certificates!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((certificate, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 shadow-md"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl">🏆</div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {new Date(certificate.issuedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {certificate.data.certificateId}
                            </div>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-2">
                          {certificate.template.name}
                        </h4>

                        <p className="text-sm text-gray-600 mb-4">
                          Certificate Type: {certificate.template.type.replace('_', ' ')}
                        </p>

                        <div className="flex gap-3">
                          <button className="flex-1 btn btn-primary btn-sm">
                            <FaDownload className="mr-2" />
                            Download
                          </button>
                          <button className="btn btn-outline btn-sm">
                            <FaShare className="mr-2" />
                            Share
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileGamification;