import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const roleHome = (role) => {
  switch (role) {
    case 'teacher':
      return '/teacher/dashboard';
    case 'school_admin':
      return '/school-admin/dashboard';
    case 'district_admin':
      return '/district-admin/dashboard';
    case 'state_admin':
      return '/state-admin/dashboard';
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/student-dashboard';
  }
};

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // User doesn't have required role
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;