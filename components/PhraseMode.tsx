
import React, { useState, useEffect } from 'react';
import { getPhraseBatch } from '../services/geminiService';
import { SourceLang } from '../types';
import TTSButton from './TTSButton';
import NeonButton from './NeonButton';

interface Phrase {
  spanish: string;
  translation: string;
  context: string;
}

const CATEGORIES = [
  'Greetings', 'Directions', 'Restaurant', 'Shopping', 
  'Emergency', 'Social', 'Business', 'Travel', 'Hotel', 'Small Talk'
];

const PhraseMode: React.FC<{ lang: SourceLang }> = ({ lang }) => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [masteredPhrases, setMasteredPhrases] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberlingo_phrases');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchBatch();
  }, [activeCategory, lang]);

  const fetchBatch = async () => {
    setLoading(true);
    try {
      const data = await getPhraseBatch(activeCategory, lang);
      setPhrases(data);
    } catch (e) {
      console.error(e);
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

  const progress = Math.round((masteredPhrases.length / 500) * 100);

  const labels = {
    no: { title: 'Frase-Dekoder', sub: '500 Essensielle Fraser', context: 'Kontekst', progress: 'Mestringsnivå' },
    ru: { title: 'Декодер Фраз', sub: '500 важных фраз', context: 'Контекст', progress: 'Уровень мастерства' }
  }[lang];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-heading text-magenta neon-text-magenta mb-2 uppercase">{labels.title}</h1>
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">{labels.sub}</p>
        </div>
        <div className="w-full md:w-64">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-white/40 uppercase">{labels.progress}</span>
            <span className="text-cyan">{masteredPhrases.length} / 500</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan shadow-[0_0_8px_#00D9FF]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded border font-mono text-[10px] uppercase transition-all whitespace-nowrap
              ${activeCategory === cat ? 'bg-magenta/10 border-magenta text-magenta shadow-[0_0_10px_rgba(255,0,110,0.2)]' : 'border-white/5 text-white/40 hover:border-white/20'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-1 border-white/10 relative overflow-hidden bg-white/5 rounded-full">
             <div className="absolute inset-0 bg-magenta animate-[loading_1.5s_infinite]"></div>
          </div>
          <p className="text-magenta font-mono text-[10px] animate-pulse uppercase tracking-[0.4em]">SYNCING_PHRASE_PROTOCOLS...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {phrases.map((phrase, i) => {
            const isMastered = masteredPhrases.includes(phrase.spanish);
            return (
              <div 
                key={i} 
                className={`glass-panel p-6 rounded border transition-all flex flex-col md:flex-row gap-6 items-start md:items-center relative group
                  ${isMastered ? 'border-lime/30 bg-lime/5 shadow-[0_0_15px_rgba(255,190,11,0.05)]' : 'border-white/5 hover:border-magenta/30'}`}
              >
                <div className="flex items-center gap-4 min-w-[30%]">
                   <TTSButton text={phrase.spanish} />
                   <div>
                     <h3 className={`text-xl font-heading ${isMastered ? 'text-lime' : 'text-white'}`}>{phrase.spanish}</h3>
                     <p className="text-white/60 font-body">{phrase.translation}</p>
                   </div>
                </div>

                <div className="flex-1 border-l border-white/10 pl-6">
                   <span className="text-[9px] font-mono text-white/30 uppercase block mb-1">{labels.context}</span>
                   <p className="text-xs text-white/40 italic">{phrase.context}</p>
                </div>

                <button 
                  onClick={() => toggleMastered(phrase.spanish)}
                  className={`px-4 py-1 rounded-sm border font-mono text-[9px] uppercase transition-all
                    ${isMastered ? 'bg-lime text-dark border-lime' : 'border-white/10 text-white/30 hover:border-white/30'}`}
                >
                  {isMastered ? 'COMPLETED' : 'MARK_LEARNED'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default PhraseMode;
