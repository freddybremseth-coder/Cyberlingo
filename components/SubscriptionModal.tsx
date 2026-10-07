import React, { useState } from 'react';
import { UserProfile, TRIAL_FREE_TASKS, getTrialTasksLeft } from '../types';
import { startSubscription } from '../services/platformClient';

interface Props {
  user: UserProfile;
  onClose: () => void;
}

const SubscriptionModal: React.FC<Props> = ({ user, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tasksLeft = getTrialTasksLeft(user);
  const trialExpired =
    user.subscription.plan === 'trial' &&
    (tasksLeft === 0 ||
      (user.subscription.expiresAt !== null &&
        user.subscription.expiresAt !== undefined &&
        user.subscription.expiresAt <= Date.now()));

  const features = [
    'Alle grammatikkleksjoner (A1–B2)',
    'Ubegrenset standard AI-samtaletrening',
    '500+ ord og fraser per kategori',
    'Kamera-læringsmodus',
    'Synkronisert progresjon på tvers av enheter',
    'Daglig streak, prestasjoner og XP',
  ];

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await startSubscription(selectedPlan);
      if (!data.url) throw new Error('Checkout kunne ikke startes.');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || 'Checkout feilet.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 modal-overlay">
      <div
        className="w-full max-w-sm rounded-3xl p-6 animate-slideUp sm:animate-scaleIn"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🌟</div>
          <h2 className="text-2xl font-black mb-1">
            {trialExpired ? 'Prøveperioden er over' : 'Oppgrader til Premium'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {trialExpired
              ? 'Prøven inkluderer ' + TRIAL_FREE_TASKS + ' AI-oppgaver og varer i opptil 7 dager'
              : 'Få full tilgang til Spanish ChatGenius'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className="p-3 rounded-2xl text-center transition-all"
            style={{
              background: selectedPlan === 'monthly' ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
              border: '1.5px solid ' + (selectedPlan === 'monthly' ? 'rgba(249,115,22,0.5)' : 'var(--border)'),
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Månedlig</p>
            <p className="text-xl font-black text-gradient">€7.99</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/måned</p>
          </button>

          <button
            onClick={() => setSelectedPlan('yearly')}
            className="p-3 rounded-2xl text-center relative transition-all"
            style={{
              background: selectedPlan === 'yearly' ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
              border: '1.5px solid ' + (selectedPlan === 'yearly' ? 'rgba(249,115,22,0.5)' : 'var(--border)'),
            }}
          >
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              SPAR 25%
            </span>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Årlig</p>
            <p className="text-xl font-black text-gradient">€71.91</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>€5.99/mnd</p>
          </button>
        </div>

        <ul className="space-y-2 mb-5">
          {features.map(text => (
            <li key={text} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div
          className="p-3 rounded-xl mb-4 text-xs"
          style={{
            background: 'rgba(56,189,248,.06)',
            border: '1px solid rgba(56,189,248,.15)',
            color: 'var(--text-muted)',
          }}
        >
          Luna Live er en eier-/utviklerfunksjon og er ikke en del av ordinært Premium.
        </div>

        {error && (
          <p className="text-xs text-center mb-3" style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
        )}

        <button
          onClick={subscribe}
          disabled={loading}
          className="btn-primary w-full py-4 text-base mb-3"
          style={{ opacity: loading ? .7 : 1 }}
        >
          {loading
            ? 'Kobler til Stripe...'
            : selectedPlan === 'yearly'
              ? 'Start nå – €71.91/år'
              : 'Start nå – €7.99/mnd'}
        </button>

        {!trialExpired && (
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            Fortsett prøveperioden ({tasksLeft} AI-oppgaver igjen)
          </button>
        )}

        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
          Sikker betaling via Stripe · Abonnement styres av RealtyFlow Platform Core
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
