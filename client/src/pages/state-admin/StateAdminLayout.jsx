import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const StateAdminLayout = () => {
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
        { name: 'State Overview', path: '/state-admin/dashboard', icon: '🗺️' },
        { name: 'District Network', path: '/state-admin/districts', icon: '📍' },
        { name: 'Impact Analytics', path: '/state-admin/impact', icon: '🌍' }
    ];

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className={`bg-neutral-900 text-white w-64 flex-shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-20'}`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tighter">
                            <span className="text-green-400">Eco</span>Kids <span className="text-gray-400 text-xs font-normal ml-1 border border-gray-600 px-2 py-0.5 rounded uppercase tracking-widest">State</span>
                        </h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-300 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-800/50">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Jurisdiction</div>
                        <div className="text-sm text-white font-medium truncate uppercase tracking-widest" title={user?.profile?.state}>{user?.profile?.state || "Not Assigned"}</div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-emerald-600 text-white font-semibold shadow-md translate-x-1'
                                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    <span className="mr-3 text-lg opacity-80">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-neutral-800 bg-black/20">
                        <div className="flex items-center mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center font-bold border border-emerald-700 text-emerald-200">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors border border-neutral-700"
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
                <header className="bg-[var(--s1)] border-b border-gray-200 shadow-sm md:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                        )}
                        <h1 className="text-xl font-bold text-slate-900 truncate ml-4 flex-1">
                            {navItems.find(item => location.pathname === item.path)?.name || 'State Portal'}
                        </h1>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto bg-slate-100 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StateAdminLayout;
