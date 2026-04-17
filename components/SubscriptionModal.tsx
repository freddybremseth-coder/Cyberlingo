import React, { useState } from 'react';
import { UserProfile, TRIAL_DAYS, getTrialDaysLeft } from '../types';

interface Props {
  user: UserProfile;
  onClose: () => void;
}

const SubscriptionModal: React.FC<Props> = ({ user, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialLeft = getTrialDaysLeft(user.subscription);
  const trialExpired = user.subscription.plan === 'trial' && trialLeft === 0;

  const features = [
    { icon: '📖', text: 'Alle grammatikkleksjoner (A1–B2)' },
    { icon: '💬', text: 'Ubegrenset samtaleøvelse med AI' },
    { icon: '🔤', text: '500+ ord og fraser per kategori' },
    { icon: '🎙️', text: 'Luna Live – sanntids stemmeprat' },
    { icon: '📷', text: 'Kamera-læringsmodus' },
    { icon: '🔥', text: 'Daglig streak og fremgangssporing' },
    { icon: '🏆', text: 'Prestasjoner og XP-system' },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout feilet');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 modal-overlay">
      <div
        className="w-full max-w-sm rounded-3xl p-6 animate-slideUp sm:animate-scaleIn"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🌟</div>
          <h2 className="text-2xl font-black mb-1">
            {trialExpired ? 'Prøveperioden er over' : 'Oppgrader til Premium'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {trialExpired
              ? `Din ${TRIAL_DAYS}-dagers gratis prøveperiode er utløpt`
              : 'Få full tilgang til alle funksjoner'}
          </p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className="p-3 rounded-2xl text-center transition-all"
            style={{
              background: selectedPlan === 'monthly' ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
              border: `1.5px solid ${selectedPlan === 'monthly' ? 'rgba(249,115,22,0.5)' : 'var(--border)'}`,
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Månedlig</p>
            <p className="text-xl font-black text-gradient">€7.99</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/måned</p>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className="p-3 rounded-2xl text-center relative transition-all"
            style={{
              background: selectedPlan === 'yearly' ? 'rgba(249,115,22,0.12)' : 'var(--bg-card)',
              border: `1.5px solid ${selectedPlan === 'yearly' ? 'rgba(249,115,22,0.5)' : 'var(--border)'}`,
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

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span style={{ color: 'var(--text)' }}>{f.text}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-xs text-center mb-3 px-2" style={{ color: 'var(--danger)' }}>
            ⚠️ {error}
          </p>
        )}

        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="btn-primary w-full py-4 text-base mb-3 flex items-center justify-center gap-2"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Kobler til Stripe...
            </>
          ) : (
            selectedPlan === 'yearly'
              ? 'Start nå – €71.91/år'
              : 'Start nå – €7.99/mnd'
          )}
        </button>

        {!trialExpired && (
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Fortsett prøveperioden ({trialLeft} dager igjen)
          </button>
        )}

        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
          Sikker betaling via Stripe · Avslutt når som helst
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
