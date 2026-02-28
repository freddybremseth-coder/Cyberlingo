import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';

interface Props {
  onSave: (key: string) => void;
  username: string;
}

const ApiKeySetup: React.FC<Props> = ({ onSave, username }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'ok'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed) { setErrorMsg('Skriv inn API-nøkkelen din'); return; }
    if (!trimmed.startsWith('AIza')) {
      setErrorMsg('Gemini API-nøkler starter alltid med "AIza"');
      return;
    }

    setStatus('validating');
    setErrorMsg('');

    const valid = await validateApiKey(trimmed);
    if (valid) {
      setStatus('ok');
      setTimeout(() => onSave(trimmed), 600);
    } else {
      setStatus('error');
      setErrorMsg('API-nøkkelen er ugyldig eller har ikke tilgang til Gemini. Sjekk og prøv igjen.');
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
            Hei {username}! For å bruke AI-funksjoner trenger du en gratis Gemini API-nøkkel.
          </p>
        </div>

        {/* Steps */}
        <div
          className="p-4 rounded-2xl mb-6 space-y-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>
            Slik får du din gratis API-nøkkel:
          </p>
          {[
            { num: '1', text: 'Gå til Google AI Studio (aistudio.google.com)' },
            { num: '2', text: 'Logg inn med Google-kontoen din' },
            { num: '3', text: 'Klikk "Get API key" → "Create API key"' },
            { num: '4', text: 'Kopier nøkkelen og lim den inn nedenfor' },
          ].map(s => (
            <div key={s.num} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {s.num}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            Din Gemini API-nøkkel
          </label>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setStatus('idle'); setErrorMsg(''); }}
            placeholder="AIza..."
            className="app-input font-mono text-sm"
          />
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
          className="btn-primary w-full py-4"
        >
          {status === 'validating' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validerer nøkkel...
            </span>
          ) : status === 'ok' ? (
            '✓ Klar!'
          ) : (
            'Lagre API-nøkkel'
          )}
        </button>

        {/* Info box */}
        <div
          className="p-3 rounded-xl mt-4 flex items-start gap-2"
          style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}
        >
          <span className="text-lg">🔒</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Nøkkelen din lagres kun på din enhet og sendes aldri til våre servere.
            Gemini API har et gratis nivå som er mer enn nok for daglig bruk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;
