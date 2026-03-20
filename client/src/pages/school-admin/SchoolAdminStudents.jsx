import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchoolAdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchStudents = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/school-admin/students?page=${page}&limit=12`);
            if (response.data.success) {
                setStudents(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading && students.length === 0) return (
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enrolled Students</h1>
                    <p className="text-gray-500 mt-2">Manage and view all student accounts active within your school.</p>
                </div>
                <div className="text-sm font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {pagination.total} Total
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-4">Student</th>
                                <th scope="col" className="px-6 py-4">Grade</th>
                                <th scope="col" className="px-6 py-4">Level</th>
                                <th scope="col" className="px-6 py-4">EcoPoints</th>
                                <th scope="col" className="px-6 py-4">Streak (Days)</th>
                                <th scope="col" className="px-6 py-4 text-right">Registered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No students enrolled yet.</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div>{student.name}</div>
                                                <div className="text-xs text-gray-400 font-normal">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{student.profile?.grade || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                Lvl {student.gamification?.level || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black tracking-tight text-green-600">{student.gamification?.ecoPoints || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 font-medium">
                                                <span className="text-orange-500">🔥</span> {student.gamification?.streak?.count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-xs">
                                            {new Date(student.createdAt).toLocaleDateString()}
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
                            Showing {(pagination.page - 1) * 12 + 1} to {Math.min(pagination.page * 12, pagination.total)} of {pagination.total} students
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchStudents(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchStudents(pagination.page + 1)}
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

export default SchoolAdminStudents;
