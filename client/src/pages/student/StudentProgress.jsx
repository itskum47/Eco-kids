import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiRequest } from '../../utils/api';

const StudentProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await apiRequest('get', '/v1/student/progress');
        setProgress(data?.data || data?.progress || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load student progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const chartData = useMemo(() => {
    if (Array.isArray(progress) && progress.length > 0) return progress;
    return [
      { name: 'Topics', completed: progress?.topicsCompleted || 0 },
      { name: 'Games', completed: progress?.gamesPlayed || 0 },
      { name: 'Experiments', completed: progress?.experimentsCompleted || 0 },
      { name: 'Quizzes', completed: progress?.quizzesTaken || 0 },
    ];
  }, [progress]);

  if (loading) return <div className="p-6">Loading progress...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Progress</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
