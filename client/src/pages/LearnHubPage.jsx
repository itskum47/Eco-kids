import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { apiRequest } from '../utils/api';

const LearnHubPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState({});
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchLearnHub = async () => {
      setLoading(true);
      setError('');

      try {
        const [progressResponse, lessonsResponse, quizzesResponse] = await Promise.all([
          apiRequest('/v1/student/progress'),
          apiRequest('/v1/lessons?limit=6'),
          apiRequest('/v1/quizzes?limit=6'),
        ]);

        const progressPayload = progressResponse?.data || progressResponse?.progress || progressResponse || {};
        setProgressData(progressPayload);

        const lessonList = lessonsResponse?.lessons || lessonsResponse?.data?.lessons || lessonsResponse?.data || [];
        setLessons(Array.isArray(lessonList) ? lessonList : []);

        const quizList = quizzesResponse?.data?.quizzes || quizzesResponse?.quizzes || quizzesResponse?.data || [];
        setQuizzes(Array.isArray(quizList) ? quizList : []);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Could not load Learn Hub. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLearnHub();
  }, []);

  const competencyScore = useMemo(() => {
    const direct = Number(progressData?.competencyScore || progressData?.competencyProgress);
    if (!Number.isNaN(direct) && direct > 0) return Math.min(100, direct);

    const topicWeight = Number(progressData?.topicsCompleted || 0) * 12;
    const quizWeight = Number(progressData?.quizzesTaken || 0) * 18;
    const combined = topicWeight + quizWeight;
    return Math.max(0, Math.min(100, combined));
  }, [progressData]);

  const completedLessons = Number(progressData?.topicsCompleted || progressData?.lessonsCompleted || 0);
  const completedQuizzes = Number(progressData?.quizzesTaken || progressData?.quizCompleted || 0);

  const nextQuiz = quizzes.find((quiz) => !quiz?.bestScore) || quizzes[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-cyan-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-28">
        <div className="rounded-3xl bg-white shadow-xl border border-emerald-100 p-6 md:p-10 mb-6">
          <p className="text-emerald-700 font-semibold tracking-wide uppercase text-sm">Learn Hub</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Build Competency, Then Prove It</h1>
          <p className="text-slate-600 mt-3 max-w-2xl">
            Complete lessons, take a quick quiz, and track your competency progression in one place.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-slate-600">Loading Learn Hub...</div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-white border border-emerald-100 p-5">
                <p className="text-sm text-slate-500">Competency Progress</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">{competencyScore}%</p>
                <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${competencyScore}%` }} />
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-cyan-100 p-5">
                <p className="text-sm text-slate-500">Lessons Completed</p>
                <p className="text-3xl font-black text-cyan-700 mt-1">{completedLessons}</p>
              </div>

              <div className="rounded-2xl bg-white border border-amber-100 p-5">
                <p className="text-sm text-slate-500">Quizzes Attempted</p>
                <p className="text-3xl font-black text-amber-700 mt-1">{completedQuizzes}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Recommended Lessons</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/lessons')}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {lessons.slice(0, 4).map((lesson) => (
                    <button
                      key={lesson._id}
                      type="button"
                      onClick={() => navigate(`/lessons/${lesson._id}`)}
                      className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition"
                    >
                      <p className="font-semibold text-slate-900">{lesson.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{lesson.grade || 'All grades'}</p>
                    </button>
                  ))}
                  {lessons.length === 0 && <p className="text-sm text-slate-500">No lessons available yet.</p>}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Quick Quiz Path</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/quizzes')}
                    className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                  >
                    Explore quizzes
                  </button>
                </div>

                {nextQuiz ? (
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                    <p className="text-sm font-semibold text-cyan-800">Next recommended quiz</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{nextQuiz.title}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {nextQuiz.questionCount || 5} questions • {nextQuiz.timeLimitMinutes || 5} min
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/quiz/${nextQuiz.slug || nextQuiz._id}`)}
                      className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700"
                    >
                      Start quick quiz
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No quizzes available yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LearnHubPage;
