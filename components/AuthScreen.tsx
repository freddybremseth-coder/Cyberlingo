
import React, { useState } from 'react';
import { SourceLang, UserProfile } from '../types';
import NeonButton from './NeonButton';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<SourceLang>('no');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsConnecting(true);
    
    // Simulerer nettverkstilkobling
    setTimeout(() => {
      const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
      
      let user: UserProfile;
      if (savedUsers[username]) {
        user = savedUsers[username];
      } else {
        user = {
          username: username.trim(),
          sourceLang: lang,
          completedLessonIds: [],
          masteredVocab: [],
          masteredPhrases: [],
          lastActive: Date.now()
        };
      }
      
      onLogin(user);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      
      <div className="max-w-md w-full glass-panel p-8 rounded-lg border-2 border-cyan/30 shadow-[0_0_50px_rgba(0,217,255,0.1)] relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-magenta rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_#FF006E] mx-auto mb-6">
            <span className="text-dark font-heading font-bold -rotate-45 text-2xl">Ñ</span>
          </div>
          <h1 className="text-3xl font-heading text-cyan neon-text-cyan tracking-tighter mb-2">NEURAL_LINK</h1>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">Identity Verification Required</p>
        </div>

        {isConnecting ? (
          <div className="py-12 flex flex-col items-center space-y-6">
            <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cyan font-mono text-[11px] animate-pulse tracking-[0.2em]">ESTABLISHING_CONNECTION...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-2 ml-1">Bruker_ID / Username</label>
              <input 
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Skriv inn navn..."
                className="w-full bg-dark/60 border border-cyan/20 p-4 rounded font-heading text-cyan focus:border-cyan focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase mb-2 ml-1">Interface_Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setLang('no')}
                  className={`py-3 rounded border font-mono text-xs transition-all ${lang === 'no' ? 'border-magenta bg-magenta/10 text-magenta' : 'border-white/10 text-white/30 hover:border-white/20'}`}
                >
                  NORWEGIAN_UNIT
                </button>
                <button 
                  type="button"
                  onClick={() => setLang('ru')}
                  className={`py-3 rounded border font-mono text-xs transition-all ${lang === 'ru' ? 'border-magenta bg-magenta/10 text-magenta' : 'border-white/10 text-white/30 hover:border-white/20'}`}
                >
                  RUSSIAN_UNIT
                </button>
              </div>
            </div>

            <NeonButton variant="cyan" className="w-full py-4 mt-4">
              Connect_to_Cortex
            </NeonButton>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
            {username ? `System will remember progress for: ${username}` : 'New profiles will be initialized automatically'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
