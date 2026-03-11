import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/api/v1/teacher/students');
                if (response.data.success) {
                    setStudents(response.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching students data');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    if (loading) return (
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
                    <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                    <p className="text-gray-600 mt-1">Manage and track student gamification progress.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl  border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">Student Name</th>
                                <th scope="col" className="px-6 py-4">Grade</th>
                                <th scope="col" className="px-6 py-4">Level</th>
                                <th scope="col" className="px-6 py-4">EcoPoints</th>
                                <th scope="col" className="px-6 py-4">Streak (Days)</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-600">No students registered in your school yet.</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4">{student.profile?.grade || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                Lvl {student.gamification?.level || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">{student.gamification?.ecoPoints || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1">
                                                🔥 {student.gamification?.streak?.count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherStudents;
