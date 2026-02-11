import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/*
We'll be using a Redis-based cache layer here, to fetch accounts or emails based on the role selected, this optimizes the login performance
*/

export interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'USER' | 'DRIVER' | 'HOSPITAL'>('USER');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate Login Logic based on Role
        if (role === 'USER') navigate('/user/home');
        if (role === 'DRIVER') navigate('/driver/dashboard');
        if (role === 'HOSPITAL') navigate('/hospital/dashboard');
    };

    return ( 
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h1>🔐 Login</h1>
            
            {/* Role Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <button 
                    onClick={() => setRole('USER')}
                    style={{ padding: '0.5rem', background: role === 'USER' ? 'blue' : '#ddd', color: role === 'USER' ? 'white' : 'black' }}>
                    User
                </button>
                <button 
                    onClick={() => setRole('DRIVER')}
                    style={{ padding: '0.5rem', background: role === 'DRIVER' ? 'blue' : '#ddd', color: role === 'DRIVER' ? 'white' : 'black' }}>
                    Driver
                </button>
                <button 
                    onClick={() => setRole('HOSPITAL')}
                    style={{ padding: '0.5rem', background: role === 'HOSPITAL' ? 'blue' : '#ddd', color: role === 'HOSPITAL' ? 'white' : 'black' }}>
                    Hospital
                </button>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="email" placeholder="Email" style={{ padding: '0.8rem' }} />
                <input type="password" placeholder="Password" style={{ padding: '0.8rem' }} />
                
                <button type="submit" style={{ padding: '1rem', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Login as {role}
                </button>
            </form>

            <p style={{ marginTop: '1.5rem' }}>
                Don't have an account? <Link to="/register" style={{ color: 'blue' }}>Register here</Link>
            </p>
        </div>
     );
}
 
export default LoginPage;