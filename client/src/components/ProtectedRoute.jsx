import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
