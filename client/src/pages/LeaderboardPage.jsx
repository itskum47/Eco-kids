import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const LeaderboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const [leaderboards, setLeaderboards] = useState({
    global: [],
    school: [],
    district: [],
    myRank: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [globalRes, schoolRes, districtRes, myRankRes] = await Promise.all([
        axios.get('/api/v1/leaderboards/global', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/v1/leaderboards/school/${user?.schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/v1/leaderboards/district/${user?.districtId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/leaderboards/my-rank', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setLeaderboards({
        global: globalRes.data.students || [],
        school: schoolRes.data.students || [],
        district: districtRes.data.students || [],
        myRank: myRankRes.data.rank
      });
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading leaderboards...</div>;
  }

  const currentData = leaderboards[activeTab] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Leaderboards</h1>
          <p className="text-gray-600">Track your eco-points and compete with students worldwide!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* My Rank Card */}
        {leaderboards.myRank && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Your Rank</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm opacity-90">Rank</p>
                <p className="text-3xl font-bold">#{leaderboards.myRank.rank}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Eco-Points</p>
                <p className="text-3xl font-bold">{leaderboards.myRank.ecoPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Level</p>
                <p className="text-3xl font-bold">{leaderboards.myRank.level}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Streak</p>
                <p className="text-3xl font-bold">{leaderboards.myRank.streak} days</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            {['global', 'school', 'district'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">School</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Eco-Points</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Streak</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((student, index) => (
                  <tr key={student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.school || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">{student.ecoPoints}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{student.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{student.streak} 🔥</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
