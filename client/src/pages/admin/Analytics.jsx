import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie,
  FaUsers,
  FaEye,
  FaClock,
  FaTrophy,
  FaGamepad,
  FaFlask,
  FaQuestionCircle,
  FaBook,
  FaDownload,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaFilter
} from 'react-icons/fa';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const overviewStats = [
    {
      title: 'Total Users',
      value: '4,938',
      change: '+12.5%',
      changeType: 'increase',
      icon: FaUsers,
      color: 'blue'
    },
    {
      title: 'Page Views',
      value: '45.2K',
      change: '+8.2%',
      changeType: 'increase',
      icon: FaEye,
      color: 'green'
    },
    {
      title: 'Avg. Session Time',
      value: '24m 32s',
      change: '+3.1%',
      changeType: 'increase',
      icon: FaClock,
      color: 'purple'
    },
    {
      title: 'Engagement Rate',
      value: '68.4%',
      change: '-2.3%',
      changeType: 'decrease',
      icon: FaTrophy,
      color: 'orange'
    }
  ];

  const contentStats = [
    {
      title: 'Games Played',
      value: '12,843',
      sessions: '8,234',
      icon: FaGamepad,
      color: 'green'
    },
    {
      title: 'Experiments Done',
      value: '3,421',
      sessions: '2,156',
      icon: FaFlask,
      color: 'purple'
    },
    {
      title: 'Quizzes Taken',
      value: '18,765',
      sessions: '11,234',
      icon: FaQuestionCircle,
      color: 'blue'
    },
    {
      title: 'Topics Viewed',
      value: '34,567',
      sessions: '15,678',
      icon: FaBook,
      color: 'orange'
    }
  ];

  const topContent = [
    {
      title: 'Water Conservation Quiz',
      type: 'Quiz',
      views: 2134,
      engagement: 89,
      category: 'Water'
    },
    {
      title: 'Eco Warriors Adventure',
      type: 'Game',
      views: 1876,
      engagement: 92,
      category: 'General'
    },
    {
      title: 'Plant Growth Experiment',
      type: 'Experiment',
      views: 1654,
      engagement: 87,
      category: 'Biodiversity'
    },
    {
      title: 'Solar Energy Basics',
      type: 'Topic',
      views: 1543,
      engagement: 85,
      category: 'Energy'
    },
    {
      title: 'Waste Sorting Challenge',
      type: 'Game',
      views: 1432,
      engagement: 91,
      category: 'Waste'
    }
  ];

  const userDemographics = {
    grades: [
      { grade: '6th Grade', count: 892, percentage: 18.1 },
      { grade: '7th Grade', count: 1034, percentage: 20.9 },
      { grade: '8th Grade', count: 1156, percentage: 23.4 },
      { grade: '9th Grade', count: 987, percentage: 20.0 },
      { grade: '10th Grade', count: 869, percentage: 17.6 }
    ],
    states: [
      { state: 'Maharashtra', count: 1245, percentage: 25.2 },
      { state: 'Tamil Nadu', count: 987, percentage: 20.0 },
      { state: 'Karnataka', count: 876, percentage: 17.7 },
      { state: 'Gujarat', count: 654, percentage: 13.2 },
      { state: 'Delhi', count: 543, percentage: 11.0 },
      { state: 'Others', count: 633, percentage: 12.9 }
    ]
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase': return <FaArrowUp className="text-green-500" />;
      case 'decrease': return <FaArrowDown className="text-red-500" />;
      default: return <FaMinus className="text-gray-500" />;
    }
  };

  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className="flex items-center mt-1">
              {getChangeIcon(stat.changeType)}
              <span className={`text-sm ml-1 ${
                stat.changeType === 'increase' ? 'text-green-600' : 
                stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform usage and engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Growth Trend</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <FaChartLine />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <FaChartBar />
              </button>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaChartLine className="text-4xl text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-500">Interactive chart would be displayed here</p>
              <p className="text-sm text-gray-400">Showing {timeRange} user growth data</p>
            </div>
          </div>
        </div>

        {/* Content Engagement */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Engagement</h2>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FaChartPie />
            </button>
          </div>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaChartPie className="text-4xl text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-500">Engagement pie chart would be displayed here</p>
              <p className="text-sm text-gray-400">Content type distribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {contentStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                  <IconComponent className={`text-2xl text-${stat.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.sessions} unique sessions</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Content and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h2>
          <div className="space-y-4">
            {topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{content.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {content.type}
                    </span>
                    <span>{content.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{content.views} views</p>
                  <p className="text-xs text-gray-500">{content.engagement}% engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h2>
          
          {/* Grades Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Grade Distribution</h3>
            <div className="space-y-2">
              {userDemographics.grades.map((grade, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{grade.grade}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${grade.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {grade.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* States Distribution */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top States</h3>
            <div className="space-y-2">
              {userDemographics.states.slice(0, 5).map((state, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{state.state}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${state.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {state.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Real-time Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">247</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">34</p>
            <p className="text-sm text-gray-600">Games Being Played</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">18</p>
            <p className="text-sm text-gray-600">Experiments in Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;