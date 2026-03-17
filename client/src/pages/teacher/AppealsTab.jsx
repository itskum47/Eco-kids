import React, { useEffect, useState } from 'react';
import { apiClient as api } from '../../utils/api';

const AppealsTab = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState({});

  const loadAppeals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/activity/appeals/pending');
      setAppeals(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  const resolveAppeal = async (submissionId, decision) => {
    setResolving(prev => ({ ...prev, [submissionId]: true }));
    const teacherNote = decision === 'approved' ? 'Appeal accepted after review.' : 'Appeal rejected after review.';
    try {
      const response = await api.put(`/activity/${submissionId}/appeal/resolve`, {
        decision,
        teacherNote
      });

      if (response.data?.success) {
        setAppeals(prev => prev.filter(item => item._id !== submissionId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve appeal');
    } finally {
      setResolving(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <span className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>;
  }

  if (appeals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">No Open Appeals</h3>
        <p className="mt-1 text-sm text-gray-600">All appealed submissions have been resolved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appeals.map((appeal) => (
        <div key={appeal._id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900">
                {appeal.user?.name || 'Student'}
                {appeal.user?.profile?.grade ? ` · Grade ${appeal.user.profile.grade}` : ''}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                {appeal.activityType?.replace(/-/g, ' ')}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Original submission:</span>{' '}
                {appeal.evidence?.description || 'No description provided'}
              </p>
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-2">
                <span className="font-semibold">Appeal reason:</span> {appeal.appealReason || 'No reason provided'}
              </p>
            </div>

            <div className="flex gap-2 md:flex-col md:min-w-[160px]">
              <button
                onClick={() => resolveAppeal(appeal._id, 'approved')}
                disabled={!!resolving[appeal._id]}
                className="px-3 py-2 rounded-lg bg-green-100 text-green-700 border border-green-200 font-semibold text-sm disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => resolveAppeal(appeal._id, 'rejected')}
                disabled={!!resolving[appeal._id]}
                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 border border-red-200 font-semibold text-sm disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppealsTab;
