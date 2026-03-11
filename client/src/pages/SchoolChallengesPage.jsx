import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { challengesAPI } from '../utils/api';

const SchoolChallengesPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeChallenges, setActiveChallenges] = useState([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load all challenges
      const response = await challengesAPI.getAllChallenges();
      const challenges = response.data?.data || [];

      const now = new Date();

      // Filter challenges by status
      setActiveChallenges(
        challenges.filter(
          (c) => c.status === 'active' && new Date(c.startsAt) <= now && new Date(c.endsAt) >= now
        )
      );
      setUpcomingChallenges(
        challenges.filter((c) => c.status === 'draft' || new Date(c.startsAt) > now)
      );
      setCompletedChallenges(challenges.filter((c) => c.status === 'completed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load challenges');
      console.error('[SchoolChallengesPage] Error loading challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const renderChallengeCard = (challenge) => {
    const isActive = challenge.status === 'active';
    const isCompleted = challenge.status === 'completed';
    const userSchool = user?.profile?.school;
    const schoolInChallenge = challenge.schools.find((s) => s.schoolName === userSchool);

    return (
      <motion.div
        key={challenge._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => navigate(`/challenges/${challenge._id}`)}
      >
        {/* Challenge Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-green-100 text-green-700'
                : isCompleted
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isActive ? '🔥 Active' : isCompleted ? '✅ Completed' : '📅 Upcoming'}
          </div>
        </div>

        {/* Challenge Type & Metric */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="font-semibold">Type:</span> {challenge.challengeType.replace('_', ' ')}
          </span>
          {challenge.rules?.difficultyTier && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              challenge.rules.difficultyTier === 'extreme' ? 'bg-red-100 text-red-700' :
              challenge.rules.difficultyTier === 'hard' ? 'bg-orange-100 text-orange-700' :
              challenge.rules.difficultyTier === 'medium' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {challenge.rules.difficultyTier.toUpperCase()}
            </span>
          )}
          {challenge.rules?.pointsMultiplier > 1 && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
              {challenge.rules.pointsMultiplier}x BONUS
            </span>
          )}
          {isActive && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              ⏱️ {getTimeRemaining(challenge.endsAt)}
            </span>
          )}
        </div>

        {/* Participating Schools */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2 font-semibold">
            {challenge.schools.length} Schools Competing
          </div>
          <div className="flex flex-wrap gap-2">
            {challenge.schools.slice(0, 5).map((school, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-lg text-xs ${
                  school.schoolName === userSchool
                    ? 'bg-green-100 text-green-700 font-semibold border border-green-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                {school.schoolName}
                {school.totalScore > 0 && ` • ${school.totalScore} pts`}
              </div>
            ))}
            {challenge.schools.length > 5 && (
              <div className="px-3 py-1 rounded-lg text-xs bg-gray-50 text-gray-500">
                +{challenge.schools.length - 5} more
              </div>
            )}
          </div>
        </div>

        {/* User School Status */}
        {schoolInChallenge && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your School:</span>
              <span className="font-bold text-green-700">
                {schoolInChallenge.totalScore} points • Rank{' '}
                {challenge.schools
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .findIndex((s) => s.schoolName === userSchool) + 1}
              </span>
            </div>
          </div>
        )}

        {/* Completed Challenge - Show Winner */}
        {isCompleted && challenge.results?.rankings?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">🏆 Winner</div>
            <div className="font-bold text-yellow-700 text-sm">
              {challenge.results.rankings[0].schoolName} - {challenge.results.rankings[0].totalScore} pts
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">School Challenges</h1>
              <p className="text-gray-600 mt-1">
                Compete with schools across India in eco-action challenges! 🏆
              </p>
            </div>
            {user?.role === 'teacher' || user?.role === 'school_admin' && (
              <button
                onClick={() => navigate('/challenges/create')}
                className="px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium"
              >
                ➕ Create Challenge
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['active', 'upcoming', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                {tab === 'active'
                  ? activeChallenges.length
                  : tab === 'upcoming'
                  ? upcomingChallenges.length
                  : completedChallenges.length}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            Loading challenges...
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
            <div className="font-semibold">Could not load challenges</div>
            <div className="text-sm mt-1">{error}</div>
            <button
              onClick={loadChallenges}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Challenges Grid */}
        {!isLoading && !error && (
          <>
            {activeTab === 'active' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {activeChallenges.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-10 border border-gray-200 text-center">
                    <p className="text-5xl mb-4">🌱</p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No active challenges</h3>
                    <p className="text-gray-600 text-sm">Check back soon for new challenges!</p>
                  </div>
                ) : (
                  activeChallenges.map(renderChallengeCard)
                )}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {upcomingChallenges.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-10 border border-gray-200 text-center">
                    <p className="text-5xl mb-4">📅</p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming challenges</h3>
                    <p className="text-gray-600 text-sm">Stay tuned for future competitions!</p>
                  </div>
                ) : (
                  upcomingChallenges.map(renderChallengeCard)
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {completedChallenges.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-10 border border-gray-200 text-center">
                    <p className="text-5xl mb-4">🏆</p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed challenges</h3>
                    <p className="text-gray-600 text-sm">Completed challenges will appear here.</p>
                  </div>
                ) : (
                  completedChallenges.map(renderChallengeCard)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolChallengesPage;
