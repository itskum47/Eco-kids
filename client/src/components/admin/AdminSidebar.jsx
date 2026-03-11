import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt as FaDashboard,
  FaUsers,
  FaBook,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaLeaf
} from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: FaDashboard, label: 'Overview', exact: true },
    { path: '/admin/users', icon: FaUsers, label: 'User Management' },
    { path: '/admin/content', icon: FaBook, label: 'Content Management' },
    { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-[var(--s1)] shadow-xl min-h-screen"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <FaLeaf className="text-2xl text-green-500 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">EcoKids</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${active
                      ? 'bg-green-100 text-green-700 border-r-4 border-green-500'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <IconComponent className={`mr-3 ${active ? 'text-green-600' : 'text-gray-500'}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-600">Administrator</p>
          </div>
        </div>
        <button className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;