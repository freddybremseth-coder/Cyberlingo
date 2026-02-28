
import React, { useState } from 'react';
import { analyzeSentence } from '../services/geminiService';
import { SourceLang } from '../types';
import NeonButton from './NeonButton';
import TTSButton from './TTSButton';

interface BreakdownItem {
  word: string;
  analysis: string;
  type: string;
}

interface AnalysisResult {
  translation: string;
  literalTranslation: string;
  breakdown: BreakdownItem[];
}

interface NeuralDecoderProps {
  initialSentence?: string;
  lang?: SourceLang;
}

const NeuralDecoder: React.FC<NeuralDecoderProps> = ({ initialSentence = "Hola, ¿cómo estás today?", lang = 'no' }) => {
  const [input, setInput] = useState(initialSentence);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      // Fixed: Explicitly cast lang to SourceLang to resolve type mismatch on line 34
      const data = await analyzeSentence(input, lang as SourceLang);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const localized = {
    no: { title: 'Nevral Dekoder', placeholder: 'Skriv en spansk setning...', action: 'Dekod Syntaks', literal: 'Bokstavelig', idiomatic: 'Idiomatisk' },
    ru: { title: 'Нейронный Декодер', placeholder: 'Введите испанское предложение...', action: 'Декодировать синтаксис', literal: 'Дословно', idiomatic: 'Смысловой перевод' }
  }[lang as SourceLang];

  return (
    <div className="glass-panel p-6 rounded-lg border border-cyan/30 mt-8 relative overflow-hidden shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-cyan animate-pulse shadow-[0_0_8px_#00D9FF]"></div>
        <h3 className="font-heading text-cyan uppercase tracking-tighter text-lg">{localized.title}</h3>
      </div>

      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={localized.placeholder}
          className="flex-1 bg-dark/60 border border-cyan/20 p-3 rounded font-body text-white focus:border-cyan focus:outline-none transition-all"
        />
        <NeonButton variant="cyan" onClick={handleDecode} disabled={loading}>
          {loading ? '...' : localized.action}
        </NeonButton>
      </div>

      {loading && (
        <div className="py-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan animate-[loading_2s_ease-in-out_infinite] shadow-[0_0_10px_#00D9FF]"></div>
          </div>
          <p className="font-mono text-[10px] text-cyan/50 animate-pulse tracking-[0.3em]">ANALYSING_GRAMMAR_STRUCTURE...</p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-dark/40 border-l-2 border-magenta rounded">
              <span className="text-[10px] font-mono text-magenta/50 uppercase block mb-1">{localized.idiomatic}</span>
              <p className="text-white text-lg">{result.translation}</p>
            </div>
            <div className="p-4 bg-dark/40 border-l-2 border-cyan/50 rounded">
              <span className="text-[10px] font-mono text-cyan/30 uppercase block mb-1">{localized.literal}</span>
              <p className="text-white/60 italic text-lg">{result.literalTranslation}</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono text-cyan/30 uppercase block">Syntaktisk Nedbrytning</span>
            <div className="flex flex-wrap gap-4">
              {result.breakdown.map((item, i) => (
                <div key={i} className="group relative">
                  <div className="p-3 bg-white/5 border border-white/10 rounded hover:border-cyan/50 transition-all cursor-default min-w-[100px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-cyan font-bold">{item.word}</span>
                      <TTSButton text={item.word} size="sm" />
                    </div>
                    <span className="text-[9px] font-mono text-magenta/70 uppercase block">{item.type}</span>
                  </div>
                  {/* Tooltip-style explanation */}
                  <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-dark border border-cyan/40 rounded shadow-2xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[11px] text-white/80 leading-snug">{item.analysis}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

export default NeuralDecoder;
