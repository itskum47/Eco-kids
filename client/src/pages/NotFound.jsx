import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-lg"
      >
        {/* Animated Earth */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-8xl mb-8"
        >
          🌍
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl font-bold text-gray-800 mb-4"
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            It looks like this page has gone on an adventure to save the planet!
            Let's help you find your way back to learning about our beautiful Earth.
          </p>
          <div className="flex justify-center space-x-2 text-2xl mb-6">
            <span>🌱</span>
            <span>🐝</span>
            <span>🌳</span>
            <span>🦋</span>
            <span>🌺</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <FaHome className="mr-2" />
              Go Home
            </Link>

            <Link
              to="/topics"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <FaSearch className="mr-2" />
              Explore Topics
            </Link>
          </div>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </motion.div>

        {/* Fun Eco Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 p-6 bg-[var(--s1)] rounded-xl shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🌟 Did You Know?
          </h3>
          <p className="text-gray-600 text-sm">
            While you're here, here's a fun fact: A single tree can absorb
            as much as 48 pounds of CO₂ per year and can sequester 1 ton of
            CO₂ by the time it reaches 40 years old! 🌳
          </p>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Popular Destinations:
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/games"
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full hover:bg-purple-200 transition-colors"
            >
              🎮 Games
            </Link>
            <Link
              to="/experiments"
              className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full hover:bg-orange-200 transition-colors"
            >
              🧪 Experiments
            </Link>
            <Link
              to="/quizzes"
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
            >
              🧠 Quizzes
            </Link>
            <Link
              to="/leaderboards"
              className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full hover:bg-yellow-200 transition-colors"
            >
              🏆 Leaderboard
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;