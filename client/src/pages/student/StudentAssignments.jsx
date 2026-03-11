import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

const statusClass = (status = '') => {
  const value = status.toLowerCase();
  if (value === 'completed' || value === 'submitted') return 'bg-green-100 text-green-700';
  return 'bg-amber-100 text-amber-800';
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await apiRequest('get', '/v1/student/assignments');
        setAssignments(data?.data || data?.assignments || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) return <div className="p-6">Loading assignments...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Assignments</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={4}>No assignments found.</td>
              </tr>
            )}
            {assignments.map((item) => (
              <tr key={item._id} className="border-b border-gray-100">
                <td className="p-4 font-medium">{item.title || '-'}</td>
                <td className="p-4 text-gray-600">{item.description || '-'}</td>
                <td className="p-4">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(item.status)}`}>
                    {item.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAssignments;
