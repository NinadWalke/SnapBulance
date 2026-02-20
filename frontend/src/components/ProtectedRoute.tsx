// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { Role } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // 1. Wait for the initial authentication check to finish
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Replace with a proper loader/spinner component */}
        <h2 className="text-xl font-semibold animate-pulse">Loading...</h2>
      </div>
    );
  }

  // 2. Not logged in? Boot them to login, but remember where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Logged in, but wrong role? Boot them to unauthorized
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Passed all checks! Render the child routes
  return <Outlet />;
}