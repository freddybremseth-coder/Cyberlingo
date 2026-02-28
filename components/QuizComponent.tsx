
// Fix: Added React to imports to resolve namespace error when using React.FC
import React, { useState, useEffect } from 'react';
import { generateQuiz, getGrammarExplanation } from '../services/geminiService';
import { QuizQuestion, SourceLang } from '../types';
import NeonButton from './NeonButton';

interface QuizComponentProps {
  topic: string;
  lang?: SourceLang;
  onMastered?: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ topic, lang = 'no', onMastered }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    resetQuizState();
  }, [topic, lang]);

  const resetQuizState = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setShowResult(false);
    setHintsLeft(3);
    setCurrentHint(null);
    setIsQuizActive(false);
    setIsFinished(false);
  };

  const loadQuiz = async (level: number) => {
    setLoading(true);
    setCurrentLevel(level);
    try {
      const quiz = await generateQuiz(topic, 5, level, lang as SourceLang);
      setQuestions(quiz);
      setCurrentIndex(0);
      setScore(0);
      setWrongCount(0);
      setShowResult(false);
      setHintsLeft(3);
      setIsQuizActive(true);
      setIsFinished(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongCount(w => w + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    setCurrentHint(null); 
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const finalizeQuiz = () => {
    const perfectScore = score === questions.length;
    if (perfectScore) {
      setUnlockedLevel(prev => Math.min(prev + 1, 10));
      if (onMastered) onMastered();
    }
    setIsQuizActive(false);
    setIsFinished(false);
  };

  const handleHint = async () => {
    if (hintsLeft <= 0 || hintLoading || showResult) return;
    setHintLoading(true);
    try {
      const hint = await getGrammarExplanation(
        topic,
        `Question: "${questions[currentIndex].question}". Give a pedagogical hint in ${lang === 'no' ? 'Norwegian' : 'Russian'}.`,
        lang as SourceLang
      );
      setCurrentHint(hint);
      setHintsLeft(prev => prev - 1);
    } catch (err) {
      console.error(err);
    } finally {
      setHintLoading(false);
    }
  };

  const localized = {
    no: {
      test: 'Kunnskapstest',
      stats: 'Systemstatus',
      correct: 'Suksess',
      wrong: 'Systemfeil',
      next: 'Neste',
      check: 'Sjekk',
      retry: 'Restart Nivå',
      continue: 'Godkjenn og Lås Opp',
      perfect: 'PERFEKT SYNTAKS - ADGANG INNVILGET',
      failed: 'LOGISK BRIST - ADGANG NEKTET',
      requirements: 'Krav: 100% nøyaktighet for å låse opp neste trinn.'
    },
    ru: {
      test: 'Тест знаний',
      stats: 'Статус системы',
      correct: 'Успех',
      wrong: 'Ошибка системы',
      next: 'Далее',
      check: 'Проверить',
      retry: 'Перезапустить уровень',
      continue: 'Подтвердить и Открыть',
      perfect: 'ИДЕАЛЬНЫЙ СИНТАКСИС - ДОСТУП РАЗРЕШЕН',
      failed: 'ЛОГИЧЕСКАЯ ОШИБКА - ДОСТУП ЗАПРЕЩЕН',
      requirements: 'Требование: 100% точность для разблокировки следующего шага.'
    }
  }[lang as SourceLang];

  if (loading) return (
    <div className="p-12 glass-panel border border-cyan/20 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00D9FF]"></div>
      <p className="font-mono text-cyan text-xs tracking-widest animate-pulse uppercase">HENTER_TESTDATA_V{currentLevel}.0...</p>
    </div>
  );

  // Summary Screen
  if (isFinished) {
    const isPerfect = score === questions.length;
    return (
      <div className="glass-panel p-10 rounded-lg border-2 border-dashed border-white/10 text-center animate-in zoom-in-95 duration-500">
        <h3 className={`font-heading text-3xl mb-4 ${isPerfect ? 'text-lime neon-text-lime' : 'text-magenta'}`}>
          {isPerfect ? localized.perfect : localized.failed}
        </h3>
        <div className="flex justify-center gap-12 my-8 font-mono">
          <div className="text-center">
            <div className="text-[10px] text-white/40 uppercase mb-1">Riktige Svar</div>
            <div className={`text-4xl ${isPerfect ? 'text-lime' : 'text-white'}`}>{score} / {questions.length}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-white/40 uppercase mb-1">Presisjon</div>
            <div className={`text-4xl ${isPerfect ? 'text-lime' : 'text-magenta'}`}>{Math.round((score/questions.length)*100)}%</div>
          </div>
        </div>
        
        {isPerfect ? (
          <div className="space-y-6">
            <p className="text-lime/70 text-sm italic">"Systemet er validert. Du har full kontroll på denne modulen."</p>
            <NeonButton variant="lime" onClick={finalizeQuiz} className="w-full py-4">
              {localized.continue}
            </NeonButton>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-magenta/70 text-sm italic">"Vi tolererer ikke middelmådighet. Du må ha alt rett for å avansere."</p>
            <NeonButton variant="magenta" onClick={() => loadQuiz(currentLevel)} className="w-full py-4">
              {localized.retry}
            </NeonButton>
          </div>
        )}
      </div>
    );
  }

  // Quiz Levels Overview
  if (!isQuizActive) {
    return (
      <div className="glass-panel p-8 rounded-lg border border-lime/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
           <span className="text-[9px] font-mono text-lime/60 uppercase tracking-widest bg-lime/10 px-2 py-1 rounded border border-lime/20">{localized.requirements}</span>
        </div>
        <h3 className="text-lime font-heading text-xl mb-6 uppercase tracking-tighter flex items-center gap-3">
          <span className="w-2 h-2 bg-lime rounded-full animate-pulse"></span>
          {localized.test}: {topic}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              disabled={i + 1 > unlockedLevel}
              onClick={() => loadQuiz(i + 1)}
              className={`p-4 rounded border-2 transition-all font-heading text-xl relative group ${i + 1 <= unlockedLevel ? 'border-lime text-lime hover:bg-lime/10' : 'border-white/5 text-white/10 cursor-not-allowed'}`}
            >
              {i + 1}
              {i + 1 === unlockedLevel && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-lime rounded-full shadow-[0_0_8px_#FFBE0B]"></span>
              )}
              {i + 1 < unlockedLevel && (
                <span className="absolute bottom-1 right-1 text-[8px] opacity-40">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  return (
    <div className="glass-panel p-8 rounded-lg border border-lime/30 animate-in fade-in slide-in-from-bottom-4">
      {/* HUD Stats */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 font-mono">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-lime/50 uppercase tracking-widest">{localized.correct}</span>
            <span className="text-lime text-2xl font-bold leading-none">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-magenta/50 uppercase tracking-widest">{localized.wrong}</span>
            <span className="text-magenta text-2xl font-bold leading-none">{wrongCount}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-white/30 uppercase block mb-1">Sekvens</span>
          <span className="text-white text-xl font-heading">{currentIndex + 1} <span className="text-white/20">/</span> {questions.length}</span>
        </div>
      </div>

      <div className="mb-6 flex gap-1.5">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-sm transition-all duration-500 ${i < currentIndex ? 'bg-lime shadow-[0_0_8px_#FFBE0B]' : i === currentIndex ? 'bg-white/40 animate-pulse' : 'bg-white/5'}`}></div>
        ))}
      </div>

      <h3 className="text-white font-heading text-xl mb-10 leading-tight min-h-[3rem]">{q.question}</h3>
      
      <div className="space-y-4 mb-10">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelectedOption(opt)}
            disabled={showResult}
            className={`w-full text-left p-5 rounded border-2 transition-all group relative overflow-hidden ${
              showResult 
                ? opt === q.correctAnswer 
                  ? 'border-lime text-lime bg-lime/10' 
                  : selectedOption === opt 
                    ? 'border-magenta text-magenta bg-magenta/10' 
                    : 'border-white/5 text-white/10'
                : selectedOption === opt 
                  ? 'border-cyan text-cyan bg-cyan/10 shadow-[0_0_15px_rgba(0,217,255,0.1)]' 
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:bg-white/5'
            }`}
          >
            <div className="relative z-10 flex justify-between items-center">
              <span className="text-lg">{opt}</span>
              {showResult && opt === q.correctAnswer && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-lime/20 px-2 py-0.5 rounded">Verified</span>
              )}
              {showResult && selectedOption === opt && opt !== q.correctAnswer && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-magenta/20 px-2 py-0.5 rounded">Error</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mb-10 p-6 bg-dark/60 border border-white/10 rounded-lg animate-in slide-in-from-top-2">
          <div className="text-[10px] font-mono text-cyan/50 uppercase mb-3 tracking-widest border-b border-white/5 pb-2">Nevral Analyse:</div>
          <p className="text-white/80 text-base leading-relaxed italic">{q.explanation}</p>
        </div>
      )}

      <div className="flex items-center gap-8">
        <NeonButton 
          variant={showResult ? (selectedOption === q.correctAnswer ? 'lime' : 'magenta') : 'cyan'} 
          onClick={showResult ? handleNext : handleCheck}
          className="min-w-[180px] py-3"
          disabled={!selectedOption && !showResult}
        >
          {showResult ? localized.next : localized.check}
        </NeonButton>
        
        {!showResult && hintsLeft > 0 && (
          <button 
            onClick={handleHint}
            disabled={hintLoading}
            className="text-xs font-mono text-cyan/50 hover:text-cyan border-b border-cyan/20 hover:border-cyan tracking-widest uppercase disabled:opacity-30 transition-all"
          >
            {hintLoading ? 'LØSER_HINT...' : `HENT HINT (${hintsLeft}/3)`}
          </button>
        )}
      </div>

      {currentHint && !showResult && (
        <div className="mt-8 p-5 bg-cyan/5 border border-cyan/20 rounded font-body text-base text-cyan/90 animate-in fade-in border-l-4">
          <span className="text-[10px] font-mono block mb-2 opacity-50 uppercase tracking-[0.3em]">Hentet data:</span>
          {currentHint}
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
