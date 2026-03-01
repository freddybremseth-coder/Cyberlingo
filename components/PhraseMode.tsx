import React, { useState, useEffect } from 'react';
import { getPhraseBatch } from '../services/geminiService';
import { SourceLang } from '../types';
import TTSButton from './TTSButton';

interface Phrase {
  spanish: string;
  translation: string;
  context: string;
}

const CATEGORIES = [
  { id: 'Greetings', icon: '👋' },
  { id: 'Directions', icon: '🗺️' },
  { id: 'Restaurant', icon: '🍽️' },
  { id: 'Shopping', icon: '🛍️' },
  { id: 'Emergency', icon: '🚨' },
  { id: 'Social', icon: '🤝' },
  { id: 'Business', icon: '💼' },
  { id: 'Travel', icon: '✈️' },
  { id: 'Hotel', icon: '🏨' },
  { id: 'Small Talk', icon: '💬' },
];

const PhraseMode: React.FC<{ lang: SourceLang }> = ({ lang }) => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [masteredPhrases, setMasteredPhrases] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberlingo_phrases');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchBatch();
  }, [activeCategory, lang]);

  const fetchBatch = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getPhraseBatch(activeCategory, lang);
      if (!Array.isArray(data) || data.length === 0) throw new Error('Ingen fraser mottatt');
      setPhrases(data);
    } catch (e: any) {
      setFetchError(e?.message || 'Kunne ikke hente fraser. Sjekk API-nøkkelen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMastered = (phrase: string) => {
    const newMastered = masteredPhrases.includes(phrase)
      ? masteredPhrases.filter(p => p !== phrase)
      : [...masteredPhrases, phrase];
    setMasteredPhrases(newMastered);
    localStorage.setItem('cyberlingo_phrases', JSON.stringify(newMastered));
  };

  const progress = Math.min(100, Math.round((masteredPhrases.length / 500) * 100));

  const labels = ({
    no: { title: 'Fraser', sub: '500 essensielle hverdagsfraser', progress: 'Fraser lært', loading: 'Henter fraser...' },
    ru: { title: 'Фразы', sub: '500 важных испанских фраз', progress: 'Фраз изучено', loading: 'Загрузка...' },
    en: { title: 'Phrases', sub: '500 essential everyday phrases', progress: 'Phrases learned', loading: 'Loading phrases...' },
    de: { title: 'Phrasen', sub: '500 wesentliche Alltagsphrasen', progress: 'Phrasen gelernt', loading: 'Phrasen laden...' },
  } as Record<string, { title: string; sub: string; progress: string; loading: string }>)[lang] ?? { title: 'Phrases', sub: '500 essential phrases', progress: 'Phrases learned', loading: 'Loading...' };

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
          <span className="badge badge-secondary text-xs">{masteredPhrases.length} / 500</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
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
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${activeCategory === cat.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.id}</span>
          </button>
        ))}
      </div>

      {/* Phrase list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent) transparent transparent transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{labels.loading}</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm" style={{ color: 'var(--danger)' }}>⚠️ {fetchError}</p>
          <button onClick={fetchBatch} className="btn-ghost px-4 py-2 text-sm">Prøv igjen</button>
        </div>
      ) : (
        <div className="space-y-3">
          {phrases.map((phrase, i) => {
            const isMastered = masteredPhrases.includes(phrase.spanish);
            return (
              <div
                key={i}
                className="p-4 rounded-2xl transition-all"
                style={{
                  background: isMastered ? 'rgba(74,222,128,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${isMastered ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                }}
              >
                {/* Top row: Spanish + TTS + mastered toggle */}
                <div className="flex items-start gap-3 mb-2">
                  <TTSButton text={phrase.spanish} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-base leading-snug"
                      style={{ color: isMastered ? 'var(--success)' : 'var(--text)' }}
                    >
                      {phrase.spanish}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {phrase.translation}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleMastered(phrase.spanish)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: isMastered ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isMastered ? 'var(--success)' : 'var(--border)'}`,
                    }}
                  >
                    {isMastered ? (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" style={{ color: 'var(--text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Context */}
                {phrase.context && (
                  <div
                    className="mt-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.12)' }}
                  >
                    <p className="text-xs" style={{ color: 'var(--accent)' }}>
                      💡 {phrase.context}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhraseMode;
