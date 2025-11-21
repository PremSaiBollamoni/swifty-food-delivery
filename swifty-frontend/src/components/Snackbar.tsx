import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Snackbar = ({ message, type = 'info', onClose, duration = 3000 }: SnackbarProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: '#60B246', icon: '✓' },
    error: { bg: '#E03636', icon: '✕' },
    warning: { bg: '#FF8A00', icon: '⚠' },
    info: { bg: '#3E4152', icon: 'ℹ' },
  };

  const { bg, icon } = colors[type];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: bg,
      color: '#FFFFFF',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 10000,
      fontFamily: 'Poppins, sans-serif',
      fontSize: '15px',
      fontWeight: 500,
      minWidth: '300px',
      maxWidth: '500px',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFFFFF',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};
