import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import FarmerLayout from '../layouts/FarmerLayout';
import ViewerLayout from '../layouts/ViewerLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

// Admin Portal Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminFarms from '../pages/admin/AdminFarms';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminAlerts from '../pages/admin/AdminAlerts';

// Farmer Portal Pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import ManualInput from '../pages/farmer/ManualInput';
import PumpControl from '../pages/farmer/PumpControl';
import AlertsPage from '../pages/farmer/AlertsPage';
import Schedules from '../pages/farmer/Schedules';
import Thresholds from '../pages/farmer/Thresholds';
import History from '../pages/farmer/History';

// Viewer Portal Pages
import ViewerDashboard from '../pages/viewer/ViewerDashboard';
import ViewerHistory from '../pages/viewer/ViewerHistory';

// Protection Guards
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

// Helper component to redirect authenticated users away from Login page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'viewer') return <Navigate to="/viewer/dashboard" replace />;
  }
  return children;
};

// Helper component to route "/" root path to correct dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
  if (user.role === 'viewer') return <Navigate to="/viewer/dashboard" replace />;
  return <Navigate to="/unauthorized" replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* Root redirector */}
        <Route path="/" element={<DashboardRedirect />} />

        {/* 1. ADMIN PORTAL (Requires admin role) */}
        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="farms" element={<AdminFarms />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="alerts" element={<AdminAlerts />} />
          </Route>
        </Route>

        {/* 2. FARMER PORTAL (Requires farmer role) */}
        <Route element={<RoleGuard allowedRoles={['farmer']} />}>
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<Navigate to="/farmer/dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="input" element={<ManualInput />} />
            <Route path="pump" element={<PumpControl />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="thresholds" element={<Thresholds />} />
            <Route path="history" element={<History />} />
          </Route>
        </Route>

        {/* 3. VIEWER PORTAL (Requires viewer or admin roles) */}
        <Route element={<RoleGuard allowedRoles={['viewer', 'admin']} />}>
          <Route path="/viewer" element={<ViewerLayout />}>
            <Route index element={<Navigate to="/viewer/dashboard" replace />} />
            <Route path="dashboard" element={<ViewerDashboard />} />
            <Route path="history" element={<ViewerHistory />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
