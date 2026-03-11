import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminOverview from './Overview';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import Analytics from './Analytics';
import SubmissionsReview from './SubmissionsReview';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="p-6">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="submissions" element={<SubmissionsReview />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;