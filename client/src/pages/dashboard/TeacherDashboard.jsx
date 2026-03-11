import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Teacher workspace</p>
            <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'Teacher'}</h1>
            <p className="text-sm text-indigo-700 font-semibold mt-1">Role: Teacher</p>
          </div>
          <div className="bg-[var(--s1)] px-4 py-3 rounded-lg shadow border border-indigo-100">
            <p className="text-xs text-gray-500">Students monitored</p>
            <p className="text-2xl font-semibold text-indigo-700">{user?.studentsCount || 0}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link to="/quizzes" className="block p-4 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100">
                <p className="text-sm font-semibold text-indigo-800">Create or manage quizzes</p>
                <p className="text-xs text-gray-600">Build questions and assignments</p>
              </Link>
              <Link to="/progress" className="block p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100">
                <p className="text-sm font-semibold text-blue-800">View student progress</p>
                <p className="text-xs text-gray-600">Track scores and streaks</p>
              </Link>
              <Link to="/games" className="block p-4 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100">
                <p className="text-sm font-semibold text-green-800">Recommend games</p>
                <p className="text-xs text-gray-600">Assign practice paths</p>
              </Link>
            </div>
          </div>

          <div className="bg-[var(--s1)] rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Snapshots</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">Active quizzes</p>
                <p className="text-xl font-semibold text-indigo-700">{user?.activeQuizzes || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">Pending reviews</p>
                <p className="text-xl font-semibold text-blue-700">{user?.pendingReviews || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">Average score</p>
                <p className="text-xl font-semibold text-green-700">{user?.averageScore || 0}%</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500">Classes</p>
                <p className="text-xl font-semibold text-amber-700">{user?.classes?.length || 0}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;
