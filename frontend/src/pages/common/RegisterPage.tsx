import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; // Adjust path as needed
import type { Role } from '../../store/useAuthStore'; // Import the Role type

export interface RegisterPageProps {}

const RegisterPage: React.FC<RegisterPageProps> = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  // Form state
  const [role, setRole] = useState<Role>('USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // Mapping local state to your SignupDto
      await signup({
        fullName,
        email,
        phone,
        passwordHash: password, 
        role, 
      });

      // Route them based on the role they just registered as
      if (role === 'USER') navigate('/user/home', { replace: true });
      else if (role === 'DRIVER') navigate('/driver/dashboard', { replace: true });
      else if (role === 'HOSPITAL_ADMIN') navigate('/hospital/dashboard', { replace: true });

    } catch (error: any) {
      // Display validation errors from NestJS (often an array of strings for class-validator)
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorMsg(message[0]); 
      } else {
        setErrorMsg(message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>📝 Create Account</h1>

      {/* Role Toggle mapped to Prisma Enum */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setRole('USER')}
          style={{ padding: '0.5rem', background: role === 'USER' ? 'blue' : '#ddd', color: role === 'USER' ? 'white' : 'black' }}
        >
          Passenger
        </button>
        <button
          type="button"
          onClick={() => setRole('DRIVER')}
          style={{ padding: '0.5rem', background: role === 'DRIVER' ? 'blue' : '#ddd', color: role === 'DRIVER' ? 'white' : 'black' }}
        >
          Driver
        </button>
        <button
          type="button"
          onClick={() => setRole('HOSPITAL_ADMIN')}
          style={{ padding: '0.5rem', background: role === 'HOSPITAL_ADMIN' ? 'blue' : '#ddd', color: role === 'HOSPITAL_ADMIN' ? 'white' : 'black' }}
        >
          Hospital
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: '0.8rem' }}
        />
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.8rem' }}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '0.8rem' }}
        />
        <input
          type="password"
          placeholder="Create Password (min 6 chars)"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.8rem' }}
        />

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '1rem', 
            background: isLoading ? '#999' : '#333', 
            color: 'white', 
            border: 'none', 
            cursor: isLoading ? 'not-allowed' : 'pointer' 
          }}
        >
          {isLoading ? 'Creating Account...' : `Sign Up as ${role.replace('_ADMIN', '')}`}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'blue' }}>Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;