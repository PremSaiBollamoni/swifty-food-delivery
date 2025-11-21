import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === 'swifty@admin.sw' && password === 'swifty-online') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/swiftyadmin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF8A00 0%, #F87400 50%, #FF6B00 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px',
        }}>
          <img 
            src="/favicon.png" 
            alt="Swifty Admin" 
            style={{ height: '80px', width: '80px' }}
          />
        </div>

        <h1 style={{
          color: '#1A1A1A',
          textAlign: 'center',
          marginBottom: '12px',
          fontSize: '32px',
          fontWeight: 700,
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, #FF8A00 0%, #F87400 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Admin Panel
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#686B78',
          fontSize: '14px',
          marginBottom: '32px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Sign in to manage Swifty
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}>Email</label>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '8px',
              fontFamily: 'Poppins, sans-serif',
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#FF8A00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
