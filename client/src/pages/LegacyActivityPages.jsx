import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';

const activityImages = {
  1: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
  2: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  3: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  4: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
  5: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  6: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
  7: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
  8: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  9: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop',
  10: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
  11: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
  12: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop'
};

const getCategoryColor = (color) => {
  const colors = {
    purple: 'bg-purple-600 hover:bg-purple-700 border-purple-600',
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-600',
    green: 'bg-green-600 hover:bg-green-700 border-green-600',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-600',
    red: 'bg-red-600 hover:bg-red-700 border-red-600',
    teal: 'bg-teal-600 hover:bg-teal-700 border-teal-600'
  };

  return colors[color] || colors.purple;
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ActivitiesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useTranslation();

  const activityCategories = [
    { id: 'all', name: 'All Activities', icon: '🌟', color: 'purple' },
    { id: 'indoor', name: 'Indoor Fun', icon: '🏠', color: 'blue' },
    { id: 'outdoor', name: 'Outdoor Adventures', icon: '🌳', color: 'green' },
    { id: 'family', name: 'Family Time', icon: '👨‍👩‍👧‍👦', color: 'orange' },
    { id: 'diy', name: 'DIY Projects', icon: '🛠️', color: 'red' },
    { id: 'science', name: 'Experiments', icon: '🧪', color: 'teal' }
  ];

  const activities = useMemo(() => {
    const list = t('activitiesList', { returnObjects: true });
    if (!list || typeof list !== 'object' || Array.isArray(list)) return [];

    return Object.keys(list).map((key) => ({
      id: Number.parseInt(key, 10),
      ...list[key],
      image: activityImages[key]
    }));
  }, [t]);

  const filteredActivities = selectedCategory === 'all'
    ? activities
    : activities.filter((activity) => activity.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-600">
      <Navbar />
      <div className="container mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 text-shadow-lg">🎯 Environmental Activities</h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Hands-on activities to explore, learn, and protect our environment. Perfect for curious kids and families!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {activityCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${selectedCategory === category.id
                ? `${getCategoryColor(category.color)} ring-4 ring-white ring-opacity-50`
                : 'bg-[var(--s1)] bg-opacity-20 hover:bg-opacity-30 border-2 border-white border-opacity-30'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-[var(--s1)] rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 group hover:shadow-3xl"
            >
              <div className="relative">
                <img src={activity.image} alt={activity.title} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{activity.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">⏱️ {activity.duration}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">👶 {activity.ageGroup}</span>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Materials needed:</h4>
                  <div className="flex flex-wrap gap-1">
                    {activity.materials.slice(0, 3).map((material, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {material}
                      </span>
                    ))}
                    {activity.materials.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{activity.materials.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <details className="mb-4 group">
                  <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800 transition-all duration-200 flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50">
                    <span className="transform group-open:rotate-90 transition-transform duration-200">▶️</span>
                    <span>View Instructions</span>
                  </summary>
                  <ol className="mt-2 space-y-1 text-sm text-gray-600">
                    {activity.instructions.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </details>

                <Link
                  to={`/activities/${activity.id}`}
                  className="block w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-center"
                >
                  Start Activity! 🌟
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-xl">No activities found in this category. Try selecting a different category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const LittleKidsPage = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const kidActivities = [
    {
      id: 1,
      title: 'Coloring Pages',
      description: 'Fun environmental coloring pages for little hands',
      icon: '🖍️',
      color: 'bg-pink-400',
      content: [
        { name: 'Happy Earth', image: '🌍', description: 'Color our beautiful planet!', link: '/little-kids/coloring/earth' },
        { name: 'Friendly Animals', image: '🦋', description: 'Color cute forest friends!', link: '/little-kids/coloring/butterfly' },
        { name: 'Clean Ocean', image: '🌊', description: 'Color fish and sea creatures!', link: '/little-kids/coloring/ocean' },
        { name: 'Green Trees', image: '🌳', description: 'Color a magical forest!', link: '/little-kids/coloring/tree' }
      ]
    },
    {
      id: 2,
      title: 'Environmental Songs',
      description: 'Catchy songs about taking care of nature',
      icon: '🎵',
      color: 'bg-blue-400',
      content: [
        { name: 'Earth is Our Home', image: '🏠', description: 'Sing about our planet!' },
        { name: 'Recycle Song', image: '♻️', description: 'Learn to reduce, reuse, recycle!' },
        { name: 'Animal Friends', image: '🐻', description: 'Songs about wildlife!' },
        { name: 'Clean Water', image: '💧', description: 'Keep our water clean!' }
      ]
    },
    {
      id: 3,
      title: 'Simple Games',
      description: 'Easy games for tiny environmental heroes',
      icon: '🎮',
      color: 'bg-green-400',
      content: [
        { name: 'Match the Animals', image: '🦆', description: 'Match animals to their homes!', link: '/games/animal-habitat' },
        { name: 'Sort the Trash', image: '🗑️', description: 'Help clean up!', link: '/games/recycling-sort' },
        { name: 'Find Hidden Objects', image: '🔍', description: 'Find nature items!' },
        { name: 'Memory Match', image: '🧠', description: 'Remember the animals!', link: '/games/ocean-memory' }
      ]
    },
    {
      id: 4,
      title: 'Story Time',
      description: 'Environmental stories for bedtime and playtime',
      icon: '📚',
      color: 'bg-purple-400',
      content: [
        { name: "Captain Planet's Adventure", image: '🌟', description: 'A hero saves the day!' },
        { name: 'The Little Seed', image: '🌱', description: 'Watch a plant grow!' },
        { name: 'Ocean Friends', image: '🐠', description: 'Animals help each other!' },
        { name: 'Clean Air Heroes', image: '💨', description: 'Kids make air cleaner!' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-8xl mb-4">🐸</div>
          <h1 className="text-6xl font-bold text-green-700 mb-4 font-comic">Little Kids Zone!</h1>
          <p className="text-2xl text-green-600 max-w-2xl mx-auto font-comic">
            Fun activities, songs, and games just for our youngest environmental heroes!
          </p>
        </div>

        <div className="text-center mb-8">
          <Link to="/" className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200">
            🏠 Back to Main Site
          </Link>
        </div>

        {!selectedActivity ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {kidActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`${activity.color} p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-white`}
              >
                <div className="text-6xl mb-4">{activity.icon}</div>
                <h2 className="text-3xl font-bold mb-4 font-comic">{activity.title}</h2>
                <p className="text-lg font-comic">{activity.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <button
                onClick={() => setSelectedActivity(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
              >
                ← Back to Activities
              </button>
              <h2 className="text-4xl font-bold text-green-700 mb-4 font-comic">
                {selectedActivity.icon} {selectedActivity.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedActivity.content.map((item, index) => (
                <div key={index} className="bg-[var(--s1)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl mb-4 text-center">{item.image}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 text-center font-comic">{item.name}</h3>
                  <p className="text-gray-600 text-center mb-4 font-comic">{item.description}</p>
                  {item.link ? (
                    <Link to={item.link} className="block w-full bg-green-400 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-center transition-colors">
                      Play Now! 🎮
                    </Link>
                  ) : (
                    <button className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-lg font-bold transition-colors">
                      Coming Soon! ✨
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const coloringTemplates = {
  earth: {
    title: 'Happy Earth',
    name: 'Our Beautiful Planet',
    description: 'Color the oceans, land, and clouds.'
  },
  butterfly: {
    title: 'Friendly Butterfly',
    name: 'Forest Friend',
    description: 'Try bright wings and bold patterns.'
  },
  tree: {
    title: 'Green Tree',
    name: 'Magical Forest Tree',
    description: 'Color the leaves, trunk, and fruit.'
  },
  ocean: {
    title: 'Clean Ocean',
    name: 'Ocean Scene',
    description: 'Bring the fish, seaweed, and water to life.'
  }
};

export const ColoringPage = () => {
  const { template } = useParams();
  const activeTemplate = coloringTemplates[template] || coloringTemplates.earth;
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [coloredParts, setColoredParts] = useState({});

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#10ac84', '#ee5a24', '#0abde3', '#3742fa', '#2f3542'
  ];

  const colorPart = (partId) => {
    setColoredParts((previous) => ({
      ...previous,
      [partId]: selectedColor
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link to="/little-kids" className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold mb-4 transform hover:scale-105 transition-all duration-200">
            ← Back to Little Kids
          </Link>
          <h1 className="text-4xl font-bold text-purple-700 mb-4">🖍️ {activeTemplate.title}</h1>
          <p className="text-lg text-purple-600">{activeTemplate.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <div className="flex-1">
            <div className="bg-[var(--s1)] rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{activeTemplate.name}</h2>
                <svg width="400" height="400" viewBox="0 0 400 400" className="border-4 border-gray-200 rounded-2xl mx-auto">
                  <rect x="0" y="0" width="400" height="400" fill={coloredParts.background || '#f8fafc'} onClick={() => colorPart('background')} className="cursor-pointer hover:opacity-80" />
                  <circle cx="200" cy="200" r="120" fill={coloredParts.core || '#e3f2fd'} stroke="#333" strokeWidth="3" onClick={() => colorPart('core')} className="cursor-pointer hover:opacity-80" />
                  <path d="M 120 160 Q 190 90 260 160 Q 230 220 160 210 Z" fill={coloredParts.accent1 || '#c8e6c9'} stroke="#333" strokeWidth="2" onClick={() => colorPart('accent1')} className="cursor-pointer hover:opacity-80" />
                  <path d="M 150 250 Q 220 210 280 260 Q 220 320 140 290 Z" fill={coloredParts.accent2 || '#ffe082'} stroke="#333" strokeWidth="2" onClick={() => colorPart('accent2')} className="cursor-pointer hover:opacity-80" />
                  <circle cx="160" cy="150" r="12" fill={coloredParts.dot1 || '#fff'} stroke="#333" strokeWidth="1" onClick={() => colorPart('dot1')} className="cursor-pointer hover:opacity-80" />
                  <circle cx="245" cy="180" r="10" fill={coloredParts.dot2 || '#fff'} stroke="#333" strokeWidth="1" onClick={() => colorPart('dot2')} className="cursor-pointer hover:opacity-80" />
                  <circle cx="210" cy="265" r="12" fill={coloredParts.dot3 || '#fff'} stroke="#333" strokeWidth="1" onClick={() => colorPart('dot3')} className="cursor-pointer hover:opacity-80" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:w-64">
            <div className="bg-[var(--s1)] rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🎨 Choose Your Colors!</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all duration-200 transform hover:scale-110 ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <button
                onClick={() => setColoredParts({})}
                className="w-full bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold transition-all duration-200"
              >
                🔄 Reset Colors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const activities = [
  {
    id: 1,
    title: 'Make a Bird Feeder',
    description: 'Create a simple bird feeder using recycled materials and observe local wildlife',
    image: activityImages[1],
    duration: '30 mins',
    materials: ['Plastic bottle', 'Seeds', 'String', 'Scissors'],
    ageGroup: '6-12 years',
    instructions: [
      'Clean an empty plastic bottle thoroughly with soap and water.',
      'Cut small holes around the bottle for birds to access seeds.',
      'Fill the bottle with bird seeds of your choice.',
      'Make holes at the top and thread string for hanging.',
      'Hang outside in a safe spot and observe which birds visit.'
    ]
  },
  {
    id: 2,
    title: 'Start a Herb Garden',
    description: 'Grow your own herbs on a windowsill and learn about sustainable food',
    image: activityImages[2],
    duration: '45 mins setup',
    materials: ['Small pots', 'Soil', 'Herb seeds', 'Water'],
    ageGroup: '4-14 years',
    instructions: [
      'Choose easy herbs like basil, mint, or parsley to start.',
      'Fill small pots with quality potting soil.',
      'Plant seeds according to packet instructions.',
      'Place pots in a sunny window that gets 4-6 hours of sunlight.',
      'Water regularly and watch them grow into delicious herbs.'
    ]
  },
  {
    id: 3,
    title: 'Nature Scavenger Hunt',
    description: 'Explore your local area and discover different plants, animals, and natural objects',
    image: activityImages[3],
    duration: '60 mins',
    materials: ['Checklist', 'Magnifying glass', 'Collection bag'],
    ageGroup: '5-15 years',
    instructions: [
      'Create a list of items to find such as leaves, rocks, or flowers.',
      'Go to a local park or nature area with an adult.',
      'Search for items on your list carefully and quietly.',
      'Take photos instead of picking flowers to protect plants.',
      'Discuss what you found and research anything unfamiliar.'
    ]
  }
];

export const ActivityRouter = () => {
  const { id } = useParams();
  const activity = activities.find((item) => item.id === Number.parseInt(id || '', 10));

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Activity Not Found</h1>
          <Link to="/activities" className="bg-[var(--s1)] text-orange-600 px-6 py-3 rounded-full font-bold">
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  return <ActivityDetailPage activityData={activity} />;
};

const ActivityDetailPage = ({ activityData }) => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const markStepComplete = (stepIndex) => {
    setCompletedSteps((previous) => (
      previous.includes(stepIndex) ? previous : [...previous, stepIndex]
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link to="/activities" className="inline-block bg-[var(--s1)] bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-full font-bold mb-6">
            ← Back to Activities
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">{activityData.title}</h1>
          <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">{activityData.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-[var(--s1)] rounded-3xl p-6 shadow-2xl mb-6">
              <img src={activityData.image} alt={activityData.title} className="w-full h-48 object-cover rounded-2xl mb-4" />
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">⏱️ {activityData.duration}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">👶 {activityData.ageGroup}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl">
                <h3 className="font-bold text-purple-800 mb-2">📋 Materials Needed:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {activityData.materials.map((material, index) => (
                    <div key={index} className="bg-[var(--s1)] p-2 rounded-lg text-sm text-gray-700 text-center">
                      {material}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[var(--s1)] rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">📝 Step-by-Step Instructions</h2>
              <div className="space-y-4">
                {activityData.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 ${completedSteps.includes(index) ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${completedSteps.includes(index) ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {completedSteps.includes(index) ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg text-gray-800 mb-3">{instruction}</p>
                        {!completedSteps.includes(index) && (
                          <button
                            onClick={() => markStepComplete(index)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                          >
                            Mark Complete ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
