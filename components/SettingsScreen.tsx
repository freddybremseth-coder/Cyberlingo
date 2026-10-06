import React, { useState } from 'react';
import { SourceLang, TRIAL_FREE_TASKS, UserProfile, getTrialTasksLeft } from '../types';
import { supabase } from '../services/supabaseClient';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onApiKeySave: (key: string) => void;
  onSubscribe: () => void;
  onLangChange: (lang: SourceLang) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-widest mb-3 pl-1" style={{ color: 'var(--text-muted)' }}>
      {title}
    </p>
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  </div>
);

const SettingsScreen: React.FC<Props> = ({ user, onLogout, onSubscribe, onLangChange }) => {
  const [portalLoading, setPortalLoading] = useState(false);

  const accessKind = (user.subscription as any).accessKind as string | undefined;
  const isLifetime = user.subscription.plan === 'lifetime' || accessKind === 'lifetime';
  const isComplimentary = ['manual', 'family', 'partner', 'promo'].includes(accessKind || '');
  const isStripePaid = !isComplimentary && (user.subscription.plan === 'monthly' || user.subscription.plan === 'yearly');
  const hasPremiumAccess = isLifetime || isStripePaid || isComplimentary;
  const tasksLeft = user.subscription.plan === 'trial' ? getTrialTasksLeft(user) : null;

  const complimentaryLabel = ({
    family: 'Familietilgang',
    partner: 'Partnertilgang',
    promo: 'Promotilgang',
    manual: 'Manuell tilgang',
  } as Record<string, string>)[accessKind || ''] || 'Gratis tilgang';

  const handleManageSubscription = async () => {
    const sessionId = user.subscription.stripeCheckoutSessionId;
    if (!sessionId) return;

    setPortalLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch('/api/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Kunne ikke åpne abonnementet');
      if (payload.url) window.location.href = payload.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const accessTitle = isLifetime
    ? '♾️ Livslangt Premium'
    : isComplimentary
      ? `🎟️ ${complimentaryLabel}`
      : isStripePaid
        ? (user.subscription.plan === 'yearly' ? '✅ Premium Årlig' : '✅ Premium Månedlig')
        : user.subscription.plan === 'trial'
          ? '🎁 Gratis prøveperiode'
          : '❌ Ingen aktiv tilgang';

  const accessDescription = isLifetime
    ? 'Full tilgang for alltid · Ingen fornyelse'
    : isComplimentary
      ? user.subscription.expiresAt
        ? `Full tilgang til ${new Date(user.subscription.expiresAt).toLocaleDateString('nb-NO')}`
        : 'Full tilgang uten sluttdato'
      : isStripePaid
        ? user.subscription.plan === 'yearly'
          ? '€71.91/år · Full tilgang'
          : '€7.99/mnd · Full tilgang'
        : user.subscription.plan === 'trial'
          ? `${tasksLeft ?? 0} av ${TRIAL_FREE_TASKS} gratis AI-oppgaver igjen`
          : 'Abonner eller be om tilgang for å bruke AI-funksjonene';

  return (
    <div className="space-y-6 animate-fadeIn">
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
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="badge badge-primary text-xs">⚡ {user.xp} XP</span>
          <span className="badge badge-secondary text-xs">Nivå {user.level}</span>
          <span className="badge text-xs" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--warning)' }}>
            🔥 {user.streak} dager
          </span>
        </div>
      </div>

      <Section title="Tilgang">
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{accessTitle}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{accessDescription}</p>
            </div>
            {!hasPremiumAccess && user.subscription.plan !== 'trial' && (
              <button onClick={onSubscribe} className="btn-primary px-4 py-2 text-sm">
                Abonner
              </button>
            )}
          </div>

          {isStripePaid && user.subscription.stripeCheckoutSessionId && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold mt-4"
              style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', color: 'var(--primary)' }}
            >
              {portalLoading ? 'Laster...' : '⚙️ Administrer abonnement'}
            </button>
          )}

          {!hasPremiumAccess && (
            <button onClick={onSubscribe} className="w-full py-2.5 rounded-xl text-sm font-semibold mt-4 btn-secondary">
              Se Premium
            </button>
          )}
        </div>
      </Section>

      <Section title="Forklaringsspråk">
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
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm"
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

      <Section title="Konto og data">
        <div className="px-4 py-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span style={{ color: 'var(--text-muted)' }}>Innlogging</span>
            <span className="font-semibold">Sikker e-postlenke</span>
          </div>
          <div className="flex justify-between gap-3">
            <span style={{ color: 'var(--text-muted)' }}>Progresjon</span>
            <span className="font-semibold">Cloud + lokal cache</span>
          </div>
          <div className="flex justify-between gap-3">
            <span style={{ color: 'var(--text-muted)' }}>AI</span>
            <span className="font-semibold">Cyberlingo server</span>
          </div>
          <p className="text-xs pt-2" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
            Fremgangen din synkroniseres til kontoen slik at du kan fortsette på andre enheter.
          </p>
        </div>
      </Section>

      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl text-sm font-bold"
        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)' }}
      >
        Logg ut
      </button>

      <p className="text-center text-xs pb-4" style={{ color: 'var(--text-faint)' }}>
        ¡Hola! · Cyberlingo
      </p>
    </div>
  );
};

export default SettingsScreen;
