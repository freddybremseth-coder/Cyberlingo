
import React, { useState, useRef, useEffect } from 'react';
import { getGrammarExplanation } from '../services/geminiService';
import { SourceLang } from '../types';

interface AIAssistantProps {
  lang?: SourceLang;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ lang = 'no' }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const localized = {
    no: { name: 'LUNA', placeholder: 'Analysespørsmål...', logUser: 'LOG_BRUKER', logBot: 'LOG_LUNA' },
    ru: { name: 'ЛУНА', placeholder: 'Задать вопрос...', logUser: 'ЛОГ_ПОЛЬЗОВАТЕЛЬ', logBot: 'ЛОГ_ЛУНА' }
  }[lang as SourceLang];

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      // Explicitly cast lang to satisfy SourceLang requirement
      const explanation = await getGrammarExplanation('Spansk språklæring', userText, lang as SourceLang);
      setMessages(prev => [...prev, { role: 'bot', text: explanation || 'Error.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'System Error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel neon-border-cyan rounded-lg overflow-hidden">
      <div className="p-4 border-b border-cyan/30 bg-cyan/10">
        <h3 className="text-cyan font-heading text-lg tracking-tight">AI Mentor: {localized.name}</h3>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 font-body text-sm min-h-[400px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-lg ${m.role === 'user' ? 'bg-magenta/10 text-white' : 'bg-cyan/5 text-cyan-50'}`}>
              <div className="text-[9px] font-mono opacity-50 mb-1 uppercase">
                {m.role === 'user' ? localized.logUser : localized.logBot}
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAsk} className="p-3 bg-dark-lighter border-t border-cyan/30">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={localized.placeholder}
          className="w-full bg-dark/80 border border-cyan/40 p-3 text-cyan focus:outline-none rounded text-sm"
        />
      </form>
    </div>
  );
};

export default AIAssistant;
