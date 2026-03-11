import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import PhotoPreviewModal from './PhotoPreviewModal';

const PendingApprovals = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionStartTime] = useState(Date.now());

    const itemsPerPage = 10;

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiRequest('GET', '/v1/teacher/submissions/pending');
            if (response.success || Array.isArray(response.data)) {
                setSubmissions(response.data || response);
            }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
                return;
            }
            toast.error(err.response?.data?.message || 'Failed to fetch pending approvals');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleAction = async (id, status) => {
        // Telemetry: measure MS elapsed since teacher loaded this view
        const timeTakenMs = Date.now() - sessionStartTime;

        // Optimistic UI update
        const previousSubmissions = [...submissions];
        setSubmissions(prev => prev.filter(sub => sub._id !== id));

        try {
            await apiRequest('PATCH', `/v1/teacher/submissions/${id}`, { status, timeTakenMs });
            toast.success(`Submission ${status}`);
        } catch (err) {
            // Revert on failure
            setSubmissions(previousSubmissions);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
                return;
            }
            toast.error(err.response?.data?.message || `Failed to ${status} submission`);
        }
    };

    const openPhoto = (url) => {
        if (!url) return;
        setSelectedPhoto(url);
        setIsModalOpen(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = submissions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(submissions.length / itemsPerPage);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="bg-white border border-gray-200 rounded-xl relative overflow-hidden transition-all duration-200 hover:border-gray-300">
                    <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex p-4 items-center justify-between">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No Pending Approvals</h3>
                <p className="mt-1 text-sm text-gray-600">All caught up! No submissions require your attention.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl relative overflow-hidden transition-all duration-200 hover:border-gray-300 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 relative">
                    <thead className="bg-gray-50 sticky top-0 z-10 ">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Student Name</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Grade</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Module</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">SDG Tag</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Date</th>
                            <th scope="col" className="px-4 py-3 text-center text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Evidence</th>
                            <th scope="col" className="px-4 py-3 text-right text-sm font-bold text-gray-600 font-mono uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {currentSubmissions.map((sub) => (
                            <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">{sub.user?.name || 'Unknown'}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">{sub.user?.profile?.grade || 'N/A'}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{sub.activityType ? sub.activityType.replace(/_/g, ' ') : 'Task'}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                        {sub.sdgTag || 'SDG 13'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-center">
                                    {sub.evidence?.imageUrl || sub.photoUrl ? (
                                        <button
                                            onClick={() => openPhoto(sub.evidence?.imageUrl || sub.photoUrl)}
                                            className="w-10 h-10 rounded-md border border-gray-300 overflow-hidden mx-auto focus:outline-none focus:ring-2 focus:ring-blue-500 "
                                            aria-label="View photo evidence"
                                        >
                                            <img src={sub.evidence?.imageUrl || sub.photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 text-xs font-medium">No Photo</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-right font-medium">
                                    <button
                                        onClick={() => handleAction(sub._id, 'approved')}
                                        className="text-green-700 bg-green-100 hover:bg-green-200 border border-green-200 font-bold px-3 py-1.5 rounded-md mr-2  transition-colors"
                                        aria-label={`Approve submission for ${sub.user?.name}`}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(sub._id, 'rejected')}
                                        className="text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 font-bold px-3 py-1.5 rounded-md  transition-colors"
                                        aria-label={`Reject submission for ${sub.user?.name}`}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, submissions.length)}</span> of <span className="font-medium">{submissions.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md " aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    &larr;
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    &rarr;
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <PhotoPreviewModal
                isOpen={isModalOpen}
                photoUrl={selectedPhoto}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default PendingApprovals;
