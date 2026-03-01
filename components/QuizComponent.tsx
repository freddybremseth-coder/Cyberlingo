import React, { useState, useEffect } from 'react';
import { generateQuiz, getGrammarExplanation } from '../services/geminiService';
import { QuizQuestion, SourceLang } from '../types';

interface Props {
  topic: string;
  lang?: SourceLang;
  onMastered?: () => void;
}

const QuizComponent: React.FC<Props> = ({ topic, lang = 'no', onMastered }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { reset(); }, [topic, lang]);

  const reset = () => {
    setQuestions([]); setCurrentIndex(0); setScore(0); setWrongCount(0);
    setSelected(null); setShowResult(false); setHintsLeft(3); setHint(null);
    setIsActive(false); setIsFinished(false); setError(null);
  };

  const startQuiz = async (level: number) => {
    setLoading(true);
    setCurrentLevel(level);
    setError(null);
    try {
      const quiz = await generateQuiz(topic, 5, level, lang);
      if (!quiz || quiz.length === 0) throw new Error('Ingen spørsmål returnert');
      setQuestions(quiz);
      setCurrentIndex(0); setScore(0); setWrongCount(0);
      setSelected(null); setShowResult(false);
      setHintsLeft(3); setHint(null);
      setIsActive(true); setIsFinished(false);
    } catch (e: any) {
      setError(e?.message || 'Kunne ikke laste quiz. Sjekk API-nøkkelen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (!selected) return;
    if (selected === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    } else {
      setWrongCount(w => w + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    setHint(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const finalize = () => {
    const perfect = score === questions.length;
    if (perfect) {
      setUnlockedLevel(prev => Math.min(prev + 1, 10));
      onMastered?.();
    }
    setIsActive(false);
    setIsFinished(false);
  };

  const getHint = async () => {
    if (hintsLeft <= 0 || hintLoading || showResult) return;
    setHintLoading(true);
    try {
      const h = await getGrammarExplanation(
        topic,
        `Question: "${questions[currentIndex].question}". Give a brief hint in ${{ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' }[lang] ?? 'English'}.`,
        lang
      );
      setHint(h);
      setHintsLeft(prev => prev - 1);
    } finally {
      setHintLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div
      className="p-10 rounded-2xl flex flex-col items-center gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Lager spørsmål på nivå {currentLevel}...</p>
    </div>
  );

  // ── Finished screen ──────────────────────────────────────────────────────
  if (isFinished) {
    const perfect = score === questions.length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div
        className="p-6 rounded-2xl text-center animate-popIn"
        style={{
          background: perfect ? 'rgba(74,222,128,0.07)' : 'rgba(249,115,22,0.07)',
          border: `1px solid ${perfect ? 'rgba(74,222,128,0.3)' : 'rgba(249,115,22,0.2)'}`,
        }}
      >
        <div className="text-4xl mb-3">{perfect ? '🎉' : '💪'}</div>
        <h3 className="text-xl font-black mb-1" style={{ color: perfect ? 'var(--success)' : 'var(--primary)' }}>
          {perfect ? 'Perfekt!' : 'Bra jobbet!'}
        </h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          {score}/{questions.length} riktige svar · {pct}% nøyaktighet
        </p>

        {perfect ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--success)' }}>
              Du mestret denne leksjonen! Neste nivå er låst opp.
            </p>
            <button
              onClick={finalize}
              className="btn-primary w-full py-3"
            >
              Fullfør og tjen XP →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Du trenger 100% for å gå videre. Prøv igjen!
            </p>
            <button
              onClick={() => startQuiz(currentLevel)}
              className="btn-secondary w-full py-3"
            >
              Prøv igjen
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Level selector ──────────────────────────────────────────────────────
  if (!isActive) {
    return (
      <div
        className="p-5 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <h3 className="font-black text-base">Kunnskapstest: {topic}</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Velg et nivå. Du må svare 100% riktig for å gå videre.
        </p>
        {error && (
          <div
            className="p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)' }}
          >
            ⚠️ {error}
          </div>
        )}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(lvl => {
            const unlocked = lvl <= unlockedLevel;
            const active = lvl === unlockedLevel;
            return (
              <button
                key={lvl}
                disabled={!unlocked}
                onClick={() => startQuiz(lvl)}
                className="h-11 rounded-xl font-bold text-sm transition-all relative"
                style={{
                  background: unlocked
                    ? active ? 'var(--primary)' : 'rgba(74,222,128,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  color: unlocked
                    ? active ? 'white' : 'var(--success)'
                    : 'var(--text-faint)',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  border: `1px solid ${active ? 'transparent' : unlocked ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                }}
              >
                {lvl}
                {lvl < unlockedLevel && (
                  <span className="absolute -top-1 -right-1 text-[10px]">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Active quiz ──────────────────────────────────────────────────────────
  const q = questions[currentIndex];

  return (
    <div
      className="p-5 rounded-2xl animate-fadeInUp"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background: i < currentIndex
                ? 'var(--success)'
                : i === currentIndex
                ? 'var(--primary)'
                : 'rgba(255,255,255,0.06)',
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-4 text-sm">
          <span className="font-bold" style={{ color: 'var(--success)' }}>✓ {score}</span>
          <span className="font-bold" style={{ color: 'var(--danger)' }}>✗ {wrongCount}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Spørsmål {currentIndex + 1} av {questions.length} · Nivå {currentLevel}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-base font-bold mb-5 leading-snug">{q.question}</h3>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.03)';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';
          if (showResult) {
            if (opt === q.correctAnswer) {
              bg = 'rgba(74,222,128,0.1)'; borderColor = 'rgba(74,222,128,0.4)'; textColor = 'var(--success)';
            } else if (selected === opt) {
              bg = 'rgba(248,113,113,0.08)'; borderColor = 'rgba(248,113,113,0.3)'; textColor = 'var(--danger)';
            } else {
              textColor = 'var(--text-faint)';
            }
          } else if (selected === opt) {
            bg = 'rgba(56,189,248,0.08)'; borderColor = 'rgba(56,189,248,0.4)'; textColor = 'var(--secondary)';
          }
          return (
            <button
              key={i}
              disabled={showResult}
              onClick={() => setSelected(opt)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: bg, border: `1.5px solid ${borderColor}`, color: textColor }}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {showResult && opt === q.correctAnswer && <span>✓</span>}
                {showResult && selected === opt && opt !== q.correctAnswer && <span>✗</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div
          className="p-4 rounded-xl mb-4 text-sm leading-relaxed animate-fadeInUp"
          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', color: 'var(--text-muted)' }}
        >
          <p className="font-bold text-xs mb-1" style={{ color: 'var(--secondary)' }}>💡 Forklaring</p>
          {q.explanation}
        </div>
      )}

      {/* Hint */}
      {hint && !showResult && (
        <div
          className="p-4 rounded-xl mb-4 text-sm animate-fadeInUp"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--text-muted)' }}
        >
          <p className="font-bold text-xs mb-1" style={{ color: 'var(--accent)' }}>🤔 Hint</p>
          {hint}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={showResult ? handleNext : handleCheck}
          disabled={!selected && !showResult}
          className="btn-primary flex-1 py-3"
        >
          {showResult ? (currentIndex < questions.length - 1 ? 'Neste →' : 'Se resultat') : 'Sjekk svar'}
        </button>

        {!showResult && hintsLeft > 0 && (
          <button
            onClick={getHint}
            disabled={hintLoading}
            className="btn-ghost px-3 py-3 text-xs flex items-center gap-1"
          >
            {hintLoading ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : '💡'}
            <span>Hint ({hintsLeft})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
