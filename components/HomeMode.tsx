import React, { useEffect, useState } from 'react';
import { UserProfile, AppTab, LearnMode, getXpProgress, getTrialDaysLeft, isSubscriptionActive, LEVEL_THRESHOLDS } from '../types';
import { INITIAL_LESSONS } from '../data/lessons';

interface Props {
  user: UserProfile;
  onNavigate: (tab: AppTab) => void;
  onNavigateLearn: (mode: LearnMode) => void;
  onNavigateSpeak: () => void;
}

// ─── Circular progress ring ────────────────────────────────────────────────
const Ring: React.FC<{ pct: number; size?: number; stroke?: number; color?: string }> = ({
  pct, size = 80, stroke = 7, color = 'var(--primary)',
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

// ─── Quick action card ─────────────────────────────────────────────────────
const ActionCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
  badge?: string;
}> = ({ icon, title, subtitle, color, onClick, badge }) => (
  <button
    onClick={onClick}
    className="card p-4 text-left w-full flex items-center gap-3 active:scale-95"
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
      style={{ background: `${color}18` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
        {badge && (
          <span
            className="badge text-xs py-0.5"
            style={{ background: `${color}20`, color }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
    <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const HomeMode: React.FC<Props> = ({ user, onNavigate, onNavigateLearn, onNavigateSpeak }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeStr('God morgen');
    else if (h < 17) setTimeStr('God ettermiddag');
    else setTimeStr('God kveld');
  }, []);

  const xpProgress = getXpProgress(user.xp);
  const lessonsProgress = INITIAL_LESSONS.length > 0
    ? Math.round((user.completedLessonIds.length / INITIAL_LESSONS.length) * 100)
    : 0;
  const vocabProgress = Math.round((user.masteredVocab.length / 500) * 100);
  const subActive = isSubscriptionActive(user.subscription);
  const trialLeft = user.subscription.plan === 'trial' ? getTrialDaysLeft(user.subscription) : null;

  const today = new Date().toISOString().slice(0, 10);
  const goalMet = user.lastGoalDate === today && user.todayXp >= user.dailyGoalXp;
  const goalPct = Math.min(100, Math.round(((user.todayXp || 0) / user.dailyGoalXp) * 100));

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn">

      {/* ── Trial banner ── */}
      {trialLeft !== null && trialLeft <= 3 && trialLeft > 0 && (
        <div
          className="p-3 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
              {trialLeft} dag{trialLeft !== 1 ? 'er' : ''} igjen av prøveperioden
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Abonner for å beholde tilgangen</p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="ml-auto badge badge-primary text-xs"
          >
            Abonner
          </button>
        </div>
      )}

      {/* ── Welcome + streak ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{timeStr},</p>
          <h1 className="text-2xl font-black">{user.username}! 👋</h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <span className="text-2xl animate-flame">🔥</span>
          <div>
            <p className="text-xl font-black leading-none" style={{ color: 'var(--warning)' }}>{user.streak}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>dager</p>
          </div>
        </div>
      </div>

      {/* ── Level + XP ── */}
      <div
        className="p-4 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(56,189,248,0.04) 100%)',
          border: '1px solid rgba(249,115,22,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nivå</p>
            <p className="text-3xl font-black text-gradient">{user.level}</p>
          </div>
          <div className="relative">
            <Ring pct={xpProgress.pct} size={64} stroke={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{xpProgress.pct}%</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>⚡ {user.xp} XP totalt</span>
          <span>{xpProgress.current}/{xpProgress.needed} til nivå {user.level + 1}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${xpProgress.pct}%` }} />
        </div>
      </div>

      {/* ── Daily goal ── */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm">Dagens mål</p>
          <span className={`badge text-xs ${goalMet ? 'badge-success' : 'badge-primary'}`}>
            {goalMet ? '🎉 Fullført!' : `${user.todayXp || 0} / ${user.dailyGoalXp} XP`}
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${goalMet ? 'progress-fill-success' : ''}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {goalMet ? 'Strålende innsats! Kom tilbake i morgen 💪' : `${user.dailyGoalXp - (user.todayXp || 0)} XP til for å nå målet ditt`}
        </p>
      </div>

      {/* ── Progress stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Leksjoner', value: user.completedLessonIds.length, total: INITIAL_LESSONS.length, pct: lessonsProgress, color: 'var(--primary)', icon: '📖' },
          { label: 'Ord lært', value: user.masteredVocab.length, total: 500, pct: vocabProgress, color: 'var(--secondary)', icon: '🔤' },
          { label: 'Samtaler', value: user.conversationsCompleted || 0, total: null, pct: Math.min(100, ((user.conversationsCompleted || 0) / 10) * 100), color: 'var(--accent)', icon: '💬' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-2xl text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xl mb-1">{stat.icon}</p>
            <p className="text-lg font-black">{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.total ? `av ${stat.total}` : stat.label}
            </p>
            {stat.total && (
              <div className="progress-track mt-2" style={{ height: 4 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${stat.pct}%`, background: stat.color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="font-bold text-base mb-3">Fortsett læringen</h2>
        <div className="space-y-3">
          <ActionCard
            icon="📖"
            title="Grammatikkleksjoner"
            subtitle={`${user.completedLessonIds.length} av ${INITIAL_LESSONS.length} fullført`}
            color="var(--primary)"
            onClick={() => onNavigateLearn('lessons')}
            badge={user.completedLessonIds.length === 0 ? 'Start her' : undefined}
          />
          <ActionCard
            icon="💬"
            title="Samtaleøvelse"
            subtitle="Øv på ekte scenarier med AI-partner"
            color="var(--accent)"
            onClick={onNavigateSpeak}
            badge="Anbefalt"
          />
          <ActionCard
            icon="🔤"
            title="Vokabular"
            subtitle={`${user.masteredVocab.length} ord lært · 15 kategorier`}
            color="var(--secondary)"
            onClick={() => onNavigateLearn('vocab')}
          />
          <ActionCard
            icon="⚡"
            title="Verb"
            subtitle="Konjuger de 25 viktigste verbene"
            color="var(--warning)"
            onClick={() => onNavigateLearn('verbs')}
          />
          <ActionCard
            icon="🗣️"
            title="Fraser"
            subtitle="500+ nyttige hverdagsfraser"
            color="var(--success)"
            onClick={() => onNavigateLearn('phrases')}
          />
          <ActionCard
            icon="📷"
            title="Kameralæring"
            subtitle="Pek kameraet og lær spanske ord"
            color="var(--danger)"
            onClick={() => onNavigateLearn('vision')}
          />
        </div>
      </div>

      {/* ── Learning tips ── */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}
      >
        <p className="font-bold text-sm mb-2" style={{ color: 'var(--accent)' }}>💡 Tips for rask fremgang</p>
        <ul className="text-xs space-y-1.5" style={{ color: 'var(--text-muted)' }}>
          <li>🎯 Øv <strong style={{ color: 'var(--text)' }}>15–20 min daglig</strong> – konsistens slår intensitet</li>
          <li>💬 Bruk <strong style={{ color: 'var(--text)' }}>samtaleøvelse</strong> fra dag 1 – det er slik du lærer</li>
          <li>🔊 Lytt til uttalen med <strong style={{ color: 'var(--text)' }}>høyttaler-knappen</strong> på hvert ord</li>
          <li>🔁 Gjenta ord og fraser du sliter med – spaced repetition virker</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeMode;
