import * as React from 'react';
import { Link } from 'react-router-dom';

export interface RegisterPageProps {}
 
const RegisterPage: React.FC<RegisterPageProps> = () => {
    return ( 
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h1>📝 Create Account</h1>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Full Name" style={{ padding: '0.8rem' }} />
                <input type="email" placeholder="Email Address" style={{ padding: '0.8rem' }} />
                <input type="tel" placeholder="Phone Number" style={{ padding: '0.8rem' }} />
                <input type="password" placeholder="Create Password" style={{ padding: '0.8rem' }} />
                
                <button type="button" style={{ padding: '1rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Sign Up
                </button>
            </form>

            <p style={{ marginTop: '1.5rem' }}>
                Already have an account? <Link to="/login" style={{ color: 'blue' }}>Login here</Link>
            </p>
        </div>
     );
}
 
export default RegisterPage;