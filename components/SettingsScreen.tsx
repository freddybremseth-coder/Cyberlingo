import React, { useState } from 'react';
import { UserProfile, SourceLang, SUBSCRIPTION_PRICE_NOK, TRIAL_DAYS, getTrialDaysLeft, isSubscriptionActive } from '../types';
import { setStoredApiKey, clearStoredApiKey, validateApiKey, detectProvider } from '../services/geminiService';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onApiKeySave: (key: string) => void;
  onSubscribe: () => void;
  onLangChange: (lang: SourceLang) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p
      className="text-xs font-bold uppercase tracking-widest mb-3 pl-1"
      style={{ color: 'var(--text-muted)' }}
    >
      {title}
    </p>
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  </div>
);

const Row: React.FC<{
  icon: string;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}> = ({ icon, label, value, onClick, danger }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
    style={{ borderBottom: '1px solid var(--border)' }}
  >
    <span className="text-lg">{icon}</span>
    <span
      className="flex-1 text-sm font-semibold"
      style={{ color: danger ? 'var(--danger)' : 'var(--text)' }}
    >
      {label}
    </span>
    {value && (
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{value}</span>
    )}
    {onClick && (
      <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
  </button>
);

const SettingsScreen: React.FC<Props> = ({ user, onLogout, onApiKeySave, onSubscribe, onLangChange }) => {
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'validating' | 'ok' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  const currentKey = localStorage.getItem('cyberlingo_api_key') || user.apiKey;
  const maskedKey = currentKey ? `${currentKey.slice(0, 6)}...${currentKey.slice(-4)}` : 'Ikke satt';
  const providerLabel = currentKey
    ? ({ gemini: 'Gemini', claude: 'Claude', openai: 'OpenAI' } as const)[detectProvider(currentKey)]
    : null;

  const subActive = isSubscriptionActive(user.subscription);
  const trialLeft = user.subscription.plan === 'trial' ? getTrialDaysLeft(user.subscription) : null;

  const handleSaveApiKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) { setApiError('Skriv inn nøkkelen'); return; }
    setApiStatus('validating');
    setApiError('');
    const ok = await validateApiKey(key);
    if (ok) {
      setApiStatus('ok');
      onApiKeySave(key);
      setTimeout(() => {
        setShowApiInput(false);
        setApiKeyInput('');
        setApiStatus('idle');
      }, 1200);
    } else {
      setApiStatus('error');
      setApiError('Ugyldig nøkkel. Sjekk og prøv igjen.');
    }
  };

  const handleClearApiKey = () => {
    clearStoredApiKey();
    onApiKeySave('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile header */}
      <div
        className="p-5 rounded-3xl text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(56,189,248,0.05))',
          border: '1px solid rgba(249,115,22,0.15)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
        >
          {user.username.slice(0, 1).toUpperCase()}
        </div>
        <p className="text-xl font-black">{user.username}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="badge badge-primary text-xs">⚡ {user.xp} XP</span>
          <span className="badge badge-secondary text-xs">Nivå {user.level}</span>
          <span className="badge text-xs" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--warning)' }}>
            🔥 {user.streak} dager
          </span>
        </div>
      </div>

      {/* Subscription section */}
      <Section title="Abonnement">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm">
                {user.subscription.plan === 'monthly'
                  ? '✅ Aktiv abonnent'
                  : user.subscription.plan === 'trial'
                  ? `🎁 Gratis prøveperiode`
                  : '❌ Ingen abonnement'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {user.subscription.plan === 'monthly'
                  ? `${SUBSCRIPTION_PRICE_NOK} kr/mnd • Full tilgang`
                  : user.subscription.plan === 'trial'
                  ? trialLeft !== null
                    ? `${trialLeft} dag${trialLeft !== 1 ? 'er' : ''} igjen av prøveperioden`
                    : 'Prøveperiode aktiv'
                  : 'Ingen aktiv plan'}
              </p>
            </div>
            {user.subscription.plan !== 'monthly' && (
              <button
                onClick={onSubscribe}
                className="btn-primary px-4 py-2 text-sm"
              >
                Abonner nå
              </button>
            )}
          </div>

          {user.subscription.plan !== 'monthly' && (
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.15)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                Full tilgang for {SUBSCRIPTION_PRICE_NOK} kr/mnd
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Alle leksjoner, samtaler, AI-funksjoner · Ingen binding
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* API key section */}
      <Section title="AI API-nøkkel">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm">
                {currentKey ? `🔑 ${providerLabel}-nøkkel satt` : '⚠️ Ingen nøkkel'}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {currentKey ? maskedKey : 'AI-funksjoner er ikke tilgjengelige'}
              </p>
            </div>
            <div className="flex gap-2">
              {currentKey && (
                <button
                  onClick={handleClearApiKey}
                  className="btn-ghost px-3 py-1.5 text-xs"
                >
                  Fjern
                </button>
              )}
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                {currentKey ? 'Bytt' : 'Legg til'}
              </button>
            </div>
          </div>

          {showApiInput && (
            <div className="space-y-3 animate-fadeInUp">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => { setApiKeyInput(e.target.value); setApiStatus('idle'); setApiError(''); }}
                placeholder="AIza...  /  sk-ant-...  /  sk-..."
                className="app-input font-mono text-sm"
              />
              {apiError && (
                <p className="text-xs" style={{ color: 'var(--danger)' }}>{apiError}</p>
              )}
              {apiStatus === 'ok' && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--success)' }}>
                  <span>✓</span> Nøkkel lagret!
                </p>
              )}
              <button
                onClick={handleSaveApiKey}
                disabled={apiStatus === 'validating' || apiStatus === 'ok'}
                className="btn-primary w-full py-3 text-sm"
              >
                {apiStatus === 'validating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validerer...
                  </span>
                ) : apiStatus === 'ok' ? '✓ Lagret!' : 'Lagre nøkkel'}
              </button>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Nøkkelen din lagres kun lokalt på enheten din.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Language */}
      <Section title="Morsmål (forklaringsspråk)">
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              { value: 'no', flag: '🇳🇴', label: 'Norsk' },
              { value: 'en', flag: '🇬🇧', label: 'English' },
              { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
              { value: 'ru', flag: '🇷🇺', label: 'Русский' },
            ] as { value: SourceLang; flag: string; label: string }[]).map(l => (
              <button
                key={l.value}
                onClick={() => onLangChange(l.value)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: user.sourceLang === l.value ? 'var(--primary)' : 'transparent',
                  color: user.sourceLang === l.value ? 'white' : 'var(--text-muted)',
                  border: `1.5px solid ${user.sourceLang === l.value ? 'transparent' : 'var(--border)'}`,
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* App info */}
      <Section title="App-informasjon">
        <Row icon="📱" label="Versjon" value="2.0.0" />
        <Row icon="🔐" label="Personvern" value="Data lagres lokalt" />
        <Row icon="💡" label="AI-leverandør" value={providerLabel ?? 'Ikke satt'} />
      </Section>

      {/* Danger zone */}
      <div>
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: 'var(--danger)',
          }}
        >
          Logg ut
        </button>
      </div>

      <p className="text-center text-xs pb-4" style={{ color: 'var(--text-faint)' }}>
        ¡Hola! – Lær Spansk Raskt · Laget med ❤️
      </p>
    </div>
  );
};

export default SettingsScreen;
