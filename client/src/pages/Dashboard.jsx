import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaTrophy,
  FaGamepad,
  FaFlask,
  FaQuestionCircle,
  FaBook,
  FaClock,
  FaFire,
  FaStar,
  FaChartLine,
  FaBolt,
  FaLeaf,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    streak: 0,
    completedActivities: 0,
    badges: 0,
    rank: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Fetch user stats and activities
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // This would normally fetch from API
      setStats({
        totalPoints: 1250,
        level: 5,
        streak: 7,
        completedActivities: 28,
        badges: 12,
        rank: 156
      });

      setRecentActivities([
        {
          id: 1,
          type: 'quiz',
          title: 'Water Conservation Quiz',
          points: 50,
          timestamp: '2 hours ago',
          icon: FaQuestionCircle,
          color: 'blue'
        },
        {
          id: 2,
          type: 'game',
          title: 'Eco Warriors Adventure',
          points: 75,
          timestamp: '1 day ago',
          icon: FaGamepad,
          color: 'green'
        },
        {
          id: 3,
          type: 'experiment',
          title: 'Plant Growth Experiment',
          points: 100,
          timestamp: '2 days ago',
          icon: FaFlask,
          color: 'purple'
        }
      ]);

      setRecommendations([
        {
          id: 1,
          title: 'Climate Change Basics',
          type: 'topic',
          difficulty: 'Beginner',
          estimatedTime: '15 min',
          points: 60
        },
        {
          id: 2,
          title: 'Renewable Energy Game',
          type: 'game',
          difficulty: 'Intermediate',
          estimatedTime: '20 min',
          points: 80
        },
        {
          id: 3,
          title: 'Air Quality Experiment',
          type: 'experiment',
          difficulty: 'Advanced',
          estimatedTime: '30 min',
          points: 120
        }
      ]);

      setAchievements([
        {
          id: 1,
          title: 'Water Warrior',
          description: 'Completed all water conservation activities',
          icon: '💧',
          earned: true,
          date: '2024-01-15'
        },
        {
          id: 2,
          title: 'Green Thumb',
          description: 'Completed 5 plant-related experiments',
          icon: '🌱',
          earned: true,
          date: '2024-01-10'
        },
        {
          id: 3,
          title: 'Quiz Master',
          description: 'Score 100% on 10 quizzes',
          icon: '🧠',
          earned: false,
          progress: 7
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.morning') || 'Good morning';
    if (hour < 17) return t('dashboard.afternoon') || 'Good afternoon';
    return t('dashboard.evening') || 'Good evening';
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
        <Icon className="text-3xl opacity-80" />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {getGreeting()}, {user?.firstName || 'EcoKid'}! 🌟
              </h1>
              <p className="text-gray-600 mt-1">{t('dashboard.readyToLearn') || 'Ready to learn something new about our planet?'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('profile.currentStreak')}</p>
                <div className="flex items-center text-orange-500">
                  <FaFire className="mr-1" />
                  <span className="font-bold">{stats.streak} days</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🌍
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaTrophy}
            title={t('profile.totalEP')}
            value={stats.totalPoints.toLocaleString()}
            subtitle={t('dashboard.keepItUp') || 'Keep it up!'}
            color="from-yellow-400 to-orange-500"
          />
          <StatCard
            icon={FaStar}
            title={t('profile.level', { level: '' }).replace(' ', '').trim() || 'Current Level'}
            value={stats.level}
            subtitle={t('grades.band_explorer')}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={FaChartLine}
            title={t('profile.quizzesCompleted')}
            value={stats.completedActivities}
            subtitle={t('dashboard.thisMonth') || 'This month'}
            color="from-green-400 to-blue-500"
          />
          <StatCard
            icon={FaBolt}
            title={t('leaderboard.rank')}
            value={`#${stats.rank}`}
            subtitle={t('dashboard.globalRank') || 'Among peers'}
            color="from-blue-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--s1)] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaBolt className="text-yellow-500 mr-2" />
                {t('dashboard.quickStart') || 'Quick Start'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/games" className="group">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 hover:from-green-200 hover:to-green-300 transition-all group-hover:scale-105">
                    <FaGamepad className="text-2xl text-green-600 mb-2" />
                    <h3 className="font-semibold text-gray-800">{t('nav.games')}</h3>
                    <p className="text-sm text-gray-600">{t('home.games_subtitle').slice(0, 30) || 'Learn through fun!'}</p>
                  </div>
                </Link>
                <Link to="/experiments" className="group">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 hover:from-purple-200 hover:to-purple-300 transition-all group-hover:scale-105">
                    <FaFlask className="text-2xl text-purple-600 mb-2" />
                    <h3 className="font-semibold text-gray-800">{t('nav.experiments')}</h3>
                    <p className="text-sm text-gray-600">{t('experiments.title').slice(0, 25) || 'Hands-on learning'}</p>
                  </div>
                </Link>
                <Link to="/quiz" className="group">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 hover:from-blue-200 hover:to-blue-300 transition-all group-hover:scale-105">
                    <FaQuestionCircle className="text-2xl text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-800">{t('nav.quizzes')}</h3>
                    <p className="text-sm text-gray-600">{t('quiz.subtitle').slice(0, 25) || 'Test your knowledge'}</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--s1)] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="text-blue-500 mr-2" />
                {t('profile.recentActivity')}
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-full bg-${activity.color}-100 mr-4`}>
                        <IconComponent className={`text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">+{activity.points}</p>
                        <p className="text-xs text-gray-500">{t('leaderboard.ep') || 'points'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/profile" className="block mt-4 text-center text-blue-500 hover:text-blue-600 font-semibold">
                {t('dashboard.viewAllActivities') || 'View All Activities'} →
              </Link>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[var(--s1)] rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaLeaf className="text-green-500 mr-2" />
                {t('dashboard.recommendedForYou') || 'Recommended for You'}
              </h2>
              <div className="space-y-4">
                {recommendations.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {item.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {item.estimatedTime}
                        </span>
                        <span className="flex items-center">
                          <FaStar className="mr-1 text-yellow-500" />
                          {item.points} points
                        </span>
                      </div>
                      <button className="flex items-center text-blue-500 hover:text-blue-600 font-semibold">
                        {t('quiz.start')} <FaArrowRight className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--s1)] rounded-xl shadow-lg p-6"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-2xl text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600 text-sm">Grade {user?.grade || 'N/A'}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.badges}</p>
                    <p className="text-xs text-gray-600">{t('profile.badgesEarned')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.level}</p>
                    <p className="text-xs text-gray-600">{t('profile.currentStreak')}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="mt-4 block w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--s1)] rounded-xl shadow-lg p-6"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <FaTrophy className="text-yellow-500 mr-2" />
                {t('profile.myBadges')}
              </h3>
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className={`p-3 rounded-lg border ${achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                        {!achievement.earned && achievement.progress && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${(achievement.progress / 10) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{achievement.progress}/10</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/profile?tab=achievements"
                className="block mt-4 text-center text-blue-500 hover:text-blue-600 font-semibold text-sm"
              >
                {t('dashboard.viewAllAchievements') || 'View All Achievements'} →
              </Link>
            </motion.div>

            {/* Today's Goal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="text-green-500 mr-2" />
                {t('dashboard.todayGoal') || "Today's Goal"}
              </h3>
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm text-gray-700 mb-4">{t('dashboard.streakGoal') || 'Complete 3 activities to maintain your streak!'}</p>
                <div className="w-full bg-[var(--s1)] rounded-full h-3 mb-2">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <p className="text-xs text-gray-600">{t('dashboard.twoOfThree') || '2 of 3 completed'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;