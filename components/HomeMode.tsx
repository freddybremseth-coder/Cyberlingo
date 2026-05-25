import React, { useEffect, useState } from 'react';
import { UserProfile, AppTab, LearnMode, SourceLang, getXpProgress, getTrialTasksLeft, isSubscriptionActive, LEVEL_THRESHOLDS, TRIAL_FREE_TASKS } from '../types';
import { INITIAL_LESSONS } from '../data/lessons';

interface Props {
  user: UserProfile;
  lang: SourceLang;
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

const HomeMode: React.FC<Props> = ({ user, lang, onNavigate, onNavigateLearn, onNavigateSpeak }) => {
  const [timeStr, setTimeStr] = useState('');

  const labels = ({
    no: {
      morning: 'God morgen', afternoon: 'God ettermiddag', evening: 'God kveld',
      trialLeft: (d: number) => `${d} dag${d !== 1 ? 'er' : ''} igjen av prøveperioden`,
      subscribe: 'Abonner', subscribeHint: 'Abonner for å beholde tilgangen',
      level: 'Nivå', toLevel: 'til nivå',
      dailyGoal: 'Dagens mål', goalDone: '🎉 Fullført!',
      goalLeft: (xp: number) => `${xp} XP til for å nå målet ditt`,
      goalGreat: 'Strålende innsats! Kom tilbake i morgen 💪',
      statLessons: 'Leksjoner', statWords: 'Ord lært', statConvs: 'Samtaler', statOf: 'av',
      continueTitle: 'Fortsett læringen',
      cardDaily: 'Dagens treningsøkt', cardDailySub: '8 korte kort med repetisjon og recall', cardDailyBadge: 'Best start',
      cardLessons: 'Grammatikkleksjoner', cardLessonsSub: (done: number, total: number) => `${done} av ${total} fullført`,
      cardConv: 'Samtaleøvelse', cardConvSub: 'Øv på ekte scenarier med AI-partner', cardConvBadge: 'Anbefalt',
      cardVocab: 'Vokabular', cardVocabSub: (n: number) => `${n} ord lært · 15 kategorier`,
      cardVerbs: 'Verb', cardVerbsSub: 'Konjuger de 25 viktigste verbene',
      cardPhrases: 'Fraser', cardPhrasesSub: '500+ nyttige hverdagsfraser',
      cardCamera: 'Kameralæring', cardCameraSub: 'Pek kameraet og lær spanske ord',
      cardStart: 'Start her',
      tipsTitle: '💡 Tips for rask fremgang',
      tip1: '🎯 Øv 15–20 min daglig – konsistens slår intensitet',
      tip2: '💬 Bruk samtaleøvelse fra dag 1 – det er slik du lærer',
      tip3: '🔊 Lytt til uttalen med høyttaler-knappen på hvert ord',
      tip4: '🔁 Gjenta ord og fraser du sliter med – spaced repetition virker',
      days: 'dager',
    },
    en: {
      morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
      trialLeft: (d: number) => `${d} day${d !== 1 ? 's' : ''} left in your trial`,
      subscribe: 'Subscribe', subscribeHint: 'Subscribe to keep access',
      level: 'Level', toLevel: 'to level',
      dailyGoal: 'Daily goal', goalDone: '🎉 Completed!',
      goalLeft: (xp: number) => `${xp} XP left to reach your goal`,
      goalGreat: 'Great effort! Come back tomorrow 💪',
      statLessons: 'Lessons', statWords: 'Words learned', statConvs: 'Conversations', statOf: 'of',
      continueTitle: 'Continue learning',
      cardDaily: 'Daily practice', cardDailySub: '8 short recall and review cards', cardDailyBadge: 'Best start',
      cardLessons: 'Grammar lessons', cardLessonsSub: (done: number, total: number) => `${done} of ${total} completed`,
      cardConv: 'Conversation practice', cardConvSub: 'Practice real scenarios with an AI partner', cardConvBadge: 'Recommended',
      cardVocab: 'Vocabulary', cardVocabSub: (n: number) => `${n} words learned · 15 categories`,
      cardVerbs: 'Verbs', cardVerbsSub: 'Conjugate the 25 most important verbs',
      cardPhrases: 'Phrases', cardPhrasesSub: '500+ useful everyday phrases',
      cardCamera: 'Camera learning', cardCameraSub: 'Point the camera and learn Spanish words',
      cardStart: 'Start here',
      tipsTitle: '💡 Tips for fast progress',
      tip1: '🎯 Practice 15–20 min daily – consistency beats intensity',
      tip2: '💬 Use conversation practice from day 1 – that\'s how you learn',
      tip3: '🔊 Listen to pronunciation with the speaker button on each word',
      tip4: '🔁 Repeat words and phrases you struggle with – spaced repetition works',
      days: 'days',
    },
    de: {
      morning: 'Guten Morgen', afternoon: 'Guten Nachmittag', evening: 'Guten Abend',
      trialLeft: (d: number) => `Noch ${d} Tag${d !== 1 ? 'e' : ''} in der Testphase`,
      subscribe: 'Abonnieren', subscribeHint: 'Abonnieren, um den Zugang zu behalten',
      level: 'Level', toLevel: 'bis Level',
      dailyGoal: 'Tagesziel', goalDone: '🎉 Abgeschlossen!',
      goalLeft: (xp: number) => `Noch ${xp} XP bis zum Ziel`,
      goalGreat: 'Großartige Leistung! Komm morgen wieder 💪',
      statLessons: 'Lektionen', statWords: 'Wörter gelernt', statConvs: 'Gespräche', statOf: 'von',
      continueTitle: 'Weiterlernen',
      cardDaily: 'Tagestraining', cardDailySub: '8 kurze Karten mit aktivem Abruf', cardDailyBadge: 'Bester Start',
      cardLessons: 'Grammatiklektionen', cardLessonsSub: (done: number, total: number) => `${done} von ${total} abgeschlossen`,
      cardConv: 'Gesprächsübung', cardConvSub: 'Übe echte Szenarien mit einem KI-Partner', cardConvBadge: 'Empfohlen',
      cardVocab: 'Vokabular', cardVocabSub: (n: number) => `${n} Wörter gelernt · 15 Kategorien`,
      cardVerbs: 'Verben', cardVerbsSub: 'Konjugiere die 25 wichtigsten Verben',
      cardPhrases: 'Phrasen', cardPhrasesSub: '500+ nützliche Alltagsphrasen',
      cardCamera: 'Kameralernen', cardCameraSub: 'Richte die Kamera aus und lerne spanische Wörter',
      cardStart: 'Hier starten',
      tipsTitle: '💡 Tipps für schnellen Fortschritt',
      tip1: '🎯 Übe 15–20 Min täglich – Beständigkeit schlägt Intensität',
      tip2: '💬 Nutze Gesprächsübungen ab Tag 1 – so lernst du',
      tip3: '🔊 Höre die Aussprache mit dem Lautsprecher-Button bei jedem Wort',
      tip4: '🔁 Wiederhole Wörter und Phrasen, mit denen du Schwierigkeiten hast',
      days: 'Tage',
    },
    ru: {
      morning: 'Доброе утро', afternoon: 'Добрый день', evening: 'Добрый вечер',
      trialLeft: (d: number) => `Осталось ${d} ${d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'} пробного периода`,
      subscribe: 'Подписаться', subscribeHint: 'Подпишитесь, чтобы сохранить доступ',
      level: 'Уровень', toLevel: 'до уровня',
      dailyGoal: 'Дневная цель', goalDone: '🎉 Выполнено!',
      goalLeft: (xp: number) => `Ещё ${xp} XP до цели`,
      goalGreat: 'Отличная работа! Возвращайтесь завтра 💪',
      statLessons: 'Уроки', statWords: 'Слов изучено', statConvs: 'Разговоры', statOf: 'из',
      continueTitle: 'Продолжить обучение',
      cardDaily: 'Ежедневная тренировка', cardDailySub: '8 коротких карточек для повторения', cardDailyBadge: 'Лучший старт',
      cardLessons: 'Уроки грамматики', cardLessonsSub: (done: number, total: number) => `${done} из ${total} пройдено`,
      cardConv: 'Разговорная практика', cardConvSub: 'Практикуй реальные сценарии с AI-партнёром', cardConvBadge: 'Рекомендуем',
      cardVocab: 'Словарь', cardVocabSub: (n: number) => `${n} слов изучено · 15 категорий`,
      cardVerbs: 'Глаголы', cardVerbsSub: 'Спряжение 25 важнейших глаголов',
      cardPhrases: 'Фразы', cardPhrasesSub: '500+ полезных фраз',
      cardCamera: 'Обучение с камерой', cardCameraSub: 'Наведи камеру и учи испанские слова',
      cardStart: 'Начать здесь',
      tipsTitle: '💡 Советы для быстрого прогресса',
      tip1: '🎯 Занимайся 15–20 мин ежедневно – постоянство важнее интенсивности',
      tip2: '💬 Используй разговорную практику с первого дня – так учатся языки',
      tip3: '🔊 Слушай произношение с кнопкой громкоговорителя на каждом слове',
      tip4: '🔁 Повторяй сложные слова и фразы – интервальное повторение работает',
      days: 'дней',
    },
  } as Record<string, any>)[lang] ?? ({} as any);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeStr(labels.morning);
    else if (h < 17) setTimeStr(labels.afternoon);
    else setTimeStr(labels.evening);
  }, [lang]);

  const xpProgress = getXpProgress(user.xp);
  const lessonsProgress = INITIAL_LESSONS.length > 0
    ? Math.round((user.completedLessonIds.length / INITIAL_LESSONS.length) * 100)
    : 0;
  const vocabProgress = Math.round((user.masteredVocab.length / 500) * 100);
  const subActive = isSubscriptionActive(user.subscription, user.email);
  const tasksLeft = user.subscription.plan === 'trial' ? getTrialTasksLeft(user) : null;

  const today = new Date().toISOString().slice(0, 10);
  const goalMet = user.lastGoalDate === today && user.todayXp >= user.dailyGoalXp;
  const goalPct = Math.min(100, Math.round(((user.todayXp || 0) / user.dailyGoalXp) * 100));

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn">

      {/* ── Trial banner ── */}
      {tasksLeft !== null && tasksLeft <= 2 && (
        <div
          className="p-3 rounded-2xl flex items-center gap-3"
          style={{
            background: tasksLeft === 0 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
            border: `1px solid ${tasksLeft === 0 ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.25)'}`,
          }}
        >
          <span className="text-xl">{tasksLeft === 0 ? '⚠️' : '⏳'}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: tasksLeft === 0 ? 'var(--danger)' : 'var(--warning)' }}>
              {tasksLeft === 0
                ? 'Du har brukt alle gratis oppgaver'
                : `${tasksLeft} av ${TRIAL_FREE_TASKS} gratis oppgaver igjen`}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{labels.subscribeHint}</p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="ml-auto badge badge-primary text-xs"
          >
            {labels.subscribe}
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
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{labels.days}</p>
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
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{labels.level}</p>
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
          <span>⚡ {user.xp} XP</span>
          <span>{xpProgress.current}/{xpProgress.needed} {labels.toLevel} {user.level + 1}</span>
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
          <p className="font-bold text-sm">{labels.dailyGoal}</p>
          <span className={`badge text-xs ${goalMet ? 'badge-success' : 'badge-primary'}`}>
            {goalMet ? labels.goalDone : `${user.todayXp || 0} / ${user.dailyGoalXp} XP`}
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${goalMet ? 'progress-fill-success' : ''}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {goalMet ? labels.goalGreat : labels.goalLeft(user.dailyGoalXp - (user.todayXp || 0))}
        </p>
      </div>

      {/* ── Progress stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: labels.statLessons, value: user.completedLessonIds.length, total: INITIAL_LESSONS.length, pct: lessonsProgress, color: 'var(--primary)', icon: '📖' },
          { label: labels.statWords, value: user.masteredVocab.length, total: 500, pct: vocabProgress, color: 'var(--secondary)', icon: '🔤' },
          { label: labels.statConvs, value: user.conversationsCompleted || 0, total: null, pct: Math.min(100, ((user.conversationsCompleted || 0) / 10) * 100), color: 'var(--accent)', icon: '💬' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-2xl text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xl mb-1">{stat.icon}</p>
            <p className="text-lg font-black">{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.total ? `${labels.statOf} ${stat.total}` : stat.label}
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
        <h2 className="font-bold text-base mb-3">{labels.continueTitle}</h2>
        <div className="space-y-3">
          <ActionCard
            icon="🎯"
            title={labels.cardDaily}
            subtitle={labels.cardDailySub}
            color="var(--success)"
            onClick={() => onNavigateLearn('daily')}
            badge={labels.cardDailyBadge}
          />
          <ActionCard
            icon="📖"
            title={labels.cardLessons}
            subtitle={labels.cardLessonsSub(user.completedLessonIds.length, INITIAL_LESSONS.length)}
            color="var(--primary)"
            onClick={() => onNavigateLearn('lessons')}
            badge={user.completedLessonIds.length === 0 ? labels.cardStart : undefined}
          />
          <ActionCard
            icon="💬"
            title={labels.cardConv}
            subtitle={labels.cardConvSub}
            color="var(--accent)"
            onClick={onNavigateSpeak}
            badge={labels.cardConvBadge}
          />
          <ActionCard
            icon="🔤"
            title={labels.cardVocab}
            subtitle={labels.cardVocabSub(user.masteredVocab.length)}
            color="var(--secondary)"
            onClick={() => onNavigateLearn('vocab')}
          />
          <ActionCard
            icon="⚡"
            title={labels.cardVerbs}
            subtitle={labels.cardVerbsSub}
            color="var(--warning)"
            onClick={() => onNavigateLearn('verbs')}
          />
          <ActionCard
            icon="🗣️"
            title={labels.cardPhrases}
            subtitle={labels.cardPhrasesSub}
            color="var(--success)"
            onClick={() => onNavigateLearn('phrases')}
          />
          <ActionCard
            icon="📷"
            title={labels.cardCamera}
            subtitle={labels.cardCameraSub}
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
        <p className="font-bold text-sm mb-2" style={{ color: 'var(--accent)' }}>{labels.tipsTitle}</p>
        <ul className="text-xs space-y-1.5" style={{ color: 'var(--text-muted)' }}>
          <li>{labels.tip1}</li>
          <li>{labels.tip2}</li>
          <li>{labels.tip3}</li>
          <li>{labels.tip4}</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeMode;
