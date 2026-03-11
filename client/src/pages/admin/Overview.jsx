import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaBook, 
  FaGamepad, 
  FaFlask,
  FaQuestionCircle,
  FaChartLine,
  FaEye,
  FaUserGraduate
} from 'react-icons/fa';

const AdminOverview = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'increase',
      icon: FaUsers,
      color: 'blue'
    },
    {
      title: 'Active Content',
      value: '156',
      change: '+5%',
      changeType: 'increase',
      icon: FaBook,
      color: 'green'
    },
    {
      title: 'Games Played',
      value: '12,843',
      change: '+23%',
      changeType: 'increase',
      icon: FaGamepad,
      color: 'purple'
    },
    {
      title: 'Experiments Done',
      value: '3,421',
      change: '+8%',
      changeType: 'increase',
      icon: FaFlask,
      color: 'orange'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Arjun Sharma',
      action: 'Completed Water Conservation Quiz',
      time: '2 minutes ago',
      type: 'quiz'
    },
    {
      id: 2,
      user: 'Priya Patel',
      action: 'Started Solar Energy Experiment',
      time: '5 minutes ago',
      type: 'experiment'
    },
    {
      id: 3,
      user: 'Rajesh Kumar',
      action: 'Achieved Level 5 in Eco Warriors',
      time: '8 minutes ago',
      type: 'game'
    },
    {
      id: 4,
      user: 'Sneha Gupta',
      action: 'Registered new account',
      time: '12 minutes ago',
      type: 'user'
    }
  ];

  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-[var(--s1)] rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-sm ${
              stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </p>
          </div>
          <div className={`p-3 rounded-full bg-${stat.color}-100`}>
            <IconComponent className={`text-2xl text-${stat.color}-600`} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with EcoKids India.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 bg-[var(--s1)] rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Trends</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaChartLine className="text-4xl text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {activity.type === 'quiz' && <FaQuestionCircle className="text-blue-600 text-sm" />}
                  {activity.type === 'experiment' && <FaFlask className="text-purple-600 text-sm" />}
                  {activity.type === 'game' && <FaGamepad className="text-green-600 text-sm" />}
                  {activity.type === 'user' && <FaUserGraduate className="text-orange-600 text-sm" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--s1)] rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <FaBook className="text-2xl text-gray-400 group-hover:text-blue-500 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add New Topic</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
            <FaGamepad className="text-2xl text-gray-400 group-hover:text-green-500 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">Create Game</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
            <FaFlask className="text-2xl text-gray-400 group-hover:text-purple-500 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Add Experiment</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
            <FaEye className="text-2xl text-gray-400 group-hover:text-orange-500 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-orange-700">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;