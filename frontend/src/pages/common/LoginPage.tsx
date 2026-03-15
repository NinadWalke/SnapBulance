import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; // Adjust path as needed

import './LoginPage.css'

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
      else if (user?.role === 'CFR') navigate('/cfr/dashboard', { replace: true }); 
      else if (user?.role === 'DRIVER') navigate('/driver/dashboard', { replace: true });
      else if (user?.role === 'HOSPITAL_ADMIN') navigate('/hospital/dashboard', { replace: true });
      else navigate('/', { replace: true });

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="sb-login">
 
        {/* Background elements */}
        <div className="sb-login__grid" aria-hidden="true" />
        <div className="sb-login__glow-left" aria-hidden="true" />
        <div className="sb-login__glow-right" aria-hidden="true" />
 
        {/* ── Two-Panel Layout ── */}
        <div className="sb-login__layout" role="main">
 
            {/* ── Left: Brand Panel ── */}
            <div className="sb-login__brand" aria-hidden="true">
                <div className="sb-login__brand-top">
                    <div className="sb-login__brand-name">
                        SNAP<span>BUL<br />ANCE</span>
                    </div>
                    <p className="sb-login__brand-tagline">
                        India's fastest emergency response network. Dispatch in seconds.
                    </p>
                    <div className="sb-login__brand-status">
                        <span className="sb-login__brand-status-dot" />
                        All systems operational
                    </div>
                </div>
 
                <div className="sb-login__brand-bottom">
                    <svg className="sb-login__brand-ecg" viewBox="0 0 300 32" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 16 L60 16 L70 16 L78 4 L84 28 L90 8 L96 16 L106 16 L166 16 L176 16 L184 4 L190 28 L196 8 L202 16 L212 16 L272 16 L282 16 L290 4 L296 28 L300 16" />
                    </svg>
                    <p className="sb-login__brand-disclaimer">
                        Secure access · Emergency personnel only · All sessions are monitored
                    </p>
                </div>
            </div>
 
            {/* ── Right: Form Panel ── */}
            <div className="sb-login__form-panel">
 
                {/* Header */}
                <div className="sb-login__form-header">
                    <span className="sb-login__form-eyebrow">
                        🔐 Secure Portal
                    </span>
                    <h1 className="sb-login__form-title">Welcome Back</h1>
                    <p className="sb-login__form-subtitle">Sign in to access your dashboard.</p>
                </div>
 
                {/* Error message */}
                {errorMsg && (
                    <div className="sb-login__error" role="alert" aria-live="assertive">
                        <span className="sb-login__error-icon" aria-hidden="true">⚠</span>
                        {errorMsg}
                    </div>
                )}
 
                {/* Form */}
                <form className="sb-login__form" onSubmit={handleLogin} noValidate>
 
                    <div className="sb-login__field">
                        <label className="sb-login__label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            className="sb-login__input"
                            type="email"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
 
                    <div className="sb-login__field">
                        <label className="sb-login__label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="sb-login__input"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
 
                    <button
                        type="submit"
                        className="sb-login__submit"
                        disabled={isLoading}
                        aria-busy={isLoading}
                        aria-label={isLoading ? 'Authenticating, please wait' : 'Login to SnapBulance'}
                    >
                        {isLoading ? (
                            <>
                                <div className="sb-login__submit-spinner" aria-hidden="true">
                                    <span /><span /><span />
                                </div>
                                Authenticating...
                            </>
                        ) : (
                            '→ Sign In'
                        )}
                    </button>
 
                </form>
 
                {/* Divider */}
                <div className="sb-login__divider" aria-hidden="true">
                    <div className="sb-login__divider-line" />
                    <span className="sb-login__divider-text">New to SnapBulance?</span>
                    <div className="sb-login__divider-line" />
                </div>
 
                {/* Register link */}
                <p className="sb-login__register">
                    Don't have an account?{' '}
                    <Link to="/register">Create one here</Link>
                </p>
 
            </div>
        </div>
    </div>
);
};

export default LoginPage;