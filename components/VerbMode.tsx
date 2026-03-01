import React, { useState, useMemo } from 'react';
import { getVerbDetails } from '../services/geminiService';
import { VerbData, SourceLang } from '../types';
import NeuralDecoder from './NeuralDecoder';
import TTSButton from './TTSButton';

interface VerbEntry {
  name: string;
  type: '-ar' | '-er' | '-ir' | 'irregular';
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
  { name: 'Pensar', type: 'irregular' },
];

type FilterType = 'all' | '-ar' | '-er' | '-ir' | 'irregular';

const TYPE_COLORS: Record<VerbEntry['type'], string> = {
  '-ar': 'var(--primary)',
  '-er': 'var(--secondary)',
  '-ir': 'var(--accent)',
  'irregular': 'var(--warning)',
};

interface VerbModeProps {
  lang?: SourceLang;
}

const VerbMode: React.FC<VerbModeProps> = ({ lang = 'no' }) => {
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [verbData, setVerbData] = useState<VerbData | null>(null);
  const [loading, setLoading] = useState(false);
  const [verbError, setVerbError] = useState<string | null>(null);

  const filteredVerbs = useMemo(() => {
    if (activeFilter === 'all') return VERB_LIST;
    return VERB_LIST.filter(v => v.type === activeFilter);
  }, [activeFilter]);

  const handleVerbSelect = async (verb: string) => {
    setSelectedVerb(verb);
    setLoading(true);
    setVerbData(null);
    setVerbError(null);
    try {
      const data = await getVerbDetails(verb, lang as SourceLang);
      if (!data || !data.infinitive) throw new Error('Ugyldig svar fra AI');
      setVerbData(data);
    } catch (e: any) {
      setVerbError(e?.message || 'Kunne ikke hente verbdata. Sjekk API-nøkkelen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const labels = ({
    no: { title: 'Verbtrening', sub: '25 essensielle spanske verb', filterAll: 'Alle', filterIrreg: 'Uregelrett', loading: 'Henter verbdata...', conjugation: 'Bøyning', analysis: 'Setningsanalyse' },
    ru: { title: 'Тренировка глаголов', sub: '25 ключевых испанских глаголов', filterAll: 'Все', filterIrreg: 'Неправильные', loading: 'Загрузка...', conjugation: 'Спряжение', analysis: 'Анализ предложений' },
    en: { title: 'Verb Training', sub: '25 essential Spanish verbs', filterAll: 'All', filterIrreg: 'Irregular', loading: 'Loading verb data...', conjugation: 'Conjugation', analysis: 'Sentence Analysis' },
    de: { title: 'Verbtraining', sub: '25 wesentliche spanische Verben', filterAll: 'Alle', filterIrreg: 'Unregelmäßig', loading: 'Verbdaten laden...', conjugation: 'Konjugation', analysis: 'Satzanalyse' },
  } as Record<string, { title: string; sub: string; filterAll: string; filterIrreg: string; loading: string; conjugation: string; analysis: string }>)[lang] ?? { title: 'Verb Training', sub: '25 essential Spanish verbs', filterAll: 'All', filterIrreg: 'Irregular', loading: 'Loading...', conjugation: 'Conjugation', analysis: 'Sentence Analysis' };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: labels.filterAll },
    { id: '-ar', label: '-AR' },
    { id: '-er', label: '-ER' },
    { id: '-ir', label: '-IR' },
    { id: 'irregular', label: labels.filterIrreg },
  ];

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black mb-1">{labels.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{labels.sub}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: activeFilter === f.id
                ? (f.id === 'all' ? 'var(--primary)' : TYPE_COLORS[f.id as VerbEntry['type']] ?? 'var(--primary)')
                : 'var(--bg-card)',
              color: activeFilter === f.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${activeFilter === f.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Verb grid */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {filteredVerbs.map(v => {
            const color = TYPE_COLORS[v.type];
            const isSelected = selectedVerb === v.name;
            return (
              <button
                key={v.name}
                onClick={() => handleVerbSelect(v.name)}
                className="p-3 rounded-xl text-left transition-all relative"
                style={{
                  background: isSelected ? `${color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? color : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 12px ${color}30` : 'none',
                }}
              >
                <p
                  className="font-bold text-sm"
                  style={{ color: isSelected ? color : 'var(--text)' }}
                >
                  {v.name}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isSelected ? color : 'var(--text-faint)' }}
                >
                  {v.type}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verb detail */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--warning) transparent transparent transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{labels.loading}</p>
        </div>
      )}

      {verbError && !loading && (
        <div
          className="p-3 rounded-xl text-sm"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)' }}
        >
          ⚠️ {verbError}
        </div>
      )}

      {verbData && !loading && (
        <div className="space-y-4 animate-fadeInUp">
          {/* Infinitive + meaning */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(249,115,22,0.04) 100%)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <TTSButton text={verbData.infinitive} />
              <div>
                <p className="text-3xl font-black">{verbData.infinitive}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--warning)' }}>
                  {verbData.meaning}
                </p>
              </div>
            </div>
          </div>

          {/* Conjugation tables */}
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {labels.conjugation}
          </h3>
          <div className="grid gap-3">
            {verbData.conjugations.map((conj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--secondary)' }}
                >
                  {conj.tense}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ['Yo', conj.yo],
                    ['Tú', conj.tu],
                    ['Él/Ella', conj.el],
                    ['Nosotros', conj.nosotros],
                    ['Vosotros', conj.vosotros],
                    ['Ellos', conj.ellos],
                  ].map(([pronoun, form]) => (
                    <div key={pronoun} className="flex justify-between items-center">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{pronoun}</span>
                      <span className="font-semibold text-sm">{form}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sentence analysis */}
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {labels.analysis}
          </h3>
          <NeuralDecoder
            initialSentence={`Hoy yo ${verbData.conjugations[0]?.yo || 'como'} con mis amigos.`}
            lang={lang as SourceLang}
          />
        </div>
      )}
    </div>
  );
};

export default VerbMode;
