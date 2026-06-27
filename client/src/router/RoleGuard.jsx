import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default RoleGuard;
