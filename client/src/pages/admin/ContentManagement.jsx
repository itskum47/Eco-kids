import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCopy,
  FaBook,
  FaGamepad,
  FaFlask,
  FaQuestionCircle,
  FaSearch,
  FaFilter,
  FaTags
} from 'react-icons/fa';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('topics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'topics', label: 'Topics', icon: FaBook, count: 45 },
    { id: 'games', label: 'Games', icon: FaGamepad, count: 12 },
    { id: 'experiments', label: 'Experiments', icon: FaFlask, count: 28 },
    { id: 'quizzes', label: 'Quizzes', icon: FaQuestionCircle, count: 67 }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'water', label: 'Water Conservation' },
    { value: 'energy', label: 'Renewable Energy' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'biodiversity', label: 'Biodiversity' },
    { value: 'climate', label: 'Climate Change' },
    { value: 'pollution', label: 'Air Pollution' }
  ];

  const sampleContent = {
    topics: [
      {
        id: 1,
        title: 'Water Conservation in India',
        category: 'water',
        status: 'published',
        views: 1234,
        lastModified: '2024-01-15',
        author: 'Dr. Rajesh Kumar'
      },
      {
        id: 2,
        title: 'Solar Energy Basics',
        category: 'energy',
        status: 'draft',
        views: 0,
        lastModified: '2024-01-14',
        author: 'Priya Sharma'
      },
      {
        id: 3,
        title: 'Indian Wildlife Protection',
        category: 'biodiversity',
        status: 'published',
        views: 856,
        lastModified: '2024-01-13',
        author: 'Amit Patel'
      }
    ],
    games: [
      {
        id: 1,
        title: 'Eco Maze Adventure',
        category: 'general',
        status: 'published',
        plays: 5678,
        lastModified: '2024-01-12',
        difficulty: 'Medium'
      },
      {
        id: 2,
        title: 'Waste Sorting Challenge',
        category: 'waste',
        status: 'published',
        plays: 3421,
        lastModified: '2024-01-11',
        difficulty: 'Easy'
      }
    ],
    experiments: [
      {
        id: 1,
        title: 'Plant Growth Experiment',
        category: 'biodiversity',
        status: 'published',
        submissions: 234,
        lastModified: '2024-01-10',
        duration: '2 weeks'
      },
      {
        id: 2,
        title: 'Solar Oven Construction',
        category: 'energy',
        status: 'published',
        submissions: 156,
        lastModified: '2024-01-09',
        duration: '1 day'
      }
    ],
    quizzes: [
      {
        id: 1,
        title: 'Water Conservation Quiz',
        category: 'water',
        status: 'published',
        attempts: 2134,
        lastModified: '2024-01-08',
        questions: 15
      },
      {
        id: 2,
        title: 'Climate Change Assessment',
        category: 'climate',
        status: 'draft',
        attempts: 0,
        lastModified: '2024-01-07',
        questions: 20
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ContentTable = ({ items, type }) => (
    <div className="bg-[var(--s1)] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {type === 'topics' ? 'Views' : 
               type === 'games' ? 'Plays' : 
               type === 'experiments' ? 'Submissions' : 'Attempts'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--s1)] divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                {item.author && (
                  <div className="text-sm text-gray-500">by {item.author}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.views || item.plays || item.submissions || item.attempts || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.lastModified}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <FaEye />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <FaEdit />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FaCopy />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage topics, games, experiments, and quizzes</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaPlus className="mr-2" />
          Create New
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--s1)] rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaTags className="mr-2 text-gray-400" />
              More Filters
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6">
          <ContentTable items={sampleContent[activeTab] || []} type={activeTab} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--s1)] rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBook className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">152</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--s1)] rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaEye className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">24.5K</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--s1)] rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaEdit className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft Items</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--s1)] rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaQuestionCircle className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;