import React from 'react';
import { UserProfile, SUBSCRIPTION_PRICE_NOK, TRIAL_DAYS, getTrialDaysLeft } from '../types';

interface Props {
  user: UserProfile;
  onSubscribe: () => void;
  onClose: () => void;
}

const SubscriptionModal: React.FC<Props> = ({ user, onSubscribe, onClose }) => {
  const trialLeft = getTrialDaysLeft(user.subscription);
  const trialExpired = user.subscription.plan === 'trial' && trialLeft === 0;

  const features = [
    { icon: '📖', text: 'Alle grammatikkleksjoner (A1–B2)' },
    { icon: '💬', text: 'Ubegrenset samtaleøvelse med AI' },
    { icon: '🔤', text: '500+ ord og fraser per kategori' },
    { icon: '🎙️', text: 'Luna Live – toveiskommunikasjon med AI' },
    { icon: '📷', text: 'Kamera-læringsmodus' },
    { icon: '🔥', text: 'Daglig streak og fremgangssporing' },
    { icon: '🏆', text: 'Prestasjoner og XP-system' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 modal-overlay">
      <div
        className="w-full max-w-sm rounded-3xl p-6 animate-slideUp sm:animate-scaleIn"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
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

        {/* Price card */}
        <div
          className="p-4 rounded-2xl mb-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(56,189,248,0.08))',
            border: '1px solid rgba(249,115,22,0.25)',
          }}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-gradient">{SUBSCRIPTION_PRICE_NOK}</span>
            <span className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>kr</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/måned</span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ingen binding • Avslutt når som helst
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span>{f.icon}</span>
              <span style={{ color: 'var(--text)' }}>{f.text}</span>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <button
          onClick={onSubscribe}
          className="btn-primary w-full py-4 text-base mb-3"
        >
          Abonner nå – {SUBSCRIPTION_PRICE_NOK} kr/mnd
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
          Dette er en demo – betalingsinfrastruktur legges til i produksjon
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
