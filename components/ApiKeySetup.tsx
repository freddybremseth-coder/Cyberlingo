import React, { useState } from 'react';
import { validateApiKey, detectProvider, AIProvider } from '../services/geminiService';

interface Props {
  onSave: (key: string) => void;
  onSkip?: () => void;
  username: string;
}

const PROVIDER_INFO: Record<AIProvider, { label: string; color: string; prefix: string; getUrl: string; steps: string[] }> = {
  gemini: {
    label: 'Google Gemini',
    color: '#4285F4',
    prefix: 'AIza...',
    getUrl: 'aistudio.google.com',
    steps: [
      'Gå til aistudio.google.com',
      'Logg inn med Google-kontoen din',
      'Klikk "Get API key" → "Create API key"',
      'Kopier nøkkelen (starter med AIza...)',
    ],
  },
  claude: {
    label: 'Anthropic Claude',
    color: '#D4856A',
    prefix: 'sk-ant-...',
    getUrl: 'console.anthropic.com',
    steps: [
      'Gå til console.anthropic.com',
      'Opprett konto eller logg inn',
      'Gå til "API Keys" → "Create Key"',
      'Kopier nøkkelen (starter med sk-ant-...)',
    ],
  },
  openai: {
    label: 'OpenAI',
    color: '#10A37F',
    prefix: 'sk-...',
    getUrl: 'platform.openai.com',
    steps: [
      'Gå til platform.openai.com',
      'Logg inn og gå til "API keys"',
      'Klikk "+ Create new secret key"',
      'Kopier nøkkelen (starter med sk-...)',
    ],
  },
};

const ApiKeySetup: React.FC<Props> = ({ onSave, onSkip, username }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'ok'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const detectedProvider: AIProvider | null = key.trim().length > 6
    ? detectProvider(key.trim())
    : null;

  const providerInfo = detectedProvider ? PROVIDER_INFO[detectedProvider] : null;

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed) { setErrorMsg('Skriv inn API-nøkkelen din'); return; }

    setStatus('validating');
    setErrorMsg('');

    const valid = await validateApiKey(trimmed);
    if (valid) {
      setStatus('ok');
      setTimeout(() => onSave(trimmed), 600);
    } else {
      setStatus('error');
      setErrorMsg('API-nøkkelen er ugyldig eller mangler tilgang. Sjekk nøkkelen og prøv igjen.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-sm w-full">
        {/* Icon */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            🔑
          </div>
          <h2 className="text-2xl font-black mb-2">API-nøkkel kreves</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Hei {username}! Koble til Gemini, Claude eller OpenAI for å bruke AI-funksjoner.
          </p>
        </div>

        {/* Provider tabs */}
        <div className="flex gap-2 mb-4">
          {(Object.entries(PROVIDER_INFO) as [AIProvider, typeof PROVIDER_INFO[AIProvider]][]).map(([id, info]) => (
            <div
              key={id}
              className="flex-1 text-center px-2 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: detectedProvider === id ? `${info.color}22` : 'var(--bg-card)',
                border: `1px solid ${detectedProvider === id ? info.color + '66' : 'var(--border)'}`,
                color: detectedProvider === id ? info.color : 'var(--text-faint)',
              }}
            >
              {info.label.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            Din API-nøkkel
          </label>
          <div className="relative">
            <input
              type="password"
              value={key}
              onChange={e => { setKey(e.target.value); setStatus('idle'); setErrorMsg(''); }}
              placeholder="AIza...  /  sk-ant-...  /  sk-..."
              className="app-input font-mono text-sm"
            />
            {detectedProvider && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: providerInfo!.color + '22', color: providerInfo!.color }}
              >
                {providerInfo!.label.split(' ')[0]}
              </div>
            )}
          </div>
          {errorMsg && (
            <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
          )}
          {status === 'ok' && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <span>✓</span> API-nøkkel validert! Logger inn...
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={status === 'validating' || status === 'ok'}
          className="btn-primary w-full py-4 mb-6"
        >
          {status === 'validating' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validerer nøkkel...
            </span>
          ) : status === 'ok' ? '✓ Klar!' : 'Lagre API-nøkkel'}
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="btn-ghost w-full py-3 mb-6"
          >
            Fortsett uten AI-nøkkel
          </button>
        )}

        {/* Provider instructions */}
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {providerInfo
              ? `Slik får du ${providerInfo.label}-nøkkel:`
              : 'Støttede leverandører:'}
          </p>

          {providerInfo ? (
            (providerInfo.steps).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: providerInfo.color, color: 'white' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step}</p>
              </div>
            ))
          ) : (
            (Object.entries(PROVIDER_INFO) as [AIProvider, typeof PROVIDER_INFO[AIProvider]][]).map(([id, info]) => (
              <div key={id} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: info.color }}
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-semibold" style={{ color: info.color }}>{info.label}</span>
                  {' '}— {info.prefix}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Security note */}
        <div
          className="p-3 rounded-xl mt-4 flex items-start gap-2"
          style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}
        >
          <span className="text-lg">🔒</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Nøkkelen din lagres kun på din enhet og sendes aldri til våre servere.
            Alle tre leverandørene har gratis nivåer som er nok for daglig bruk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;
