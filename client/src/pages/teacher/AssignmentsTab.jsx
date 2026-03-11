import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const AssignmentsTab = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [attachment, setAttachment] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        grade: '',
        dueDate: ''
    });

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiRequest('GET', '/v1/teacher/assignments');
            if (response.success || Array.isArray(response.data)) {
                setAssignments(response.data || response);
            }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
                return;
            }
            toast.error(err.response?.data?.message || 'Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleFormChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const uploadAttachment = async () => {
        if (!attachment) return '';

        const fileForm = new FormData();
        fileForm.append('file', attachment);

        const isImage = attachment.type.startsWith('image/');
        const endpoint = isImage ? '/v1/upload/image' : '/v1/upload/document';
        const uploadResponse = await apiRequest('POST', endpoint, fileForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return uploadResponse?.data?.url || uploadResponse?.url || '';
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.grade || !formData.dueDate) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const fileUrl = await uploadAttachment();

            await apiRequest('POST', '/v1/teacher/assignments', {
                title: formData.title,
                description: formData.description,
                grade: formData.grade,
                dueDate: formData.dueDate,
                fileUrl
            });

            toast.success('Assignment created successfully');
            setFormData({ title: '', description: '', grade: '', dueDate: '' });
            setAttachment(null);
            setShowForm(false);
            fetchAssignments();
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
                return;
            }
            toast.error(err.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Assignments Support</h3>
                <button
                    type="button"
                    onClick={() => setShowForm((prev) => !prev)}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                    Create New Assignment
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm">
                    <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-green-800 mb-1">Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleFormChange}
                                className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-green-800 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleFormChange}
                                className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-green-800 mb-1">Grade/Class</label>
                            <select
                                id="grade"
                                name="grade"
                                value={formData.grade}
                                onChange={handleFormChange}
                                className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                required
                            >
                                <option value="">Select Class</option>
                                {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                    <option key={grade} value={String(grade)}>Class {grade}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-green-800 mb-1">Due Date</label>
                            <input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleFormChange}
                                className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="attachment" className="block text-sm font-medium text-green-800 mb-1">Attach File (PDF/Image, optional)</label>
                            <input
                                id="attachment"
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                className="w-full rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-green-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                            >
                                {submitting ? 'Assigning...' : 'Assign to Students'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">Created Assignments</h4>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-600">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">No assignments yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Class</th>
                                    <th className="px-4 py-3 text-left">Due Date</th>
                                    <th className="px-4 py-3 text-left">Attachment</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assignments.map((assignment) => {
                                    const dueDate = assignment.dueDate || assignment.deadline;
                                    const isExpired = dueDate ? new Date(dueDate) < new Date() : false;
                                    return (
                                        <tr key={assignment._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{assignment.title}</td>
                                            <td className="px-4 py-3 text-gray-600">Class {assignment.grade}</td>
                                            <td className="px-4 py-3 text-gray-600">{dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {assignment.fileUrl ? (
                                                    <a className="text-blue-600 hover:underline" href={assignment.fileUrl} target="_blank" rel="noreferrer">View</a>
                                                ) : 'No file'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentsTab;
