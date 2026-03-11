import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { challengesAPI } from '../utils/api';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChallenge();
    // eslint-disable-next-line
  }, [id]);

  const loadChallenge = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await challengesAPI.getChallengeById(id);
      setChallenge(response.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Challenge not found');
      console.error('[ChallengeDetailPage] Error loading challenge:', err);
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
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 py-24">
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center text-gray-600">
            Loading challenge details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 py-24">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
            <div className="font-semibold">Challenge not found</div>
            <div className="text-sm mt-1">{error}</div>
            <button
              onClick={() => navigate('/challenges')}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userSchool = user?.profile?.school;
  const schoolInChallenge = challenge.schools.find((s) => s.schoolName === userSchool);
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  const sortedSchools = [...challenge.schools].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-8 mb-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={() => navigate('/challenges')}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ← Back to Challenges
            </button>
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
          <p className="text-gray-600 mb-6">{challenge.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Challenge Type</div>
              <div className="font-semibold text-gray-900 capitalize">
                {challenge.challengeType.replace('_', ' ')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Start Date</div>
              <div className="font-semibold text-gray-900">
                {new Date(challenge.startsAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">End Date</div>
              <div className="font-semibold text-gray-900">
                {new Date(challenge.endsAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Competition Rules Display */}
          {challenge.rules && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">⚙️ Competition Rules</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-600">Difficulty</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {challenge.rules.difficultyTier || 'Medium'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Points Multiplier</div>
                  <div className="font-semibold text-gray-900">
                    {challenge.rules.pointsMultiplier || 1}x
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Min Participants</div>
                  <div className="font-semibold text-gray-900">
                    {challenge.rules.minParticipants || 5}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Max Schools</div>
                  <div className="font-semibold text-gray-900">
                    {challenge.rules.maxSchools || 20}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isActive && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 font-semibold">
                ⏱️ {getTimeRemaining(challenge.endsAt)}
              </div>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isCompleted ? 'Final Rankings' : 'Current Standings'}
          </h2>

          {/* Podium (Top 3) */}
          {sortedSchools.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl mb-2">
                  🥈
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-sm">{sortedSchools[1].schoolName}</div>
                  <div className="text-xs text-gray-600">{sortedSchools[1].totalScore} pts</div>
                </div>
                <div className="mt-2 w-24 h-16 bg-gray-200 rounded-t-lg"></div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-4xl mb-2 shadow-lg">
                  🥇
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{sortedSchools[0].schoolName}</div>
                  <div className="text-sm text-gray-600">{sortedSchools[0].totalScore} pts</div>
                </div>
                <div className="mt-2 w-24 h-24 bg-yellow-400 rounded-t-lg"></div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-orange-300 flex items-center justify-center text-3xl mb-2">
                  🥉
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-sm">{sortedSchools[2].schoolName}</div>
                  <div className="text-xs text-gray-600">{sortedSchools[2].totalScore} pts</div>
                </div>
                <div className="mt-2 w-24 h-12 bg-orange-300 rounded-t-lg"></div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">School</th>
                  <th className="text-center px-4 py-3">Score</th>
                  <th className="text-center px-4 py-3">Participants</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchools.map((school, index) => {
                  const isUserSchool = school.schoolName === userSchool;

                  return (
                    <tr
                      key={index}
                      className={`border-t border-gray-100 ${
                        isUserSchool ? 'bg-green-50 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        {school.schoolName}
                        {isUserSchool && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">
                            Your School
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{school.totalScore}</td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {school.participantCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* User School Status */}
          {schoolInChallenge && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-900 mb-1">Your School's Performance</div>
              <div className="text-sm text-green-700">
                Rank #{sortedSchools.findIndex((s) => s.schoolName === userSchool) + 1} •{' '}
                {schoolInChallenge.totalScore} points • {schoolInChallenge.participantCount} participants
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
