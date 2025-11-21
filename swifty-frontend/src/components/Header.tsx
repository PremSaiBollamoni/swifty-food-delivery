import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useCartStore } from '../store';
import { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E9E9EB',
      padding: '0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '100%',
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 40px)',
        height: 'clamp(60px, 10vw, 80px)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/logo.png" 
            alt="Swifty" 
            style={{ height: 'clamp(35px, 6vw, 49px)', width: 'auto' }}
          />
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div style={{ 
          flex: 1, 
          maxWidth: '600px', 
          margin: '0 clamp(16px, 3vw, 40px)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%',
            position: 'relative',
            display: isMobile ? 'none' : 'block',
          }}>
            <input
              type="text"
              placeholder="Search for restaurants and food"
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#FFFFFF',
                color: '#3E4152',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF8A00';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,138,0,0.1)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E9E9EB';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            />
            <svg 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                fill: '#93959F'
              }} 
              viewBox="0 0 24 24"
            >
              <path d="M21.71 20.29l-5.4-5.4a8 8 0 1 0-1.42 1.42l5.4 5.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM10 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/>
            </svg>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div style={{
          display: isMobile ? 'none' : 'flex',
          gap: 'clamp(20px, 3vw, 40px)',
          alignItems: 'center',
        }}>
          {/* Cart - Always visible */}
          <Link to="/cart" style={{
            textDecoration: 'none',
            position: 'relative',
            color: '#3E4152',
            fontSize: '16px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FF8A00'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3E4152'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart
            {items.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#FF8A00',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 600,
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/orders" style={{
                textDecoration: 'none',
                color: '#3E4152',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF8A00'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3E4152'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Orders
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FF8A00',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 500, color: '#3E4152' }}>
                  {user.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#93959F',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '0',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF8A00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#93959F'}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/register" style={{
                textDecoration: 'none',
                color: '#3E4152',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF8A00'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3E4152'}
              >
                Login
              </Link>
              <Link to="/register" style={{
                backgroundColor: '#FF8A00',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.2s',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F87400';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,138,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8A00';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: '12px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E4152" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          display: isMobile ? 'flex' : 'none',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E9E9EB',
          padding: '16px',
          gap: '16px',
        }}>
          {/* Mobile Search */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search for restaurants and food"
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid #E9E9EB',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'Poppins, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <svg 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                fill: '#93959F'
              }} 
              viewBox="0 0 24 24"
            >
              <path d="M21.71 20.29l-5.4-5.4a8 8 0 1 0-1.42 1.42l5.4 5.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM10 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/>
            </svg>
          </div>

          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{
            textDecoration: 'none',
            color: '#3E4152',
            fontSize: '16px',
            fontWeight: 500,
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F9F9F9',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart {items.length > 0 && `(${items.length})`}
          </Link>

          {user ? (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{
                textDecoration: 'none',
                color: '#3E4152',
                fontSize: '16px',
                fontWeight: 500,
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F9F9F9',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Orders
              </Link>

              <div style={{ padding: '12px', backgroundColor: '#F9F9F9', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FF8A00',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 500, color: '#3E4152' }}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#FF8A00',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{
                textDecoration: 'none',
                color: '#3E4152',
                fontSize: '16px',
                fontWeight: 500,
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                backgroundColor: '#F9F9F9',
              }}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{
                backgroundColor: '#FF8A00',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
