
import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'magenta' | 'lime';
  className?: string;
  disabled?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'cyan', 
  className = '',
  disabled = false
}) => {
  const variants = {
    cyan: 'border-cyan text-cyan hover:bg-cyan/20 shadow-[0_0_10px_#00D9FF]',
    magenta: 'border-magenta text-magenta hover:bg-magenta/20 shadow-[0_0_10px_#FF006E]',
    lime: 'border-lime text-lime hover:bg-lime/20 shadow-[0_0_10px_#FFBE0B]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2 border-2 uppercase font-heading text-sm tracking-widest transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default NeonButton;
