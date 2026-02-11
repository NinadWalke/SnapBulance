import * as React from 'react';
import { Link } from 'react-router-dom';

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
    return ( 
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
            {/* Logo / Brand */}
            <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', fontSize: '1.2rem' }}>
                SnapBulance 🚑
            </Link>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Link to="/user/home">Home</Link>
                <Link to="/user/history">My Rides</Link>
                <Link to="/user/profile">Profile</Link>
                <Link to="/login" style={{ color: 'blue' }}>Login</Link>
            </div>
        </nav>
     );
}
 
export default Navbar;