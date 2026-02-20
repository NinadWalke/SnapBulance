import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // Helper function to render links cleanly based on role
    const renderNavLinks = () => {
        if (!isAuthenticated || !user) {
            return (
                <>
                    <Link to="/login" style={{ color: 'blue', textDecoration: 'none' }}>Login</Link>
                    <Link to="/register" style={{ color: 'blue', textDecoration: 'none' }}>Register</Link>
                </>
            );
        }

        switch (user.role) {
            case 'USER':
                return (
                    <>
                        <Link to="/user/home" style={{ textDecoration: 'none' }}>Request Ambulance</Link>
                        <Link to="/user/history" style={{ textDecoration: 'none' }}>My Rides</Link>
                        <Link to="/user/profile" style={{ textDecoration: 'none' }}>Profile</Link>
                    </>
                );
            case 'DRIVER':
                return (
                    <>
                        {/* Driver sub-pages (Mission, Handover) are usually accessed from the Dashboard UI, not the global nav */}
                        <Link to="/driver/dashboard" style={{ textDecoration: 'none' }}>Driver Dashboard</Link>
                    </>
                );
            case 'HOSPITAL_ADMIN':
                return (
                    <>
                        <Link to="/hospital/dashboard" style={{ textDecoration: 'none' }}>Hospital Dashboard</Link>
                        <Link to="/hospital/profile" style={{ textDecoration: 'none' }}>Hospital Profile</Link>
                    </>
                );
            default:
                return null; // Fallback for CFR or SYS_ADMIN if added later
        }
    };

    return ( 
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Logo / Brand */}
            <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', fontSize: '1.2rem', color: '#e63946' }}>
                SnapBulance 🚑
            </Link>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                
                {renderNavLinks()}

                {/* Always show logout if authenticated, regardless of role */}
                {isAuthenticated && (
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            padding: '0.4rem 0.8rem', 
                            background: '#333', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer' 
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
     );
}
 
export default Navbar;