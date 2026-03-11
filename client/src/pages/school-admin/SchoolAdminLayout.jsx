import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const SchoolAdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(state => state.auth);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/school-admin/dashboard', icon: '📊' },
        { name: 'Teachers', path: '/school-admin/teachers', icon: '👨‍🏫' },
        { name: 'Students', path: '/school-admin/students', icon: '👨‍🎓' },
        { name: 'Impact Analytics', path: '/school-admin/analytics', icon: '🌍' }
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className={`bg-white text-gray-900 w-64 flex-shrink-0 border-r border-gray-200 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-20'}`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tighter">
                            <span className="text-green-600">Eco</span>Kids <span className="text-gray-500 text-sm font-normal ml-1">Admin</span>
                        </h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">School Network</div>
                        <div className="text-sm text-gray-900 font-medium truncate" title={user?.profile?.school}>{user?.profile?.school || "Not Assigned"}</div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive
                                            ? 'bg-green-50 text-green-700 font-semibold border border-green-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold border border-green-200">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 shadow-sm md:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                        )}
                        <h1 className="text-xl font-bold text-gray-900 truncate ml-4 flex-1">
                            {navItems.find(item => location.pathname === item.path)?.name || 'Admin Portal'}
                        </h1>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SchoolAdminLayout;
