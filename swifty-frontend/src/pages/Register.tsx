import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { useAuthStore } from '../store';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(name, email, password, phone);
      setUser(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FF8A00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        border: '1px solid #E9E9EB',
      }}>
        {/* Favicon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px',
        }}>
          <img 
            src="/favicon.png" 
            alt="Swifty" 
            style={{ 
              height: '80px', 
              width: '80px',
            }}
          />
        </div>

        <h1 style={{
          color: '#1A1A1A',
          textAlign: 'center',
          marginBottom: '12px',
          fontSize: '32px',
          fontWeight: 600,
          fontFamily: 'Poppins, sans-serif',
        }}>
          Create Account
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#686B78',
          marginBottom: '32px',
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Sign up to start ordering
        </p>

        {error && (
          <div style={{
            backgroundColor: '#FFF0F0',
            color: '#E03636',
            padding: '14px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            border: '1px solid #FFD6D6',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            size="lg"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: '#686B78',
          fontSize: '15px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Already have an account?{' '}
          <a href="/login" style={{
            color: '#FF8A00',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};
