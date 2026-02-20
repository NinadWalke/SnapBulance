import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; // Adjust path as needed

export interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // The ProtectedRoute passes the attempted URL in location.state.from
  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // DTO expects email and passwordHash
      await login({ email, passwordHash: password });

      // Get the fresh user state to determine routing
      const user = useAuthStore.getState().user;

      // If they were redirected here from a protected route, send them back
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise, route them based on their actual role from the backend
      if (user?.role === 'USER') navigate('/user/home', { replace: true });
      else if (user?.role === 'DRIVER') navigate('/driver/dashboard', { replace: true });
      else if (user?.role === 'HOSPITAL_ADMIN') navigate('/hospital/dashboard', { replace: true });
      else navigate('/', { replace: true }); // Fallback

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>🔐 Login to SnapBulance</h1>

      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.8rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.8rem' }}
        />

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '1rem', 
            background: isLoading ? '#999' : 'green', 
            color: 'white', 
            border: 'none', 
            cursor: isLoading ? 'not-allowed' : 'pointer' 
          }}
        >
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        Don't have an account? <Link to="/register" style={{ color: 'blue' }}>Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;