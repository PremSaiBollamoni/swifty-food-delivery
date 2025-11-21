import type { ReactNode } from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

export const Button = ({ 
  onClick, 
  children, 
  variant = 'primary',
  disabled = false,
  size = 'md',
  fullWidth = false,
  type = 'button'
}: ButtonProps) => {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 32px' : '12px 24px',
    fontSize: size === 'sm' ? '14px' : size === 'lg' ? '16px' : '15px',
    fontFamily: 'Poppins, sans-serif',
  };

  const variants = {
    primary: {
      ...baseStyles,
      backgroundColor: disabled ? '#C7C7C7' : '#FF8A00',
      color: '#FFFFFF',
    },
    secondary: {
      ...baseStyles,
      backgroundColor: '#2E2E2E',
      color: '#FFFFFF',
    },
    outline: {
      ...baseStyles,
      backgroundColor: 'transparent',
      border: '2px solid #FF8A00',
      color: '#FF8A00',
    },
  };

  return (
    <button
      style={variants[variant]}
      onClick={onClick}
      disabled={disabled}
      type={type}
      onMouseEnter={(e) => {
        if (!disabled) {
          const btn = e.currentTarget as HTMLButtonElement;
          if (variant === 'primary') {
            btn.style.backgroundColor = '#F87400';
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 12px rgba(255,138,0,0.3)';
          }
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        if (variant === 'primary') {
          btn.style.backgroundColor = '#FF8A00';
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
};
