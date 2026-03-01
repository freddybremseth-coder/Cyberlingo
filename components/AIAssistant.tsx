import React, { useState, useRef, useEffect } from 'react';
import { getGrammarExplanation } from '../services/geminiService';
import { SourceLang } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const AIAssistant: React.FC<{ lang?: SourceLang }> = ({ lang = 'no' }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const labels = ({
    no: {
      name: 'Luna',
      placeholder: 'Spør om spansk grammatikk, ord eller fraser...',
      send: 'Send',
      you: 'Du',
      assistant: 'Luna',
      welcome: 'Hei! Jeg er Luna, din AI-spansklærer. Spør meg om grammatikk, ord, fraser eller hva som helst om spansk! 🌟',
    },
    ru: {
      name: 'Луна',
      placeholder: 'Спросите об испанской грамматике...',
      send: 'Отправить',
      you: 'Вы',
      assistant: 'Луна',
      welcome: 'Привет! Я Луна, ваш AI-учитель испанского. Задайте мне вопрос о грамматике, словах или фразах! 🌟',
    },
    en: {
      name: 'Luna',
      placeholder: 'Ask about Spanish grammar, words or phrases...',
      send: 'Send',
      you: 'You',
      assistant: 'Luna',
      welcome: 'Hi! I\'m Luna, your AI Spanish teacher. Ask me anything about grammar, vocabulary, phrases or Spanish in general! 🌟',
    },
    de: {
      name: 'Luna',
      placeholder: 'Frag nach spanischer Grammatik, Wörtern oder Phrasen...',
      send: 'Senden',
      you: 'Du',
      assistant: 'Luna',
      welcome: 'Hallo! Ich bin Luna, deine KI-Spanischlehrerin. Frag mich alles über Grammatik, Wortschatz, Phrasen oder Spanisch allgemein! 🌟',
    },
  } as Record<string, { name: string; placeholder: string; send: string; you: string; assistant: string; welcome: string }>)[lang] ?? {
    name: 'Luna',
    placeholder: 'Ask about Spanish grammar, words or phrases...',
    send: 'Send',
    you: 'You',
    assistant: 'Luna',
    welcome: 'Hi! I\'m Luna, your AI Spanish teacher. Ask me anything about Spanish! 🌟',
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', text: labels.welcome }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const explanation = await getGrammarExplanation('Spansk språklæring', userText, lang as SourceLang);
      setMessages(prev => [...prev, { role: 'bot', text: explanation || 'Beklager, prøv igjen.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Noe gikk galt. Prøv igjen.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="flex flex-col rounded-3xl overflow-hidden animate-fadeIn"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        height: 'calc(100vh - 240px)',
        minHeight: 400,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(56,189,248,0.05) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
        >
          🤖
        </div>
        <div>
          <p className="font-bold text-sm">{labels.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-spansklærer</p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--success)' }}
          />
          <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'bot' && (
              <div
                className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
              >
                🤖
              </div>
            )}
            <div
              className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background: m.role === 'user'
                  ? 'var(--primary)'
                  : 'rgba(255,255,255,0.04)',
                border: m.role === 'user'
                  ? 'none'
                  : '1px solid var(--border)',
                color: m.role === 'user' ? 'white' : 'var(--text)',
                borderTopRightRadius: m.role === 'user' ? 4 : undefined,
                borderTopLeftRadius: m.role === 'bot' ? 4 : undefined,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div
              className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
            >
              🤖
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderTopLeftRadius: 4,
              }}
            >
              <div className="flex gap-1 items-center">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: 'var(--accent)',
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleAsk}
        className="flex gap-2 p-3 shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          disabled={loading}
          className="app-input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary px-4 py-2 text-sm shrink-0"
          style={{ opacity: loading || !query.trim() ? 0.5 : 1 }}
        >
          {loading ? (
            <span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"
            />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
