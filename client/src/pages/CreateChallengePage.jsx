import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { challengesAPI } from '../utils/api';
import api from '../utils/api';

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challengeType: 'eco_points',
    targetMetric: 'eco_points_total',
    selectedSchools: [],
    startsAt: '',
    endsAt: '',
    minParticipants: 5,
    maxSchools: 20,
    difficultyTier: 'medium',
    pointsMultiplier: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  // Authorization check
  useEffect(() => {
    if (!['teacher', 'school_admin', 'district_admin', 'state_admin'].includes(user?.role)) {
      toast.error('You do not have permission to create challenges');
      navigate('/challenges');
    }
  }, [user, navigate]);

  // Load schools list
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setIsLoadingSchools(true);
      // Fetch schools from API (adjust endpoint as per your backend)
      const response = await api.get('/v1/gamification/schools');
      setSchools(response.data?.schools || []);
    } catch (err) {
      console.error('[CreateChallengePage] Error loading schools:', err);
      toast.error('Unable to load schools list');
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSchoolToggle = (school) => {
    setFormData((prev) => {
      const isSelected = prev.selectedSchools.some((s) => s.schoolName === school);
      if (isSelected) {
        return {
          ...prev,
          selectedSchools: prev.selectedSchools.filter((s) => s.schoolName !== school)
        };
      } else {
        return {
          ...prev,
          selectedSchools: [...prev.selectedSchools, { schoolName: school, schoolId: null }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      return toast.error('Please enter a challenge title');
    }
    if (!formData.description.trim()) {
      return toast.error('Please enter a description');
    }
    if (!formData.startsAt || !formData.endsAt) {
      return toast.error('Please select start and end dates');
    }
    if (new Date(formData.startsAt) >= new Date(formData.endsAt)) {
      return toast.error('End date must be after start date');
    }
    if (formData.selectedSchools.length < 2) {
      return toast.error('Please select at least 2 schools for the challenge');
    }

    try {
      setIsLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        challengeType: formData.challengeType,
        targetMetric: formData.targetMetric,
        schools: formData.selectedSchools,
        startsAt: formData.startsAt,
        endsAt: formData.endsAt,
        rules: {
          minParticipants: parseInt(formData.minParticipants),
          maxSchools: parseInt(formData.maxSchools),
          difficultyTier: formData.difficultyTier,
          pointsMultiplier: parseFloat(formData.pointsMultiplier)
        }
      };

      const response = await challengesAPI.createChallenge(payload);
      toast.success('Challenge created successfully!');
      navigate(`/challenges/${response.data?.data?._id || ''}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create challenge';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/challenges')}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm mb-4"
          >
            ← Back to Challenges
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create School Challenge</h1>
          <p className="text-gray-600">
            Set up a competition between schools to promote eco-action!
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
        >
          {/* Challenge Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Challenge Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Green Week Challenge 2026"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the challenge objectives and rules..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500</div>
          </div>

          {/* Challenge Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Challenge Type
              </label>
              <select
                name="challengeType"
                value={formData.challengeType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="eco_points">Total Eco Points</option>
                <option value="activities">Most Activities Completed</option>
                <option value="quizzes">Most Quizzes Passed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Participants per School
              </label>
              <input
                type="number"
                name="minParticipants"
                value={formData.minParticipants}
                onChange={handleInputChange}
                min={1}
                max={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Competition Rules Section */}
          <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Competition Rules</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Tier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty Tier
                </label>
                <select
                  name="difficultyTier"
                  value={formData.difficultyTier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="easy">Easy (0.8x multiplier)</option>
                  <option value="medium">Medium (1.0x multiplier)</option>
                  <option value="hard">Hard (1.5x multiplier)</option>
                  <option value="extreme">Extreme (2.0x multiplier)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  Higher difficulty = more points for achievements
                </p>
              </div>

              {/* Points Multiplier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points Multiplier
                </label>
                <input
                  type="number"
                  name="pointsMultiplier"
                  value={formData.pointsMultiplier}
                  onChange={handleInputChange}
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Bonus multiplier (e.g., 2x for special events)
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">
                <strong>How scoring works:</strong> Base score × Difficulty × Multiplier = Final Score
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Example: 100 base points × 1.5 (hard) × 2 (event bonus) = 300 total points
              </p>
            </div>
          </div>

          {/* Select Schools */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Participating Schools <span className="text-red-500">*</span> (min 2)
            </label>
            {isLoadingSchools ? (
              <div className="p-4 text-center text-gray-600">Loading schools...</div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
                {schools.length === 0 ? (
                  <div className="text-center text-gray-600 py-4">No schools available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {schools.map((school, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedSchools.some(
                            (s) => s.schoolName === school
                          )}
                          onChange={() => handleSchoolToggle(school)}
                          className="w-4 h-4 text-green-600 focus:ring-green-400"
                        />
                        <span className="text-sm text-gray-800">{school}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="text-xs text-gray-600 mt-2">
              {formData.selectedSchools.length} schools selected
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/challenges')}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateChallengePage;
