import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, [searchTerm, filterGrade, filterTopic]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterGrade) params.append('grade', filterGrade);
      if (filterTopic) params.append('topic', filterTopic);
      
      const response = await axios.get(`/api/v1/lessons?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error('Failed to load lessons', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Lesson completed! You earned eco-points!');
      fetchLessons();
    } catch (error) {
      alert('Failed to complete lesson');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Environmental Lessons</h1>
          <p className="text-gray-600">Learn about sustainability through engaging lessons</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Grades</option>
                <option value="6-8">Grade 6-8</option>
                <option value="9-10">Grade 9-10</option>
                <option value="11-12">Grade 11-12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Topics</option>
                <option value="water">Water Conservation</option>
                <option value="energy">Energy</option>
                <option value="waste">Waste Management</option>
                <option value="biodiversity">Biodiversity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No lessons found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map(lesson => (
              <div key={lesson._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
                {lesson.imageUrl && (
                  <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-xl font-bold text-green-800 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{lesson.description?.substring(0, 100)}...</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {lesson.grade}
                  </span>
                  <span className="text-sm font-semibold text-yellow-600">+{lesson.ecoPoints} pts</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/lessons/${lesson._id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Learn More
                  </button>
                  <button
                    onClick={() => handleCompleteLesson(lesson._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;
