import React, { useMemo, useState } from 'react';
import { PracticeDeckItem, PRACTICE_DECK } from '../data/practiceDeck';
import { SourceLang, UserProfile } from '../types';
import TTSButton from './TTSButton';

interface ReviewEntry {
  box: number;
  due: string;
  correct: number;
  attempts: number;
  lastSeen: string;
}

interface Props {
  user: UserProfile;
  lang: SourceLang;
  onComplete: (earnedXp: number, masteredWords: string[], masteredPhrases: string[]) => void;
}

const INTERVALS = [1, 2, 4, 7, 14, 30];
const SESSION_SIZE = 8;

const todayString = () => new Date().toISOString().slice(0, 10);

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isCorrectAnswer = (input: string, item: PracticeDeckItem) => {
  const userAnswer = normalize(input);
  const accepted = [item.answer, ...(item.accepted ?? [])].map(normalize);
  return accepted.some(answer =>
    userAnswer === answer ||
    (item.kind === 'phrase' && userAnswer.length > 8 && answer.includes(userAnswer))
  );
};

const storageKey = (username: string) => `cyberlingo_review_${username}`;

const loadReview = (username: string): Record<string, ReviewEntry> => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(username)) || '{}');
  } catch {
    return {};
  }
};

const saveReview = (username: string, review: Record<string, ReviewEntry>) => {
  localStorage.setItem(storageKey(username), JSON.stringify(review));
};

const pickSession = (review: Record<string, ReviewEntry>, xp: number) => {
  const today = todayString();
  const maxLevel = xp >= 700 ? 'B1' : xp >= 220 ? 'A2' : 'A1';
  const allowed = PRACTICE_DECK.filter(item => {
    if (maxLevel === 'B1') return true;
    if (maxLevel === 'A2') return item.level !== 'B1';
    return item.level === 'A1';
  });

  const due = allowed.filter(item => review[item.id]?.due <= today);
  const unseen = allowed.filter(item => !review[item.id]);
  const warmups = allowed.filter(item => review[item.id]);

  const byNeed = (a: PracticeDeckItem, b: PracticeDeckItem) => {
    const ra = review[a.id];
    const rb = review[b.id];
    return (ra?.box ?? 0) - (rb?.box ?? 0);
  };

  const seen = new Set<string>();
  return [...due.sort(byNeed), ...unseen, ...warmups.sort(byNeed)]
    .filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, SESSION_SIZE);
};

const labels = {
  no: {
    title: 'Dagens treningsøkt',
    sub: 'Hent ordene fram fra hukommelsen før du ser svaret.',
    prompt: 'Skriv på spansk',
    check: 'Sjekk',
    next: 'Neste',
    finish: 'Fullfør økt',
    correct: 'Riktig',
    wrong: 'Ikke helt',
    answer: 'Svar',
    example: 'Eksempel',
    note: 'Mini-regel',
    progress: 'kort',
    doneTitle: 'Økt fullført',
    doneSub: 'Repetisjonen er planlagt videre automatisk.',
    save: 'Lagre fremgang',
    saved: 'Lagret',
    xp: 'XP opptjent',
    empty: 'Alt er repetert for nå. Kom tilbake senere for nye kort.',
  },
  en: {
    title: 'Daily practice',
    sub: 'Recall the Spanish before you reveal the answer.',
    prompt: 'Write in Spanish',
    check: 'Check',
    next: 'Next',
    finish: 'Finish session',
    correct: 'Correct',
    wrong: 'Almost',
    answer: 'Answer',
    example: 'Example',
    note: 'Mini rule',
    progress: 'cards',
    doneTitle: 'Session complete',
    doneSub: 'Your review schedule has been updated.',
    save: 'Save progress',
    saved: 'Saved',
    xp: 'XP earned',
    empty: 'Everything is reviewed for now. Come back later for new cards.',
  },
  de: {
    title: 'Tagestraining',
    sub: 'Rufe Spanisch aktiv ab, bevor du die Antwort siehst.',
    prompt: 'Auf Spanisch schreiben',
    check: 'Prüfen',
    next: 'Weiter',
    finish: 'Training beenden',
    correct: 'Richtig',
    wrong: 'Fast',
    answer: 'Antwort',
    example: 'Beispiel',
    note: 'Mini-Regel',
    progress: 'Karten',
    doneTitle: 'Training abgeschlossen',
    doneSub: 'Dein Wiederholungsplan wurde aktualisiert.',
    save: 'Fortschritt speichern',
    saved: 'Gespeichert',
    xp: 'XP verdient',
    empty: 'Alles ist vorerst wiederholt. Komm später zurück.',
  },
  ru: {
    title: 'Ежедневная тренировка',
    sub: 'Вспомните испанский ответ до подсказки.',
    prompt: 'Напишите по-испански',
    check: 'Проверить',
    next: 'Далее',
    finish: 'Завершить',
    correct: 'Верно',
    wrong: 'Почти',
    answer: 'Ответ',
    example: 'Пример',
    note: 'Мини-правило',
    progress: 'карточек',
    doneTitle: 'Тренировка завершена',
    doneSub: 'Повторение запланировано автоматически.',
    save: 'Сохранить прогресс',
    saved: 'Сохранено',
    xp: 'XP получено',
    empty: 'Пока все повторено. Вернитесь позже.',
  },
} as const;

