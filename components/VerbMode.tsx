
import React, { useState, useMemo } from 'react';
import { getVerbDetails, getVerbSentenceExamples } from '../services/geminiService';
import { VerbData, SourceLang } from '../types';
import NeonButton from './NeonButton';
import NeuralDecoder from './NeuralDecoder';
import TTSButton from './TTSButton';

interface VerbEntry {
  name: string;
  type: '-ar' | '-er' | '-ir' | 'irregular';
}

interface SentenceExample {
  spanish: string;
  norwegian: string;
}

const VERB_LIST: VerbEntry[] = [
  { name: 'Hablar', type: '-ar' },
  { name: 'Cantar', type: '-ar' },
  { name: 'Trabajar', type: '-ar' },
  { name: 'Comer', type: '-er' },
  { name: 'Leer', type: '-er' },
  { name: 'Beber', type: '-er' },
  { name: 'Vivir', type: '-ir' },
  { name: 'Escribir', type: '-ir' },
  { name: 'Abrir', type: '-ir' },
  { name: 'Ser', type: 'irregular' },
  { name: 'Estar', type: 'irregular' },
  { name: 'Ir', type: 'irregular' },
  { name: 'Tener', type: 'irregular' },
  { name: 'Hacer', type: 'irregular' },
  { name: 'Poder', type: 'irregular' },
  { name: 'Decir', type: 'irregular' },
  { name: 'Querer', type: 'irregular' },
  { name: 'Saber', type: 'irregular' },
  { name: 'Ver', type: 'irregular' },
  { name: 'Dar', type: 'irregular' },
  { name: 'Venir', type: 'irregular' },
  { name: 'Poner', type: 'irregular' },
  { name: 'Salir', type: 'irregular' },
  { name: 'Dormir', type: 'irregular' },
  { name: 'Pensar', type: 'irregular' }
];

type FilterType = 'all' | '-ar' | '-er' | '-ir' | 'irregular';

interface VerbModeProps {
  lang?: SourceLang;
}

const VerbMode: React.FC<VerbModeProps> = ({ lang = 'no' }) => {
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [verbData, setVerbData] = useState<VerbData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(true);

  const filteredVerbs = useMemo(() => {
    if (activeFilter === 'all') return VERB_LIST;
    return VERB_LIST.filter(v => v.type === activeFilter);
  }, [activeFilter]);

  const handleVerbSelect = async (verb: string) => {
    setSelectedVerb(verb);
    setLoading(true);
    try {
      const data = await getVerbDetails(verb, lang as SourceLang);
      setVerbData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    no: {
      title: 'Verb Database',
      filterAll: 'Alle',
      filterAr: '-AR',
      filterEr: '-ER',
      filterIr: '-IR',
      filterIrreg: 'Uregelrett',
      search: 'Søk verb...',
      conjugation: 'Bøyning',
      analysis: 'Analyse',
      loading: 'Dekrypterer verb-data...'
    },
    ru: {
      title: 'База Глаголов',
      filterAll: 'Все',
      filterAr: '-AR',
      filterEr: '-ER',
      filterIr: '-IR',
      filterIrreg: 'Неправильные',
      search: 'Поиск глагола...',
      conjugation: 'Спряжение',
      analysis: 'Анализ',
      loading: 'Декодирование данных глагола...'
    }
  }[lang as SourceLang];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-heading text-cyan neon-text-cyan mb-2 uppercase">{labels.title}</h1>
        <p className="text-white/40 text-sm font-mono uppercase tracking-widest">System_Access: Verb_Matrix_v4.0</p>
      </div>

      <div className="glass-panel rounded-lg border border-cyan/20 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-2">
          {(['all', '-ar', '-er', '-ir', 'irregular'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 text-[10px] font-mono border rounded transition-all uppercase ${activeFilter === f ? 'border-cyan text-cyan bg-cyan/10 shadow-[0_0_10px_rgba(0,217,255,0.2)]' : 'border-white/10 text-white/40 hover:border-white/30'}`}
            >
              {labels[`filter${f.charAt(0).toUpperCase() + f.slice(1).replace('-', '')}` as keyof typeof labels]}
            </button>
          ))}
        </div>
        
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-dark/40 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredVerbs.map(v => (
            <button 
              key={v.name} 
              onClick={() => handleVerbSelect(v.name)} 
              className={`
                text-left p-3 rounded border transition-all relative group
                ${selectedVerb === v.name ? 'border-cyan text-cyan bg-cyan/10' : 'border-white/5 text-white/50 hover:bg-white/5 hover:border-white/20'}
              `}
            >
              <span className="text-sm font-heading">{v.name}</span>
              <span className="absolute bottom-1 right-1 text-[8px] opacity-30 font-mono">{v.type}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-magenta border-t-transparent rounded-full animate-spin"></div>
          <p className="text-magenta font-mono text-xs animate-pulse uppercase tracking-[0.2em]">{labels.loading}</p>
        </div>
      ) : verbData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="glass-panel p-8 rounded-lg border border-magenta/30 relative">
             <div className="absolute top-4 right-8 flex gap-4">
                <TTSButton text={verbData.infinitive} />
             </div>
            <div className="mb-10">
              <h2 className="text-5xl font-heading mb-2">{verbData.infinitive}</h2>
              <p className="text-magenta font-mono text-lg uppercase tracking-widest">{verbData.meaning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {verbData.conjugations.map((conj, idx) => (
                <div key={idx} className="bg-dark/60 border border-white/5 p-6 rounded-lg group hover:border-cyan/30 transition-all">
                  <h4 className="text-cyan text-[10px] font-mono uppercase mb-4 tracking-widest border-b border-white/5 pb-2">{conj.tense}</h4>
                  <div className="space-y-3 font-body">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/30 font-mono text-[10px]">Yo</span>
                      <span className="text-white font-medium">{conj.yo}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/30 font-mono text-[10px]">Tú</span>
                      <span className="text-white font-medium">{conj.tu}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/30 font-mono text-[10px]">Él/Ella</span>
                      <span className="text-white font-medium">{conj.el}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                      <span className="text-white/30 font-mono text-[10px]">Nos.</span>
                      <span className="text-white font-medium">{conj.nosotros}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/30 font-mono text-[10px]">Vos.</span>
                      <span className="text-white font-medium">{conj.vosotros}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/30 font-mono text-[10px]">Ellos</span>
                      <span className="text-white font-medium">{conj.ellos}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
               <h3 className="text-cyan font-heading text-xs uppercase mb-6 tracking-widest border-b border-cyan/20 pb-2">{labels.analysis}</h3>
               <NeuralDecoder 
                initialSentence={`Hoy yo ${verbData.conjugations[0]?.yo || 'como'} con mis amigos.`} 
                lang={lang} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerbMode;
