import React from 'react';
import { UserProfile, ACHIEVEMENTS, Achievement, SourceLang, getXpProgress } from '../types';
import { INITIAL_LESSONS } from '../data/lessons';

interface Props {
  user: UserProfile;
  totalLessons: number;
  lang?: SourceLang;
}

// ─── Stat card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: string; value: string | number; label: string; color: string }> = ({
  icon, value, label, color,
}) => (
  <div
    className="p-4 rounded-2xl text-center"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <p className="text-2xl font-black" style={{ color }}>{value}</p>
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </div>
);

// ─── Achievement badge ──────────────────────────────────────────────────────
const AchievementBadge: React.FC<{
  achievement: Achievement;
  unlocked: boolean;
}> = ({ achievement, unlocked }) => (
  <div
    className={`p-3 rounded-2xl flex items-center gap-3 ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
    style={{
      background: unlocked ? 'rgba(251,191,36,0.07)' : 'var(--bg-card)',
      border: `1px solid ${unlocked ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
      style={{
        background: unlocked ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
      }}
    >
      {achievement.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm" style={{ color: unlocked ? 'var(--text)' : 'var(--text-muted)' }}>
        {achievement.nameNo}
      </p>
      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{achievement.descNo}</p>
    </div>
    {unlocked && (
      <div>
        <span className="badge badge-primary text-xs">+{achievement.xpReward} XP</span>
      </div>
    )}
    {!unlocked && (
      <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )}
  </div>
);

// ─── Learning path step ─────────────────────────────────────────────────────
const PathStep: React.FC<{
  label: string;
  desc: string;
  done: boolean;
  active: boolean;
  icon: string;
  hereLabel?: string;
}> = ({ label, desc, done, active, icon, hereLabel = '← You are here' }) => (
  <div className="flex items-start gap-4">
    {/* Line + circle */}
    <div className="flex flex-col items-center gap-1" style={{ width: 32 }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{
          background: done
            ? 'var(--success)'
            : active
            ? 'var(--primary)'
            : 'var(--bg-card)',
          border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)'}`,
          boxShadow: active ? '0 0 12px var(--primary-glow)' : 'none',
        }}
      >
        {done ? '✓' : icon}
      </div>
    </div>
    <div className="flex-1 pb-6">
      <p
        className="font-bold text-sm"
        style={{ color: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      {active && (
        <span
          className="inline-block mt-2 badge badge-primary text-xs"
        >
          {hereLabel}
        </span>
      )}
    </div>
  </div>
);

const ProgressView: React.FC<Props> = ({ user, lang = 'no' }) => {
  const labels = ({
    no: {
      title: 'Din Fremgang', sub: 'Se alt du har oppnådd på veien til spansk flyt',
      totalXp: 'Totalt XP', currentLevel: 'Nåværende nivå', streak: 'Dager på rad', achievements: 'Prestasjoner',
      toNextLevel: 'til neste nivå', pathTitle: 'Læreveien din',
      path: [
        { label: 'A1 – Nybegynner', desc: 'Grunnleggende grammatikk, enkle setninger og hilsener' },
        { label: 'A2 – Grunnleggende', desc: 'Daglige rutiner, enkle beskrivelser og spørsmål' },
        { label: 'B1 – Mellomnivå', desc: 'Konjunktiv, fortidsformer og mer kompleks grammatikk' },
        { label: 'B2 – Videregående', desc: 'Flytende samtaler, nyanser og idiomer' },
        { label: 'C1 – Avansert', desc: 'Nær innfødt flyt, akademisk og profesjonell bruk' },
      ],
      hereLabel: '← Du er her',
      detailTitle: 'Detaljert statistikk',
      statLessons: 'Leksjoner fullført', statWords: 'Ord mestret', statPhrases: 'Fraser mestret', statConvs: 'Samtaler fullført',
      achievementsTitle: 'Prestasjoner', achievementsUnlocked: 'låst opp',
    },
    en: {
      title: 'Your Progress', sub: 'See everything you\'ve achieved on the way to Spanish fluency',
      totalXp: 'Total XP', currentLevel: 'Current level', streak: 'Days in a row', achievements: 'Achievements',
      toNextLevel: 'to next level', pathTitle: 'Your learning path',
      path: [
        { label: 'A1 – Beginner', desc: 'Basic grammar, simple sentences and greetings' },
        { label: 'A2 – Elementary', desc: 'Daily routines, simple descriptions and questions' },
        { label: 'B1 – Intermediate', desc: 'Subjunctive, past tenses and more complex grammar' },
        { label: 'B2 – Upper intermediate', desc: 'Fluent conversations, nuances and idioms' },
        { label: 'C1 – Advanced', desc: 'Near-native fluency, academic and professional use' },
      ],
      hereLabel: '← You are here',
      detailTitle: 'Detailed statistics',
      statLessons: 'Lessons completed', statWords: 'Words mastered', statPhrases: 'Phrases mastered', statConvs: 'Conversations completed',
      achievementsTitle: 'Achievements', achievementsUnlocked: 'unlocked',
    },
    de: {
      title: 'Dein Fortschritt', sub: 'Sieh alles, was du auf dem Weg zur spanischen Flüssigkeit erreicht hast',
      totalXp: 'Gesamt XP', currentLevel: 'Aktuelles Level', streak: 'Tage in Folge', achievements: 'Errungenschaften',
      toNextLevel: 'bis zum nächsten Level', pathTitle: 'Dein Lernpfad',
      path: [
        { label: 'A1 – Anfänger', desc: 'Grundlegende Grammatik, einfache Sätze und Begrüßungen' },
        { label: 'A2 – Grundstufe', desc: 'Tagesroutinen, einfache Beschreibungen und Fragen' },
        { label: 'B1 – Mittelstufe', desc: 'Konjunktiv, Vergangenheitsformen und komplexere Grammatik' },
        { label: 'B2 – Fortgeschritten', desc: 'Fließende Gespräche, Nuancen und Redewendungen' },
        { label: 'C1 – Experte', desc: 'Muttersprachliches Niveau, akademischer und professioneller Einsatz' },
      ],
      hereLabel: '← Du bist hier',
      detailTitle: 'Detaillierte Statistiken',
      statLessons: 'Lektionen abgeschlossen', statWords: 'Wörter gemeistert', statPhrases: 'Phrasen gemeistert', statConvs: 'Gespräche abgeschlossen',
      achievementsTitle: 'Errungenschaften', achievementsUnlocked: 'freigeschaltet',
    },
    ru: {
      title: 'Твой прогресс', sub: 'Посмотри на всё, чего ты достиг на пути к испанской беглости',
      totalXp: 'Всего XP', currentLevel: 'Текущий уровень', streak: 'Дней подряд', achievements: 'Достижения',
      toNextLevel: 'до следующего уровня', pathTitle: 'Твой путь обучения',
      path: [
        { label: 'A1 – Начинающий', desc: 'Базовая грамматика, простые предложения и приветствия' },
        { label: 'A2 – Элементарный', desc: 'Ежедневные рутины, простые описания и вопросы' },
        { label: 'B1 – Средний', desc: 'Сослагательное наклонение, прошедшее время и сложная грамматика' },
        { label: 'B2 – Выше среднего', desc: 'Свободные беседы, нюансы и идиомы' },
        { label: 'C1 – Продвинутый', desc: 'Уровень носителя, академическое и профессиональное использование' },
      ],
      hereLabel: '← Вы здесь',
      detailTitle: 'Детальная статистика',
      statLessons: 'Уроков пройдено', statWords: 'Слов освоено', statPhrases: 'Фраз освоено', statConvs: 'Разговоров завершено',
      achievementsTitle: 'Достижения', achievementsUnlocked: 'разблокировано',
    },
  } as Record<string, any>)[lang] ?? {} as any;
  const xp = getXpProgress(user.xp);
  const beginnerDone = INITIAL_LESSONS.filter(l => l.level === 'Nybegynner').every(l => user.completedLessonIds.includes(l.id));
  const intermediateDone = INITIAL_LESSONS.filter(l => l.level === 'Mellomnivå').every(l => user.completedLessonIds.includes(l.id));
  const expertDone = INITIAL_LESSONS.filter(l => l.level === 'Ekspert').every(l => user.completedLessonIds.includes(l.id));

  const unlockedAchs = new Set(user.achievements || []);
  const totalAchs = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = unlockedAchs.size;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black mb-1">{labels.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {labels.sub}
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="⚡" value={user.xp} label={labels.totalXp} color="var(--primary)" />
        <StatCard icon="🏆" value={`${labels.currentLevel} ${user.level}`} label={labels.currentLevel} color="var(--secondary)" />
        <StatCard icon="🔥" value={user.streak} label={labels.streak} color="var(--warning)" />
        <StatCard icon="🏅" value={`${unlockedCount}/${totalAchs}`} label={labels.achievements} color="var(--accent)" />
      </div>

      {/* XP progress to next level */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-sm">{labels.currentLevel}: {user.level} → {user.level + 1}</p>
          <span className="badge badge-primary text-xs">{xp.current}/{xp.needed} XP</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${xp.pct}%` }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {xp.needed - xp.current} XP {labels.toNextLevel}
        </p>
      </div>

      {/* Learning path */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {labels.pathTitle}
        </h3>
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {(labels.path as { label: string; desc: string }[]).map((p, i) => {
            const doneArr = [beginnerDone, false, intermediateDone, expertDone, false];
            const activeArr = [!beginnerDone, beginnerDone && !intermediateDone, intermediateDone && !expertDone, expertDone, false];
            const icons = ['🌱', '🌿', '🌳', '🌟', '🏆'];
            return <PathStep key={i} label={p.label} desc={p.desc} done={doneArr[i]} active={activeArr[i]} icon={icons[i]} hereLabel={labels.hereLabel} />;
          })}
        </div>
      </div>

      {/* Detailed stats */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="font-bold text-sm mb-4">{labels.detailTitle}</h3>
        <div className="space-y-3">
          {[
            { label: labels.statLessons, value: user.completedLessonIds.length, total: totalLessons, color: 'var(--primary)' },
            { label: labels.statWords, value: user.masteredVocab.length, total: 500, color: 'var(--secondary)' },
            { label: labels.statPhrases, value: user.masteredPhrases?.length || 0, total: 500, color: 'var(--accent)' },
            { label: labels.statConvs, value: user.conversationsCompleted || 0, total: 50, color: 'var(--success)' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                <span className="font-semibold">{stat.value} / {stat.total}</span>
              </div>
              <div className="progress-track" style={{ height: 6 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((stat.value / stat.total) * 100))}%`,
                    background: stat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {labels.achievementsTitle}
          </h3>
          <span className="badge badge-primary text-xs">{unlockedCount} {labels.achievementsUnlocked}</span>
        </div>
        <div className="space-y-2">
          {Object.values(ACHIEVEMENTS).map(ach => (
            <AchievementBadge
              key={ach.id}
              achievement={ach}
              unlocked={unlockedAchs.has(ach.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// We need totalLessons as prop but let's pull from INITIAL_LESSONS length
const ProgressViewWrapper: React.FC<Props> = (props) => (
  <ProgressView {...props} totalLessons={props.totalLessons ?? INITIAL_LESSONS.length} />
);

export default ProgressViewWrapper;
