import React, { useState } from 'react';
import { SourceLang, UserProfile, TRIAL_DAYS, SUBSCRIPTION_PRICE_NOK } from '../types';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const createNewUser = (username: string, lang: SourceLang): UserProfile => ({
  username,
  sourceLang: lang,
  completedLessonIds: [],
  masteredVocab: [],
  masteredPhrases: [],
  lastActive: Date.now(),
  streak: 0,
  lastStreakDate: '',
  xp: 0,
  level: 1,
  subscription: {
    plan: 'trial',
    trialStartDate: Date.now(),
    subscribedDate: null,
    expiresAt: null,
  },
  apiKey: '',
  achievements: [],
  dailyGoalXp: 50,
  todayXp: 0,
  lastGoalDate: new Date().toISOString().slice(0, 10),
  conversationsCompleted: 0,
});

const AuthScreen: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<'welcome' | 'login'>('welcome');
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState<SourceLang>('no');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) { setError('Skriv inn et brukernavn'); return; }
    if (name.length < 2) { setError('Brukernavnet må ha minst 2 tegn'); return; }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
      const user: UserProfile = users[name] ? users[name] : createNewUser(name, lang);
      onLogin(user);
    }, 800);
  };

  if (step === 'welcome') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-sm w-full relative z-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 animate-float"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 16px 40px var(--primary-glow)',
              }}
            >
              🇪🇸
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient mb-2">¡Hola!</h1>
            <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Lær Spansk Raskt
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Snakk og forstå spansk på rekordtid
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-10">
            {[
              { icon: '💬', title: 'Ekte samtaler', desc: 'Øv med AI i virkelige situasjoner' },
              { icon: '🔥', title: 'Daglig streak', desc: 'Hold motivasjonen oppe dag for dag' },
              { icon: '🧠', title: 'Intelligent læring', desc: 'Tilpasset din fremgang og nivå' },
              { icon: '🎯', title: 'Rask progresjon', desc: 'Fra nybegynner til flyt på korteste tid' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl animate-fadeInUp"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'rgba(249,115,22,0.12)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div
            className="p-4 rounded-2xl mb-6 text-center"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              🎁 {TRIAL_DAYS} dager gratis prøveperiode
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Deretter kun {SUBSCRIPTION_PRICE_NOK} kr/mnd • Ingen binding
            </p>
          </div>

          <button
            onClick={() => setStep('login')}
            className="btn-primary w-full py-4 text-base animate-popIn"
            style={{ animationDelay: '0.4s' }}
          >
            Kom i gang gratis
          </button>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            Allerede bruker?{' '}
            <button
              onClick={() => setStep('login')}
              className="font-semibold"
              style={{ color: 'var(--secondary)' }}
            >
              Logg inn
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Login step ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-sm w-full">
        {/* Back */}
        <button
          onClick={() => setStep('welcome')}
          className="flex items-center gap-2 mb-8 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--primary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake
        </button>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 8px 24px var(--primary-glow)' }}
          >
            🇪🇸
          </div>
          <h2 className="text-2xl font-black">Hvem er du?</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Velg et brukernavn for å lagre fremgangen din
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              Brukernavn
            </label>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="F.eks. Maria, Lars, Alex..."
              className="app-input"
              maxLength={30}
            />
            {error && (
              <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              Ditt morsmål
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'no', flag: '🇳🇴', label: 'Norsk' },
                { value: 'ru', flag: '🇷🇺', label: 'Russisk' },
              ] as { value: SourceLang; flag: string; label: string }[]).map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLang(l.value)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all text-sm"
                  style={{
                    background: lang === l.value ? 'var(--primary)' : 'var(--bg-card)',
                    border: `1.5px solid ${lang === l.value ? 'transparent' : 'var(--border)'}`,
                    color: lang === l.value ? 'white' : 'var(--text-muted)',
                    boxShadow: lang === l.value ? '0 4px 12px var(--primary-glow)' : 'none',
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="btn-primary w-full py-4 text-base mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logger inn...
              </span>
            ) : (
              'Start læringen →'
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
          Fremgangen din lagres lokalt på enheten. Du trenger en Gemini API-nøkkel for å bruke AI-funksjoner.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
