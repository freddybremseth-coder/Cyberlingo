import React, { useState, useEffect } from 'react';
import { getVocabBatch } from '../services/geminiService';
import { SourceLang } from '../types';
import TTSButton from './TTSButton';

interface VocabWord {
  spanish: string;
  translation: string;
  pronunciation: string;
}

const CATEGORIES = [
  { id: 'Essentials', icon: '⭐' },
  { id: 'Action Verbs', icon: '⚡' },
  { id: 'Adjectives', icon: '🎨' },
  { id: 'Food & Drink', icon: '🍕' },
  { id: 'Travel', icon: '✈️' },
  { id: 'Time & Numbers', icon: '🕐' },
  { id: 'Family', icon: '👨‍👩‍👧' },
  { id: 'Home', icon: '🏠' },
  { id: 'Work', icon: '💼' },
  { id: 'Emotions', icon: '😊' },
  { id: 'The Body', icon: '🫁' },
  { id: 'Daily Actions', icon: '🔄' },
  { id: 'Nature', icon: '🌿' },
  { id: 'Health', icon: '🏥' },
  { id: 'School & Study', icon: '📚' },
];

const VocabMode: React.FC<{ lang: SourceLang; onMasteredUpdate?: (words: string[]) => void }> = ({ lang, onMasteredUpdate }) => {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const currentUser = localStorage.getItem('cyberlingo_current_user') || 'default';

  const [masteredWords, setMasteredWords] = useState<string[]>(() => {
    const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
    return savedUsers[currentUser]?.masteredVocab || [];
  });

  useEffect(() => {
    fetchBatch();
  }, [activeCategory, lang]);

  const fetchBatch = async () => {
    setLoading(true);
    setWords([]);
    setFetchError(null);
    try {
      const data = await getVocabBatch(activeCategory, lang);
      if (!Array.isArray(data) || data.length === 0) throw new Error('Ingen ord mottatt');
      setWords(data);
    } catch (e: any) {
      setFetchError(e?.message || 'Kunne ikke hente ordforråd. Sjekk API-nøkkelen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMastered = (word: string) => {
    const newMastered = masteredWords.includes(word)
      ? masteredWords.filter(w => w !== word)
      : [...masteredWords, word];

    setMasteredWords(newMastered);

    const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
    if (savedUsers[currentUser]) {
      savedUsers[currentUser].masteredVocab = newMastered;
      localStorage.setItem('cyberlingo_users', JSON.stringify(savedUsers));
    }

    onMasteredUpdate?.(newMastered);
  };

  const totalWordsLimit = 500;
  const progress = Math.min(100, Math.round((masteredWords.length / totalWordsLimit) * 100));

  const labels = ({
    no: { title: 'Vokabular', sub: '500 essensielle spanske ord', progress: 'Ord lært', loading: 'Henter ord...' },
    ru: { title: 'Словарь', sub: '500 базовых испанских слов', progress: 'Слов изучено', loading: 'Загрузка...' },
    en: { title: 'Vocabulary', sub: '500 essential Spanish words', progress: 'Words learned', loading: 'Loading words...' },
    de: { title: 'Vokabular', sub: '500 wesentliche spanische Wörter', progress: 'Wörter gelernt', loading: 'Wörter laden...' },
  } as Record<string, { title: string; sub: string; progress: string; loading: string }>)[lang] ?? { title: 'Vocabulary', sub: '500 essential Spanish words', progress: 'Words learned', loading: 'Loading...' };

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black mb-1">{labels.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{labels.sub}</p>
      </div>

      {/* Progress */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">{labels.progress}</span>
          <span className="badge badge-primary text-xs">{masteredWords.length} / {totalWordsLimit}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
            style={{
              background: activeCategory === cat.id ? 'var(--primary)' : 'var(--bg-card)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${activeCategory === cat.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.id}</span>
          </button>
        ))}
      </div>

      {/* Word grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `var(--primary) transparent transparent transparent` }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{labels.loading}</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm" style={{ color: 'var(--danger)' }}>⚠️ {fetchError}</p>
          <button onClick={fetchBatch} className="btn-ghost px-4 py-2 text-sm">Prøv igjen</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {words.map((word, i) => {
            const isMastered = masteredWords.includes(word.spanish);
            return (
              <div
                key={i}
                className="p-4 rounded-2xl transition-all"
                style={{
                  background: isMastered ? 'rgba(74,222,128,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${isMastered ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-2">
                  <TTSButton text={word.spanish} size="sm" />
                  <button
                    onClick={() => toggleMastered(word.spanish)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: isMastered ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isMastered ? 'var(--success)' : 'var(--border)'}`,
                    }}
                  >
                    {isMastered && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Word */}
                <p
                  className="font-bold text-base leading-tight mb-1"
                  style={{ color: isMastered ? 'var(--success)' : 'var(--text)' }}
                >
                  {word.spanish}
                </p>
                <p className="text-xs leading-snug mb-2" style={{ color: 'var(--text-muted)' }}>
                  {word.translation}
                </p>

                {/* Pronunciation */}
                <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
                  /{word.pronunciation}/
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VocabMode;
