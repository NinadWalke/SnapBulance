import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; 

const PublicRoute: React.FC = () => {
    // Grabbing the correct state names from your updated store
    const { isAuthenticated, user, isLoading } = useAuthStore();

    // Show a loader while the initial checkAuth() is running
    // This prevents the login screen from flashing before the redirect happens
    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>Loading...</div>;
    }

    // If the user is already logged in, route them away from public pages
    if (isAuthenticated && user) {
        switch (user.role) {
            case 'USER':
                return <Navigate to="/user/home" replace />;
            case 'DRIVER':
                return <Navigate to="/driver/dashboard" replace />;
            case 'HOSPITAL_ADMIN':
                return <Navigate to="/hospital/dashboard" replace />;
            default:
                return <Navigate to="/unauthorized" replace />;
        }
    }

    // If not logged in, render the public pages (Login, Register, Landing) normally
    return <Outlet />;
};

export default PublicRoute;