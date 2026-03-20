import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchoolAdminTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchTeachers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/school-admin/teachers?page=${page}&limit=12`);
            if (response.data.success) {
                setTeachers(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching teachers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    if (loading && teachers.length === 0) return (
        <div>
            <div className="w-full h-40 bg-[var(--s2)] rounded-3xl animate-[shimmer_1.5s_infinite] mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[var(--s2)] h-32 rounded-2xl animate-[shimmer_1.5s_infinite]"></div>
                ))}
            </div>
        </div>
    );
    if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">School Teachers</h1>
                    <p className="text-gray-500 mt-2">Manage educators driving environmental action in your school.</p>
                </div>
                <div className="text-sm font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                    {pagination.total} Operators Active
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4">Teacher Name</th>
                                <th scope="col" className="px-6 py-4">Email</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No teachers found in your school.</td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher._id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            {teacher.name}
                                        </td>
                                        <td className="px-6 py-4">{teacher.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 font-medium text-gray-700">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-xs">
                                            {new Date(teacher.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing {(pagination.page - 1) * 12 + 1} to {Math.min(pagination.page * 12, pagination.total)} of {pagination.total} teachers
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchTeachers(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchTeachers(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchoolAdminTeachers;
