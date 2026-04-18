import React, { useState, useRef, useEffect } from 'react';
import { SourceLang, CONVERSATION_SCENARIOS, ConversationScenario } from '../types';
import { generateConversationResponse } from '../services/geminiService';
import TTSButton from './TTSButton';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface Props {
  lang: SourceLang;
  onComplete: () => void;
}

// ─── Scenario card ──────────────────────────────────────────────────────────
const ScenarioCard: React.FC<{
  scenario: ConversationScenario;
  onClick: () => void;
  diffLabels: Record<string, string>;
}> = ({ scenario, onClick, diffLabels }) => {
  const diffColors: Record<string, string> = {
    beginner:     'var(--success)',
    intermediate: 'var(--warning)',
    advanced:     'var(--danger)',
  };
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left w-full flex items-center gap-3 active:scale-95"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        {scenario.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{scenario.titleNo}</p>
          <span
            className="badge text-xs"
            style={{
              background: `${diffColors[scenario.difficulty]}18`,
              color: diffColors[scenario.difficulty],
            }}
          >
            {diffLabels[scenario.difficulty]}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{scenario.descriptionNo}</p>
      </div>
      <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// ─── Chat message ───────────────────────────────────────────────────────────
const ChatMsg: React.FC<{ msg: Message }> = ({ msg }) => {
  // Extract tip in parentheses from AI messages
  const tipMatch = msg.role === 'ai' ? msg.text.match(/\(Tips?:([^)]+)\)/i) : null;
  const cleanText = tipMatch ? msg.text.replace(tipMatch[0], '').trim() : msg.text;
  const tip = tipMatch ? tipMatch[1].trim() : null;

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      {msg.role === 'ai' && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-auto"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          🤖
        </div>
      )}
      <div className="max-w-[80%] space-y-2">
        <div className={msg.role === 'user' ? 'msg-user px-4 py-2.5 text-sm' : 'msg-ai px-4 py-2.5 text-sm'}>
          {cleanText}
        </div>
        {msg.role === 'ai' && (
          <div className="flex items-center gap-2">
            <TTSButton text={cleanText} size="sm" />
            {tip && (
              <span
                className="text-xs px-2 py-1 rounded-xl"
                style={{ background: 'rgba(167,139,250,0.1)', color: 'var(--accent)' }}
              >
                💡 {tip}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Active conversation ────────────────────────────────────────────────────
const ActiveConversation: React.FC<{
  scenario: ConversationScenario;
  lang: SourceLang;
  onBack: () => void;
  onComplete: () => void;
  convLabels: Record<string, string>;
}> = ({ scenario, lang, onBack, onComplete, convLabels }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<Array<{ role: 'user' | 'model'; text: string }>>([]);

  // Greet user when scenario starts
  useEffect(() => {
    const greet = async () => {
      setLoading(true);
      try {
        const greeting = scenario.starterPhrases[0];
        historyRef.current = [{ role: 'model', text: greeting }];
        setMessages([{ role: 'ai', text: greeting, timestamp: new Date() }]);
      } finally {
        setLoading(false);
      }
    };
    greet();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', text });
    setLoading(true);

    try {
      const aiResponse = await generateConversationResponse(
        scenario.context,
        historyRef.current.slice(-10),
        text,
        lang,
      );
      historyRef.current.push({ role: 'model', text: aiResponse });
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date() }]);

      // Mark complete after 6+ messages
      if (historyRef.current.length >= 6 && !completed) {
        setCompleted(true);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '(Feil: Kunne ikke hente svar. Sjekk API-nøkkelen din.)',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scenario header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: 'var(--primary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {convLabels.back}
        </button>
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <span className="text-xl">{scenario.icon}</span>
          <div>
            <p className="font-bold text-sm">{scenario.titleNo}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {convLabels.answerIn}
            </p>
          </div>
        </div>
      </div>

      {/* Phrase suggestions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            {convLabels.tryPhrases}
          </p>
          <div className="flex flex-wrap gap-2">
            {scenario.starterPhrases.slice(1).map((phrase, i) => (
              <button
                key={i}
                onClick={() => setInput(phrase)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1">
        {messages.map((msg, i) => <ChatMsg key={i} msg={msg} />)}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2" style={{ background: 'var(--primary)', color: 'white' }}>🤖</div>
            <div className="msg-ai px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Complete badge */}
      {completed && (
        <div
          className="p-3 rounded-2xl mb-3 flex items-center gap-3 animate-popIn"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}
        >
          <span className="text-xl">🎉</span>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>{convLabels.completed}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{convLabels.xpEarned}</p>
          </div>
          <button
            onClick={onComplete}
            className="badge badge-success text-xs cursor-pointer"
          >
            {convLabels.nextScenario}
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className="flex gap-2 p-3 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={convLabels.writeIn}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)' }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
          style={{
            background: input.trim() ? 'var(--primary)' : 'var(--bg-hover)',
            color: 'white',
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Main ConversationMode ──────────────────────────────────────────────────
const ConversationMode: React.FC<Props> = ({ lang, onComplete }) => {
  const labels = ({
    no: {
      title: 'Samtaleøvelse', sub: 'Den raskeste måten å lære spansk på. Velg et scenario og snakk med en AI-partner.',
      whyTitle: '🎓 Hvorfor samtaleøvelse er nøkkelen',
      whyBody: 'Forskning viser at aktiv bruk av et språk er langt mer effektivt enn passiv pugge. AI-partneren din korrigerer feil og gir tips underveis. Start med begynnerscenarier og jobb deg oppover!',
      chooseScenario: 'VELG SCENARIO',
      diffLabels: { beginner: 'Nybegynner', intermediate: 'Mellomnivå', advanced: 'Avansert' },
      back: 'Tilbake', answerIn: 'Svar på spansk · AI gir tilbakemelding',
      tryPhrases: 'Prøv disse frasene:', writeIn: 'Skriv på spansk...',
      completed: 'Samtale fullført!', xpEarned: '+20 XP opptjent', nextScenario: 'Neste scenario →',
    },
    en: {
      title: 'Conversation practice', sub: 'The fastest way to learn Spanish. Choose a scenario and talk with an AI partner.',
      whyTitle: '🎓 Why conversation practice is the key',
      whyBody: 'Research shows that actively using a language is far more effective than passive memorisation. Your AI partner corrects mistakes and gives tips along the way. Start with beginner scenarios and work your way up!',
      chooseScenario: 'CHOOSE SCENARIO',
      diffLabels: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
      back: 'Back', answerIn: 'Reply in Spanish · AI gives feedback',
      tryPhrases: 'Try these phrases:', writeIn: 'Write in Spanish...',
      completed: 'Conversation completed!', xpEarned: '+20 XP earned', nextScenario: 'Next scenario →',
    },
    de: {
      title: 'Gesprächsübung', sub: 'Der schnellste Weg, Spanisch zu lernen. Wähle ein Szenario und sprich mit einem KI-Partner.',
      whyTitle: '🎓 Warum Gesprächsübung der Schlüssel ist',
      whyBody: 'Forschungen zeigen, dass aktive Sprachnutzung weitaus effektiver ist als passives Lernen. Dein KI-Partner korrigiert Fehler und gibt unterwegs Tipps. Fang mit Anfängerszenarien an!',
      chooseScenario: 'SZENARIO WÄHLEN',
      diffLabels: { beginner: 'Anfänger', intermediate: 'Mittelstufe', advanced: 'Fortgeschritten' },
      back: 'Zurück', answerIn: 'Auf Spanisch antworten · KI gibt Feedback',
      tryPhrases: 'Probiere diese Phrasen:', writeIn: 'Auf Spanisch schreiben...',
      completed: 'Gespräch abgeschlossen!', xpEarned: '+20 XP verdient', nextScenario: 'Nächstes Szenario →',
    },
    ru: {
      title: 'Разговорная практика', sub: 'Самый быстрый способ выучить испанский. Выбери сценарий и говори с AI-партнёром.',
      whyTitle: '🎓 Почему разговорная практика — ключ к успеху',
      whyBody: 'Исследования показывают, что активное использование языка намного эффективнее пассивного заучивания. Твой AI-партнёр исправляет ошибки и даёт советы. Начни с базовых сценариев!',
      chooseScenario: 'ВЫБРАТЬ СЦЕНАРИЙ',
      diffLabels: { beginner: 'Начинающий', intermediate: 'Средний', advanced: 'Продвинутый' },
      back: 'Назад', answerIn: 'Отвечай по-испански · AI даёт обратную связь',
      tryPhrases: 'Попробуй эти фразы:', writeIn: 'Пиши по-испански...',
      completed: 'Разговор завершён!', xpEarned: '+20 XP заработано', nextScenario: 'Следующий сценарий →',
    },
  } as Record<string, any>)[lang] ?? {} as any;
  const [selected, setSelected] = useState<ConversationScenario | null>(null);

  const handleComplete = () => {
    onComplete();
    setSelected(null);
  };

  if (selected) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col animate-fadeIn">
        <ActiveConversation
          scenario={selected}
          lang={lang}
          onBack={() => setSelected(null)}
          onComplete={handleComplete}
          convLabels={labels}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black mb-1">{labels.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {labels.sub}
        </p>
      </div>

      {/* Info banner */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.15)' }}
      >
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--secondary)' }}>
          {labels.whyTitle}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {labels.whyBody}
        </p>
      </div>

      {/* Difficulty filter */}
      <div>
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          {labels.chooseScenario}
        </h3>
        <div className="space-y-3">
          {CONVERSATION_SCENARIOS.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => setSelected(scenario)}
              diffLabels={labels.diffLabels ?? { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationMode;
