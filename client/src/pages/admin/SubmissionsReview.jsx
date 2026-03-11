import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';

const SubmissionsReview = () => {
  const { token } = useSelector(state => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [filter, token]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5001/api/admin/submissions${filter ? `?status=${filter}` : ''}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (experimentId, submissionId) => {
    try {
      await axios.put(
        `http://localhost:5001/api/experiments/${experimentId}/submissions/${submissionId}`,
        {
          status: 'approved',
          teacherFeedback: 'Great work! Approved.'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubmissions();
      alert('Submission approved and points awarded!');
    } catch (err) {
      alert('Error approving submission: ' + err.response?.data?.message);
    }
  };

  const handleReject = async (experimentId, submissionId) => {
    const feedback = prompt('Enter rejection feedback:');
    if (!feedback) return;

    try {
      await axios.put(
        `http://localhost:5001/api/experiments/${experimentId}/submissions/${submissionId}`,
        {
          status: 'rejected',
          teacherFeedback: feedback
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubmissions();
      alert('Submission rejected');
    } catch (err) {
      alert('Error rejecting submission: ' + err.response?.data?.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Review Submissions</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {['pending', 'approved', 'rejected', ''].map(status => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setSelectedSubmission(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--s1)] text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

      {/* Loading State */}
      {loading && <div className="text-center py-8 text-gray-500">Loading submissions...</div>}

      {/* Submissions List */}
      {!loading && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub._id} className="bg-[var(--s1)] rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Experiment</p>
                  <p className="font-semibold text-gray-900">{sub.experimentTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-semibold text-gray-900">{sub.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">{getStatusBadge(sub.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="font-semibold text-green-600">{sub.points || 0} pts</p>
                </div>
              </div>

              {/* Observations */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-700">Observations:</p>
                <p className="text-gray-600 text-sm">{sub.observations}</p>
              </div>

              {/* Results */}
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Results:</p>
                <p className="text-gray-600 text-sm">{sub.results}</p>
              </div>

              {/* Photos */}
              {sub.photos && sub.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {sub.photos.map((photo, idx) => (
                    <a
                      key={idx}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <FaEye /> View Photo {idx + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Actions */}
              {sub.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(sub.experimentId, sub._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(sub.experimentId, sub._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {/* Feedback */}
              {sub.teacherFeedback && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <p className="text-gray-600">
                    <strong>Feedback:</strong> {sub.teacherFeedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-8 text-gray-500">No submissions found</div>
      ) : null}
    </div>
  );
};

export default SubmissionsReview;
