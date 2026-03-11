import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, profileRes, badgesRes, progressRes] = await Promise.all([
        axios.get('/api/v1/student/dashboard', { headers }),
        axios.get('/api/v1/student/my-profile', { headers }),
        axios.get('/api/v1/student/my-badges', { headers }),
        axios.get('/api/v1/student/my-progress', { headers })
      ]);

      setDashboard(dashRes.data.dashboard);
      setProfile(profileRes.data.profile);
      setBadges(badgesRes.data.badges || []);
      setProgress(progressRes.data.progress);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading your dashboard...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.firstName}! 🌍</h1>
          <p className="text-lg opacity-90">Your eco-journey tracker</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Eco-Points</p>
            <p className="text-3xl font-bold text-green-600">{progress?.ecoPoints || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Level</p>
            <p className="text-3xl font-bold text-blue-600">{progress?.level || 1}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Streak 🔥</p>
            <p className="text-3xl font-bold text-orange-600">{progress?.streak || 0} days</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Badges</p>
            <p className="text-3xl font-bold text-purple-600">{badges.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
              {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentActivities.map(activity => (
                    <div key={activity._id} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-green-600 font-bold">+{activity.ecoPoints || 0} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activities yet. Start your eco-journey!</p>
              )}
            </div>
          </div>

          {/* Badges & Quick Links */}
          <div>
            {/* Badges */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Badges ({badges.length})</h2>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, idx) => (
                    <div key={idx} className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-xl shadow-lg" title={badge.name}>
                      ⭐
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No badges yet. Complete activities to earn them!</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/leaderboards')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
                >
                  📊 View Leaderboards
                </button>
                <button
                  onClick={() => navigate('/lessons')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left"
                >
                  📚 Learn Lessons
                </button>
                <button
                  onClick={() => navigate('/buddies')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left"
                >
                  👥 Find Buddies
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold text-gray-800">{profile?.firstName} {profile?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold text-gray-800">{profile?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="font-semibold text-gray-800">{new Date(progress?.joinedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
