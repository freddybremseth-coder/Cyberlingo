import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'magenta' | 'lime' | 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'cyan',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '12px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      color: 'white',
      boxShadow: disabled ? 'none' : '0 4px 15px var(--primary-glow)',
    },
    cyan: {
      background: 'rgba(56,189,248,0.1)',
      color: 'var(--secondary)',
      border: '1px solid rgba(56,189,248,0.35)',
    },
    magenta: {
      background: 'rgba(249,115,22,0.1)',
      color: 'var(--primary)',
      border: '1px solid rgba(249,115,22,0.35)',
    },
    lime: {
      background: 'rgba(74,222,128,0.1)',
      color: 'var(--success)',
      border: '1px solid rgba(74,222,128,0.35)',
    },
    secondary: {
      background: 'rgba(56,189,248,0.1)',
      color: 'var(--secondary)',
      border: '1px solid rgba(56,189,248,0.25)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)',
    },
  };

  const style = { ...baseStyle, ...variantStyles[variant] };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`px-5 py-2.5 ${className}`}
    >
      {children}
    </button>
  );
};

export default NeonButton;
