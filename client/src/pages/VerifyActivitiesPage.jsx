import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';
import socket from '../services/socket';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const ACTIVITY_IMPACT = {
  'tree-planting': '10 kg CO₂',
  'plastic-cleanup': '1 kg plastic',
  'water-conservation': '100 L water',
  'renewable-energy-setup': '2 kg CO₂',
  'waste-segregation-drive': '5 kg waste',
  'eco-awareness-event': '50 kg CO₂',
  'composting-installation': '2 kg soil'
};

export default function VerifyActivitiesPage() {
  const { user } = useSelector((state) => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState({});

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit('join-teacher-room', user._id);

    const onNewSubmission = (payload) => {
      toast.success(`New submission: ${payload.studentName} • ${payload.activityType}`);
      fetchPendingSubmissions();
    };

    socket.on('new-submission', onNewSubmission);

    return () => {
      socket.off('new-submission', onNewSubmission);
    };
  }, [user?._id]);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.activity.getPendingSubmissions();
      if (response.success) {
        setSubmissions(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    setVerifyingId(submissionId);
    try {
      const response = await api.activity.verifyActivity(submissionId, {
        status: 'approved'
      });
      if (response.success) {
        setSubmissions(prev => prev.filter(s => s._id !== submissionId));
      }
    } catch (err) {
      setError(err.message || 'Failed to approve submission');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (submissionId) => {
    const reason = rejectionReason[submissionId];
    if (!reason?.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setVerifyingId(submissionId);
    try {
      const response = await api.activity.verifyActivity(submissionId, {
        status: 'rejected',
        rejectionReason: reason
      });
      if (response.success) {
        setSubmissions(prev => prev.filter(s => s._id !== submissionId));
        setRejectionReason(prev => ({ ...prev, [submissionId]: '' }));
      }
    } catch (err) {
      setError(err.message || 'Failed to reject submission');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">Verify Activities</h1>
          <p className="text-gray-600">
            Review and approve student activity submissions. Impact is credited only after approval.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-sm text-red-600 hover:text-red-800 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">All Caught Up!</h2>
            <p className="text-gray-600">
              No pending submissions to review at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="text-3xl font-bold text-green-600">{submissions.length}</div>
              <div>
                <p className="text-gray-700 font-semibold">Pending Submissions</p>
                <p className="text-gray-500 text-sm">Awaiting your review and approval</p>
              </div>
            </div>

            <div className="grid gap-6">
              {submissions.map(submission => (
                <div
                  key={submission._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {submission.activityType.replace(/-/g, ' ').toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[submission.status]}`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Submitted by <span className="font-semibold">{submission.user?.name || 'Unknown'}</span> on{' '}
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {ACTIVITY_IMPACT[submission.activityType]}
                        </div>
                        <p className="text-xs text-gray-500">Potential Impact</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {submission.evidence.description}
                      </p>
                    </div>

                    {/* Image Evidence */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">📸 Photo Evidence</p>
                      <img
                        src={submission.evidence.imageUrl}
                        alt="Activity evidence"
                        className="max-h-64 rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>

                    {/* Location */}
                    {submission.evidence.latitude && submission.evidence.longitude && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">📍 Location</p>
                        <p className="text-sm text-blue-800">
                          {submission.evidence.latitude.toFixed(4)}, {submission.evidence.longitude.toFixed(4)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t pt-6 space-y-4">
                      {/* Approval */}
                      <div>
                        <button
                          onClick={() => handleApprove(submission._id)}
                          disabled={verifyingId === submission._id}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {verifyingId === submission._id ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Processing...
                            </>
                          ) : (
                            <>✓ Approve Activity</>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {ACTIVITY_IMPACT[submission.activityType]} will be credited to student's account
                        </p>
                      </div>

                      {/* Rejection */}
                      <div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rejection Reason (if rejecting)
                          </label>
                          <textarea
                            value={rejectionReason[submission._id] || ''}
                            onChange={(e) => setRejectionReason(prev => ({
                              ...prev,
                              [submission._id]: e.target.value
                            }))}
                            placeholder="Explain why this activity cannot be approved..."
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <button
                          onClick={() => handleReject(submission._id)}
                          disabled={verifyingId === submission._id}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {verifyingId === submission._id ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Processing...
                            </>
                          ) : (
                            <>✗ Reject Activity</>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Student will see rejection reason
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Verification Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Check that the activity description is clear and specific</li>
            <li>✓ Verify the photo clearly shows the activity or its results</li>
            <li>✓ Ensure activity aligns with school's environmental goals</li>
            <li>✓ Provide constructive feedback if rejecting</li>
            <li>✓ Impact is instantly applied upon approval to student accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
