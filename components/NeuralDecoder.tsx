import React, { useState } from 'react';
import { analyzeSentence } from '../services/geminiService';
import { SourceLang } from '../types';
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

const TYPE_COLOR_MAP: Record<string, string> = {
  verb: 'var(--primary)',
  noun: 'var(--secondary)',
  adjective: 'var(--accent)',
  adverb: 'var(--warning)',
  pronoun: 'var(--success)',
  preposition: 'var(--danger)',
  article: 'var(--text-muted)',
  conjunction: 'var(--text-muted)',
};

const getTypeColor = (type: string): string =>
  TYPE_COLOR_MAP[type.toLowerCase()] ?? 'var(--text-muted)';

const NeuralDecoder: React.FC<NeuralDecoderProps> = ({
  initialSentence = 'Hola, ¿cómo estás?',
  lang = 'no',
}) => {
  const [input, setInput] = useState(initialSentence);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setActiveWord(null);
    setError(null);
    try {
      const data = await analyzeSentence(input, lang as SourceLang);
      if (!data || !data.breakdown) throw new Error('Ugyldig svar fra AI');
      setResult(data);
    } catch (e: any) {
      setError(e?.message || 'Analyse feilet. Sjekk API-nøkkelen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const labels = ({
    no: { title: 'Setningsanalyse', placeholder: 'Skriv en spansk setning...', action: 'Analyser', loading: 'Analyserer...', idiomatic: 'Norsk oversettelse', literal: 'Bokstavelig oversettelse', breakdown: 'Grammatisk nedbrytning', wordHint: 'Trykk på et ord for detaljer' },
    ru: { title: 'Анализ предложений', placeholder: 'Введите испанское предложение...', action: 'Анализ', loading: 'Анализируем...', idiomatic: 'Перевод', literal: 'Дословный перевод', breakdown: 'Грамматика', wordHint: 'Нажмите на слово для подробностей' },
    en: { title: 'Sentence Analysis', placeholder: 'Type a Spanish sentence...', action: 'Analyse', loading: 'Analysing...', idiomatic: 'English translation', literal: 'Literal translation', breakdown: 'Grammar breakdown', wordHint: 'Tap a word for details' },
    de: { title: 'Satzanalyse', placeholder: 'Spanischen Satz eingeben...', action: 'Analysieren', loading: 'Analysiere...', idiomatic: 'Deutsche Übersetzung', literal: 'Wörtliche Übersetzung', breakdown: 'Grammatikanalyse', wordHint: 'Auf ein Wort tippen für Details' },
  } as Record<string, { title: string; placeholder: string; action: string; loading: string; idiomatic: string; literal: string; breakdown: string; wordHint: string }>)[lang as string] ?? { title: 'Sentence Analysis', placeholder: 'Type a Spanish sentence...', action: 'Analyse', loading: 'Analysing...', idiomatic: 'Translation', literal: 'Literal translation', breakdown: 'Grammar', wordHint: 'Tap a word for details' };

  return (
    <div
      className="p-4 rounded-2xl space-y-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <p className="font-bold text-sm">{labels.title}</p>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDecode()}
          placeholder={labels.placeholder}
          className="app-input flex-1 text-sm"
        />
        <button
          onClick={handleDecode}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 py-2 text-sm shrink-0"
          style={{ opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          {labels.action}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-4 justify-center">
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--secondary) transparent transparent transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{labels.loading}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="p-3 rounded-xl text-sm"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)' }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Translations */}
          <div className="grid grid-cols-1 gap-3">
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.15)',
                borderLeft: '3px solid var(--primary)',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>
                {labels.idiomatic}
              </p>
              <p className="font-medium text-sm">{result.translation}</p>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(56,189,248,0.05)',
                border: '1px solid rgba(56,189,248,0.12)',
                borderLeft: '3px solid var(--secondary)',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--secondary)' }}>
                {labels.literal}
              </p>
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                {result.literalTranslation}
              </p>
            </div>
          </div>

          {/* Word breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              {labels.breakdown}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.breakdown.map((item, i) => {
                const color = getTypeColor(item.type);
                const isActive = activeWord === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveWord(isActive ? null : i)}
                    className="px-3 py-2 rounded-xl transition-all text-left"
                    style={{
                      background: isActive ? `${color}15` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isActive ? color : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <TTSButton text={item.word} size="sm" />
                      <span className="font-bold text-sm" style={{ color: isActive ? color : 'var(--text)' }}>
                        {item.word}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color }}
                    >
                      {item.type}
                    </span>
                    {isActive && (
                      <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
                        {item.analysis}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {activeWord === null && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
                {labels.wordHint}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralDecoder;
