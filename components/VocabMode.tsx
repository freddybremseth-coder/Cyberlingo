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
  'Essentials', 'Action Verbs', 'Adjectives', 'Food & Drink', 
  'Travel', 'Time & Numbers', 'Family', 'Home', 'Work', 'Emotions',
  'Reise', 'Kroppen', 'Hverdagslige Handlinger', 'Følelser', 'Natur'
];

const VocabMode: React.FC<{ lang: SourceLang; onMasteredUpdate?: (words: string[]) => void }> = ({ lang, onMasteredUpdate }) => {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  
  // Vi bruker localStorage direkte her for enkelhets skyld siden VocabMode 
  // ikke har enkel tilgang til User-state uten prop-drilling akkurat nå, 
  // men vi lagrer det under brukernavnet.
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
    try {
      const data = await getVocabBatch(activeCategory, lang);
      setWords(data);
    } catch (e) {
      console.error("Failed to fetch vocab batch:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMastered = (word: string) => {
    const newMastered = masteredWords.includes(word)
      ? masteredWords.filter(w => w !== word)
      : [...masteredWords, word];
    
    setMasteredWords(newMastered);

    // Oppdater global state i localStorage
    const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
    if (savedUsers[currentUser]) {
      savedUsers[currentUser].masteredVocab = newMastered;
      localStorage.setItem('cyberlingo_users', JSON.stringify(savedUsers));
    }

    // Notify parent for achievement tracking
    onMasteredUpdate?.(newMastered);
  };

  const totalWordsLimit = 500;
  const progress = Math.round((masteredWords.length / totalWordsLimit) * 100);

  const labels = {
    no: { 
      title: 'Vokabular-Matrix', 
      sub: 'Nevral tilkobling: 500 Essensielle Ord', 
      mastered: 'Lært', 
      progress: 'Total Synkronisering',
      syncing: 'HENTER_ORDDATA...',
      learnedCount: 'Ord lagret i cortex'
    },
    ru: { 
      title: 'Матрица Слов', 
      sub: 'Нейронная связь: 500 базовых слов', 
      mastered: 'Изучено', 
      progress: 'Общая синхронизация',
      syncing: 'ЗАГРУЗКА_ДАННЫХ...',
      learnedCount: 'Слов в памяти'
    }
  }[lang];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-heading text-cyan neon-text-cyan mb-2 uppercase">{labels.title}</h1>
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">{labels.sub}</p>
        </div>
        <div className="w-full md:w-72 glass-panel p-4 rounded border border-white/10 shadow-[0_0_20px_rgba(0,217,255,0.05)]">
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-white/40 uppercase">{labels.progress}</span>
            <span className="text-magenta font-bold">{masteredWords.length} / {totalWordsLimit}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-magenta shadow-[0_0_12px_#FF006E] transition-all duration-1000" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded border font-mono text-[10px] uppercase transition-all whitespace-nowrap
              ${activeCategory === cat 
                ? 'bg-cyan/10 border-cyan text-cyan shadow-[0_0_15px_rgba(0,217,255,0.15)]' 
                : 'border-white/5 text-white/40 hover:border-white/20 hover:text-white/60'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-24 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-cyan font-mono text-[11px] animate-pulse tracking-[0.4em] uppercase">{labels.syncing}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {words.map((word, i) => {
            const isMastered = masteredWords.includes(word.spanish);
            return (
              <div 
                key={i} 
                className={`glass-panel p-5 rounded border transition-all relative group overflow-hidden
                  ${isMastered ? 'border-lime/40 bg-lime/5 shadow-[inset_0_0_20px_rgba(255,190,11,0.05)]' : 'border-white/10 hover:border-cyan/40 hover:bg-cyan/5'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <TTSButton text={word.spanish} size="sm" />
                  <button 
                    onClick={() => toggleMastered(word.spanish)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all
                      ${isMastered ? 'bg-lime border-lime shadow-[0_0_8px_#FFBE0B]' : 'border-white/20 hover:border-cyan hover:bg-cyan/10'}`}
                  >
                    {isMastered && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-dark" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <h3 className={`text-xl font-heading mb-1 truncate ${isMastered ? 'text-lime font-bold' : 'text-white'}`}>
                  {word.spanish}
                </h3>
                <p className="text-white/60 text-sm mb-2 line-clamp-1">{word.translation}</p>
                
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyan/40 italic">/{word.pronunciation}/</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isMastered ? 'bg-lime' : 'bg-cyan/20 group-hover:bg-cyan'} animate-pulse`}></div>
                </div>

                {/* Cyberpunk decoration */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r border-b border-white/5 opacity-20 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VocabMode;