const kindColor: Record<PracticeDeckItem['kind'], string> = {
  word: 'var(--secondary)',
  phrase: 'var(--primary)',
  verb: 'var(--warning)',
  grammar: 'var(--accent)',
};

const DailyPracticeMode: React.FC<Props> = ({ user, lang, onComplete }) => {
  const [review, setReview] = useState<Record<string, ReviewEntry>>(() => loadReview(user.username));
  const [queue] = useState<PracticeDeckItem[]>(() => pickSession(loadReview(user.username), user.xp));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; item: PracticeDeckItem } | null>(null);
  const [results, setResults] = useState<Array<{ id: string; correct: boolean; kind: PracticeDeckItem['kind']; answer: string }>>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = labels[lang] ?? labels.no;
  const item = queue[index];

  const earnedXp = useMemo(() => {
    const correct = results.filter(r => r.correct).length;
    return queue.length > 0 ? 10 + correct * 5 : 0;
  }, [queue.length, results]);

  const updateReview = (current: PracticeDeckItem, correct: boolean) => {
    const previous = review[current.id] ?? { box: 0, due: todayString(), correct: 0, attempts: 0, lastSeen: todayString() };
    const nextBox = correct ? Math.min(previous.box + 1, INTERVALS.length) : Math.max(1, previous.box - 1);
    const interval = correct ? INTERVALS[nextBox - 1] : 1;
    const nextReview = {
      ...review,
      [current.id]: {
        box: nextBox,
        due: addDays(interval),
        correct: previous.correct + (correct ? 1 : 0),
        attempts: previous.attempts + 1,
        lastSeen: todayString(),
      },
    };
    setReview(nextReview);
    saveReview(user.username, nextReview);
  };

  const handleCheck = () => {
    if (!item || !input.trim() || feedback) return;
    const correct = isCorrectAnswer(input, item);
    setFeedback({ correct, item });
    setResults(prev => [...prev, { id: item.id, correct, kind: item.kind, answer: item.answer }]);
    updateReview(item, correct);
  };

  const handleNext = () => {
    if (index >= queue.length - 1) {
      setSessionDone(true);
      return;
    }
    setIndex(i => i + 1);
    setInput('');
    setFeedback(null);
  };

  const handleSave = () => {
    if (saved) return;
    const masteredWords = results
      .filter(r => r.correct && (r.kind === 'word' || r.kind === 'grammar' || r.kind === 'verb'))
      .map(r => r.answer);
    const masteredPhrases = results
      .filter(r => r.correct && r.kind === 'phrase')
      .map(r => r.answer);
    onComplete(earnedXp, masteredWords, masteredPhrases);
    setSaved(true);
  };

  if (queue.length === 0) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-xl font-black mb-1">{t.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.empty}</p>
      </div>
    );
  }

  if (sessionDone) {
    const correct = results.filter(r => r.correct).length;
    return (
      <div className="max-w-xl mx-auto space-y-5 animate-fadeIn">
        <div className="text-center p-6 rounded-3xl" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-black mb-1">{t.doneTitle}</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{t.doneSub}</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-black" style={{ color: 'var(--success)' }}>{correct}/{queue.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.correct}</p>
            </div>
            <div className="p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>+{earnedXp}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.xp}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saved} className="btn-primary w-full py-3">
            {saved ? `✓ ${t.saved}` : t.save}
          </button>
        </div>
      </div>
    );
  }

  const currentColor = kindColor[item.kind];
  const progressPct = Math.round(((index + (feedback ? 1 : 0)) / queue.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black mb-1">{t.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.sub}</p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {index + 1}/{queue.length} {t.progress}
          </span>
          <span className="badge text-xs" style={{ background: `${currentColor}20`, color: currentColor }}>
            {item.level} · {item.category}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: currentColor }} />
        </div>
      </div>

      <div className="p-5 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(56,189,248,0.05))', border: '1px solid rgba(249,115,22,0.16)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          {t.prompt}
        </p>
        <h3 className="text-2xl font-black mb-5 leading-tight">{item.promptNo}</h3>

        <div className="flex gap-2">
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                feedback ? handleNext() : handleCheck();
              }
            }}
            disabled={!!feedback}
            className="app-input flex-1"
            placeholder="..."
          />
          <button
            onClick={feedback ? handleNext : handleCheck}
            disabled={!feedback && !input.trim()}
            className="btn-primary px-4 py-3 shrink-0"
          >
            {feedback ? (index >= queue.length - 1 ? t.finish : t.next) : t.check}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className="p-5 rounded-2xl animate-fadeInUp"
          style={{
            background: feedback.correct ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
            border: `1px solid ${feedback.correct ? 'rgba(74,222,128,0.28)' : 'rgba(248,113,113,0.28)'}`,
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: feedback.correct ? 'var(--success)' : 'var(--danger)' }}>
                {feedback.correct ? t.correct : t.wrong}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.answer}</p>
              <p className="text-2xl font-black">{item.answer}</p>
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-faint)' }}>/{item.pronunciation}/</p>
            </div>
            <TTSButton text={item.answer} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--secondary)' }}>{t.example}</p>
              <p className="text-sm">{item.example}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>{t.note}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.noteNo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPracticeMode;
