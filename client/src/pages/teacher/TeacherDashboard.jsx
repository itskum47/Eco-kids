import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PendingApprovals from './PendingApprovals';
import AssignmentsTab from './AssignmentsTab';

const TeacherDashboard = () => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('approvals');

    // Security Guard
    if (!isAuthenticated || user?.role !== 'teacher') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Teacher Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                        <svg className="h-4 w-4 flex-shrink-0 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.5334l.058.028a2.535 2.535 0 00.02.009l.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                        {user?.profile?.school?.name || user?.profile?.school || "Mapped Institutional School"}
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`${activeTab === 'approvals'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors`}
                            aria-current={activeTab === 'approvals' ? 'page' : undefined}
                        >
                            Pending Approvals
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`${activeTab === 'assignments'
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold transition-colors`}
                            aria-current={activeTab === 'assignments' ? 'page' : undefined}
                        >
                            Assignments Support
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="py-4">
                {activeTab === 'approvals' ? <PendingApprovals /> : <AssignmentsTab />}
            </div>
        </div>
    );
};

export default TeacherDashboard;
