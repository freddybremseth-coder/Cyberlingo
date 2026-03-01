
import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

const TTSButton: React.FC<TTSButtonProps> = ({ text, className = '', size = 'md' }) => {
  const [loading, setLoading] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await generateSpeech(text);
    } catch (err) {
      console.error('TTS failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      title="Hør uttale"
      className={`
        inline-flex items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 
        hover:bg-cyan/20 hover:border-cyan transition-all duration-300 group
        disabled:opacity-50 ${sizeClasses} ${className}
      `}
    >
      {loading ? (
        <div className="w-3 h-3 border border-cyan border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-cyan group-hover:scale-110" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default TTSButton;
