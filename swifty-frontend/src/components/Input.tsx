interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  error,
  label
}: InputProps) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#3E4152',
          fontWeight: 500,
          fontSize: '14px',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: `2px solid ${error ? '#E03636' : '#E9E9EB'}`,
          borderRadius: '8px',
          fontSize: '15px',
          fontFamily: 'Poppins, sans-serif',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          backgroundColor: disabled ? '#F0F0F5' : '#FFFFFF',
          color: '#3E4152',
          outline: 'none',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = '#FF8A00';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,138,0,0.1)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#E03636' : '#E9E9EB';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <span style={{
          color: '#E03636',
          fontSize: '13px',
          marginTop: '6px',
          display: 'block',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {error}
        </span>
      )}
    </div>
  );
};
