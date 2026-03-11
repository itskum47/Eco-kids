import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const TeacherLayout = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'teacher') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogout = () => {
        dispatch(logout());
    };

    const navItems = [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Approvals Queue', path: '/teacher/submissions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { name: 'My Students', path: '/teacher/students', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 font-ui block">EcoKids</span>
                        <span className="text-xs font-semibold text-green-600 tracking-wider font-mono uppercase">Teacher Portal</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto font-ui">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-[3px] ${isActive
                                    ? 'bg-green-50 text-green-700 border-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="mb-4 px-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold uppercase font-ui">
                            {user?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 font-ui truncate">{user?.name}</p>
                            <p className="text-xs text-gray-600 font-ui truncate">{user?.profile?.school}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold font-ui text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;
