import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Snackbar } from '../components/Snackbar';
import { authService } from '../services/api';
import { useAuthStore } from '../store';

export const Login = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
  }>({});
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }
    if (!email.endsWith('@gmail.com')) {
      return 'Only @gmail.com emails are allowed';
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) {
      return 'Phone number is required';
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    // Validate fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      setUser(response.data.user, response.data.token);
      setSnackbar({ message: 'Login successful!', type: 'success' });
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      setSnackbar({ message: err.response?.data?.error || 'Login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    
    if (nameError || emailError || phoneError || passwordError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        phone: phoneError || undefined,
        password: passwordError || undefined,
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await authService.register(name, email, password, phone);
      setUser(response.data.user, response.data.token);
      setSnackbar({ message: 'Account created successfully!', type: 'success' });
      setTimeout(() => navigate('/'), 500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setSnackbar({ message: err.response?.data?.error || 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
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
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: 'none',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Decorative Top Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #FF8A00 0%, #F87400 50%, #FF6B00 100%)',
          borderRadius: '24px 24px 0 0',
        }} />
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          backgroundColor: '#F8F8F8',
          padding: '6px',
          borderRadius: '12px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
              backgroundColor: activeTab === 'login' ? '#FF8A00' : 'transparent',
              color: activeTab === 'login' ? '#FFFFFF' : '#686B78',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'login' ? '0 4px 12px rgba(255,138,0,0.3)' : 'none',
              transform: activeTab === 'login' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
              backgroundColor: activeTab === 'signup' ? '#FF8A00' : 'transparent',
              color: activeTab === 'signup' ? '#FFFFFF' : '#686B78',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'signup' ? '0 4px 12px rgba(255,138,0,0.3)' : 'none',
              transform: activeTab === 'signup' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            Sign Up
          </button>
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
          {activeTab === 'login' ? 'Welcome Back!' : 'Join Swifty!'}
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#686B78',
          fontSize: '14px',
          marginBottom: '32px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {activeTab === 'login' ? 'Sign in to continue your food journey' : 'Create an account to get started'}
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

        <form onSubmit={activeTab === 'login' ? handleLogin : handleSignup}>
          {activeTab === 'signup' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}>Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: errors.name ? '2px solid #E74C3C' : '1px solid #E9E9EB',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = '#FF8A00';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.borderColor = '#E9E9EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.name && (
                <div style={{
                  color: '#E74C3C',
                  fontSize: '13px',
                  marginTop: '6px',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {errors.name}
                </div>
              )}
            </div>
          )}

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
              placeholder="your@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: errors.email ? '2px solid #E74C3C' : '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = '#FF8A00';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = '#E9E9EB';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
            {errors.email && (
              <div style={{
                color: '#E74C3C',
                fontSize: '13px',
                marginTop: '6px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                {errors.email}
              </div>
            )}
          </div>

          {activeTab === 'signup' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif',
              }}>Phone</label>
              <input
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 10) {
                    setPhone(value);
                    if (errors.phone) {
                      setErrors({ ...errors, phone: undefined });
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: errors.phone ? '2px solid #E74C3C' : '1px solid #E9E9EB',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.phone) {
                    e.currentTarget.style.borderColor = '#FF8A00';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.phone) {
                    e.currentTarget.style.borderColor = '#E9E9EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.phone && (
                <div style={{
                  color: '#E74C3C',
                  fontSize: '13px',
                  marginTop: '6px',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {errors.phone}
                </div>
              )}
            </div>
          )}

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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: errors.password ? '2px solid #E74C3C' : '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = '#FF8A00';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = '#E9E9EB';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
            {errors.password && (
              <div style={{
                color: '#E74C3C',
                fontSize: '13px',
                marginTop: '6px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                {errors.password}
              </div>
            )}
            {activeTab === 'signup' && !errors.password && (
              <div style={{
                color: '#686B78',
                fontSize: '12px',
                marginTop: '6px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (!@#$%^&*)
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            size="lg"
          >
            {loading ? (activeTab === 'login' ? 'Signing in...' : 'Creating account...') : (activeTab === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        {/* Snackbar */}
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={() => setSnackbar(null)}
          />
        )}
      </div>
    </div>
  );
};
