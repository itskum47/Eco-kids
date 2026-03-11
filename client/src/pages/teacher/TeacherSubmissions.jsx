import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TeacherSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/teacher/submissions/pending');
            if (response.data.success) {
                setSubmissions(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching submissions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Handle hotkeys 'A' for approve and 'R' for reject on the first active item
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (submissions.length === 0 || loading) return;

            // Ignore if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const firstSubmission = submissions[0];
            if (!firstSubmission) return;

            if (e.key.toLowerCase() === 'a') {
                handleApprove(firstSubmission._id);
            } else if (e.key.toLowerCase() === 'r') {
                handleReject(firstSubmission._id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [submissions, loading]);

    const handleApprove = async (id) => {
        try {
            await axios.patch(`/api/v1/teacher/submissions/${id}`, { status: 'approved' });
            // Optimistic remove
            setSubmissions(prev => prev.filter(sub => sub._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve submission');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.patch(`/api/v1/teacher/submissions/${id}`, { status: 'rejected' });
            // Optimistic remove
            setSubmissions(prev => prev.filter(sub => sub._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject submission');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading && submissions.length === 0) return (
        <div>
            <div className="w-full h-40 bg-gray-200 rounded-3xl animate-[shimmer_1.5s_infinite] mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-32 rounded-2xl animate-[shimmer_1.5s_infinite]"></div>
                ))}
            </div>
        </div>
    );
    if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Approvals Queue</h1>
                    <p className="text-gray-600 mt-1">Review student activities. Press <kbd className="bg-gray-100 border border-gray-300 px-1 rounded mx-1">A</kbd> to quickly approve top item, <kbd className="bg-gray-100 border border-gray-300 px-1 rounded mx-1">R</kbd> to reject.</p>
                </div>
                <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
                    {submissions.length} Pending
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-white rounded-xl  border border-gray-200 p-12 text-center text-gray-600">
                    <svg className="w-16 h-16 mx-auto text-green-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Queue Empty</h3>
                    <p>All student activities have been reviewed. Great job!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((submission, index) => (
                        <div key={submission._id} className={`bg-white rounded-xl  border ${index === 0 ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200'} p-6 transition-all shadow-sm`}>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image Section */}
                                <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    {submission.photoUrl ? (
                                        <img src={submission.photoUrl} alt="Activity Evidence" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-500">
                                            <span className="text-sm">No Photo Provided</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{submission.activityType.replace('_', ' ').toUpperCase()}</h3>
                                            <p className="text-sm text-gray-600 break-words">{submission.description}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(submission.createdAt)}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-700"><strong>Student:</strong> {submission.user?.name} {submission.user?.profile?.grade ? `(Grade ${submission.user.profile.grade})` : ''}</p>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => handleApprove(submission._id)}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Approve {index === 0 && <span className="opacity-75 text-xs font-normal">(A)</span>}
                                            </button>
                                            <button
                                                onClick={() => handleReject(submission._id)}
                                                className="flex-1 bg-white hover:bg-red-50 text-red-700 border border-red-300 hover:border-red-400 py-2 px-4 rounded-lg font-semibold flex justify-center items-center gap-2 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                Reject {index === 0 && <span className="opacity-75 text-xs font-normal">(R)</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherSubmissions;
