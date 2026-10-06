import React, { useState } from 'react';
import { SourceLang } from '../types';
import { sendMagicLink } from '../services/accountService';

const AuthScreen: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'login' | 'sent'>('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState<SourceLang>('no');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Skriv inn en gyldig e-postadresse');
      return;
    }
    if (!cleanName || cleanName.length < 2) {
      setError('Skriv inn navnet ditt');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendMagicLink(cleanEmail, cleanName, lang);
      setStep('sent');
    } catch (err: any) {
      setError(err?.message || 'Kunne ikke sende innloggingslenke. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md text-center animate-fadeInUp">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
          >
            ¡
          </div>
          <h1 className="text-4xl font-black mb-3 text-gradient">¡Hola!</h1>
          <p className="text-lg font-semibold mb-2">Lær spansk som du faktisk bruker</p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Daglig trening, samtaler og personlig progresjon – nå med trygg konto og synkronisering mellom enheter.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              ['🧠', 'Smart repetisjon'],
              ['💬', 'Samtaletrening'],
              ['📈', 'Din progresjon'],
            ].map(([icon, label]) => (
              <div key={label} className="p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-semibold">{label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setStep('login')} className="btn-primary w-full py-4 text-base">
            Kom i gang / Logg inn
          </button>
          <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            Ingen passord. Du får en sikker innloggingslenke på e-post.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div
          className="w-full max-w-md p-6 rounded-3xl text-center animate-fadeInUp"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-black mb-2">Sjekk e-posten din</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Vi har sendt en sikker innloggingslenke til
          </p>
          <p className="font-bold mb-5">{email.trim().toLowerCase()}</p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-faint)' }}>
            Åpne lenken på denne enheten. Du blir logget inn automatisk og progresjonen din synkroniseres.
          </p>
          <button onClick={() => setStep('login')} className="btn-secondary w-full py-3">
            Bruk en annen e-post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 rounded-3xl animate-fadeInUp"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => setStep('welcome')}
          className="text-sm font-semibold mb-5"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Tilbake
        </button>

        <h2 className="text-2xl font-black mb-1">Logg inn med e-post</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Samme e-post gir deg samme konto på mobil, nettbrett og PC.
        </p>

        <label className="block mb-4">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Navn</span>
          <input
            type="text"
            value={fullName}
            onChange={e => { setFullName(e.target.value); setError(''); }}
            placeholder="F.eks. Maria Hansen"
            className="app-input mt-2"
            autoComplete="name"
          />
        </label>

        <label className="block mb-5">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>E-post</span>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="din@epost.no"
            className="app-input mt-2"
            autoComplete="email"
          />
        </label>

        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Forklaringsspråk
          </p>
          <div className="grid grid-cols-4 gap-2">
            {([
              ['no', '🇳🇴', 'Norsk'],
              ['en', '🇬🇧', 'English'],
              ['de', '🇩🇪', 'Deutsch'],
              ['ru', '🇷🇺', 'Русский'],
            ] as [SourceLang, string, string][]).map(([value, flag, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setLang(value)}
                className="py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: lang === value ? 'var(--primary)' : 'transparent',
                  color: lang === value ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${lang === value ? 'transparent' : 'var(--border)'}`,
                }}
              >
                <span className="block text-lg">{flag}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Sender lenke...' : 'Send innloggingslenke'}
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;
