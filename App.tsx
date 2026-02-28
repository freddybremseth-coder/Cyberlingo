
import React, { useState, useEffect } from 'react';
import { INITIAL_LESSONS } from './data/lessons';
import { Lesson, SourceLang, UserProfile } from './types';
import NeonButton from './components/NeonButton';
import AIAssistant from './components/AIAssistant';
import NeuralDecoder from './components/NeuralDecoder';
import QuizComponent from './components/QuizComponent';
import VerbMode from './components/VerbMode';
import VocabMode from './components/VocabMode';
import PhraseMode from './components/PhraseMode';
import VisionMode from './components/VisionMode';
import LunaLive from './components/LunaLive';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appMode, setAppMode] = useState<'home' | 'lessons' | 'verbs' | 'vocab' | 'phrases' | 'vision' | 'ai'>('home');
  const [aiSubMode, setAiSubMode] = useState<'text' | 'live'>('live');
  const [sourceLang, setSourceLang] = useState<SourceLang>('no');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const lastUser = localStorage.getItem('cyberlingo_current_user');
    if (lastUser) {
      const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
      if (savedUsers[lastUser]) {
        handleLogin(savedUsers[lastUser]);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const savedUsers = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
      savedUsers[user.username] = user;
      localStorage.setItem('cyberlingo_users', JSON.stringify(savedUsers));
      localStorage.setItem('cyberlingo_current_user', user.username);
    }
  }, [user]);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    setSourceLang(newUser.sourceLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberlingo_current_user');
    setUser(null);
  };

  const markMastered = (id: string) => {
    if (user && !user.completedLessonIds.includes(id)) {
      setUser({
        ...user,
        completedLessonIds: [...user.completedLessonIds, id]
      });
    }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const progressPercentage = Math.round((user.completedLessonIds.length / INITIAL_LESSONS.length) * 100);

  const labels = {
    no: {
      home: 'HUB',
      modules: 'KURS',
      verbs: 'VERB',
      vocab: 'ORD',
      phrases: 'FRASER',
      vision: 'VISION',
      ai: 'LUNA',
      logout: 'LOGG UT',
      welcome: `Agent ${user.username}`,
      subWelcome: 'Neural Interface Active',
      progress: 'Total Progresjon',
      aiText: 'Tekst Assistant',
      aiLive: 'Neural Live Link',
      backToLessons: 'Tilbake til moduler',
      selectLesson: 'Velg en modul for å starte dekoding'
    },
    ru: {
      home: 'ХАБ',
      modules: 'КУРСЫ',
      verbs: 'ГЛАГОЛЫ',
      vocab: 'СЛОВА',
      phrases: 'ФРАЗЫ',
      vision: 'VISION',
      ai: 'ЛУНА',
      logout: 'ВЫХОД',
      welcome: `Агент ${user.username}`,
      subWelcome: 'Нейронный интерфейс активен',
      progress: 'Общий прогресс',
      aiText: 'Текстовый ассистент',
      aiLive: 'Живая связь',
      backToLessons: 'Назад к модулям',
      selectLesson: 'Выберите модуль для начала декодирования'
    }
  }[sourceLang];

  const groupedLessons = INITIAL_LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const levelsOrder: Lesson['level'][] = ['Nybegynner', 'Mellomnivå', 'Ekspert'];

  const navigationItems: { id: typeof appMode; label: string }[] = [
    { id: 'home', label: labels.home },
    { id: 'lessons', label: labels.modules },
    { id: 'verbs', label: labels.verbs },
    { id: 'vocab', label: labels.vocab },
    { id: 'phrases', label: labels.phrases },
    { id: 'vision', label: labels.vision },
    { id: 'ai', label: labels.ai },
  ];

  return (
    <div className="flex flex-col min-h-screen font-body text-white bg-dark selection:bg-magenta/40 selection:text-white">
      {/* Primary Header */}
      <header className="h-14 md:h-16 border-b border-cyan/30 flex items-center justify-between px-4 md:px-8 glass-panel sticky top-0 z-[60]">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setAppMode('home')}>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-magenta rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_#FF006E]">
            <span className="text-dark font-heading font-bold -rotate-45 text-lg md:text-xl">Ñ</span>
          </div>
          <h1 className="font-heading text-lg md:text-xl tracking-tighter text-cyan neon-text-cyan hidden sm:block">
            CYBER<span className="text-white">LINGO</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex bg-dark-lighter p-0.5 rounded border border-white/10 text-[9px] font-mono">
            <button onClick={() => setSourceLang('no')} className={`px-2 py-0.5 rounded transition-colors ${sourceLang === 'no' ? 'bg-cyan/20 text-cyan' : 'text-white/40'}`}>NO</button>
            <button onClick={() => setSourceLang('ru')} className={`px-2 py-0.5 rounded transition-colors ${sourceLang === 'ru' ? 'bg-cyan/20 text-cyan' : 'text-white/40'}`}>RU</button>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 md:gap-2 px-2 py-1 border border-magenta/30 rounded text-magenta text-[9px] font-mono hover:bg-magenta/10 transition-all">
            <span className="inline">{labels.logout}</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation Bar */}
      <nav className="sticky top-14 md:top-16 z-50 glass-panel border-b border-cyan/10 px-4 flex items-center justify-center">
        <div className="flex overflow-x-auto no-scrollbar max-w-6xl w-full">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setAppMode(item.id);
                if (item.id !== 'lessons') setSelectedLesson(null);
              }}
              className={`flex-1 min-w-[80px] md:min-w-[100px] py-4 md:py-5 px-2 text-center transition-all relative group
                ${appMode === item.id ? 'text-cyan' : 'text-white/40 hover:text-white/70'}`}
            >
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] whitespace-nowrap">
                {item.label}
              </span>
              {appMode === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan shadow-[0_0_10px_#00D9FF]"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-dark p-4 md:p-10 custom-scrollbar">
        {appMode === 'home' && (
          <div className="max-w-6xl mx-auto py-4 md:py-10 animate-in fade-in duration-700">
            <div className="mb-8 md:mb-12 border-l-4 border-magenta pl-6 py-2">
              <h2 className="text-3xl md:text-5xl font-heading mb-2 tracking-tighter">{labels.welcome}</h2>
              <p className="text-cyan font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] opacity-60">{labels.subWelcome}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="glass-panel p-8 rounded border border-cyan/20 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-4">{labels.progress}</h4>
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-4xl font-heading text-white">{progressPercentage}%</span>
                       <span className="text-cyan font-mono text-xs">{user.completedLessonIds.length} / {INITIAL_LESSONS.length} MODULER</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-magenta shadow-[0_0_10px_#FF006E]" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
               </div>
               <div className="glass-panel p-8 rounded border border-lime/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-2">Vokabular lagret</h4>
                    <span className="text-4xl font-heading text-white">{user.masteredVocab.length}</span>
                  </div>
                  <div className="w-12 h-12 rounded bg-lime/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12">
              {navigationItems.filter(i => i.id !== 'home').map(item => (
                <div 
                  key={item.id}
                  onClick={() => setAppMode(item.id)} 
                  className="glass-panel p-6 md:p-8 rounded-lg border border-white/10 hover:border-cyan hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all cursor-pointer group flex flex-col justify-between h-40 md:h-48"
                >
                  <h3 className="font-heading text-lg md:text-xl mb-1 text-white group-hover:text-cyan transition-colors">{item.label}</h3>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Aktivt grensesnitt</span>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/20 group-hover:text-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {appMode === 'lessons' && (
          <div className="max-w-6xl mx-auto py-6 animate-in fade-in duration-500">
            {!selectedLesson ? (
              <div className="space-y-12">
                <div className="border-l-4 border-cyan pl-6 py-2">
                  <h2 className="text-3xl font-heading text-white uppercase">{labels.modules}</h2>
                  <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">{labels.selectLesson}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {levelsOrder.map(level => (
                    <div key={level} className="space-y-4">
                      <h3 className="text-xs font-heading text-cyan/50 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan rounded-full"></span>
                        {level}
                      </h3>
                      <div className="space-y-3">
                        {groupedLessons[level].map(lesson => (
                          <div
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className="glass-panel p-5 rounded border border-white/5 hover:border-cyan/40 hover:bg-cyan/5 transition-all cursor-pointer group flex justify-between items-center"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-mono text-magenta/60 uppercase">{lesson.category}</span>
                              <span className="text-sm font-heading group-hover:text-cyan transition-colors">{lesson[sourceLang].title}</span>
                            </div>
                            {user.completedLessonIds.includes(lesson.id) ? (
                              <span className="text-lime text-xs">✓</span>
                            ) : (
                              <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto animate-in slide-in-from-right-10 duration-500">
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="mb-8 flex items-center gap-2 text-[10px] font-mono text-cyan/60 hover:text-cyan transition-colors uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {labels.backToLessons}
                </button>

                <div className="mb-8">
                  <span className="text-magenta font-mono text-[10px] uppercase tracking-[0.3em] mb-2 block">{selectedLesson.category} // LVL_{selectedLesson.level.toUpperCase()}</span>
                  <h2 className="text-4xl md:text-5xl font-heading text-white">{selectedLesson[sourceLang].title}</h2>
                </div>

                <div className="glass-panel p-8 rounded-lg border border-cyan/20 mb-10 leading-relaxed text-lg text-white/80">
                  <p>{selectedLesson[sourceLang].content}</p>
                </div>

                <div className="mb-20">
                  <QuizComponent 
                    topic={selectedLesson[sourceLang].title} 
                    lang={sourceLang} 
                    onMastered={() => markMastered(selectedLesson.id)} 
                  />
                </div>

                <div className="mt-12">
                  <NeuralDecoder initialSentence="Hola, me gusta aprender español." lang={sourceLang} />
                </div>
              </div>
            )}
          </div>
        )}

        {appMode === 'verbs' && <div className="max-w-6xl mx-auto"><VerbMode lang={sourceLang} /></div>}
        {appMode === 'vocab' && <div className="max-w-6xl mx-auto"><VocabMode lang={sourceLang} /></div>}
        {appMode === 'phrases' && <div className="max-w-6xl mx-auto"><PhraseMode lang={sourceLang} /></div>}
        {appMode === 'vision' && <div className="max-w-6xl mx-auto"><VisionMode lang={sourceLang} /></div>}

        {appMode === 'ai' && (
          <div className="max-w-4xl mx-auto h-full flex flex-col gap-6 animate-in fade-in duration-700">
            <div className="flex justify-center mb-4">
              <div className="inline-flex glass-panel p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setAiSubMode('live')} 
                  className={`px-6 py-2 rounded-md font-mono text-[10px] uppercase transition-all ${aiSubMode === 'live' ? 'bg-magenta text-white shadow-[0_0_15px_#FF006E]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {labels.aiLive}
                </button>
                <button 
                  onClick={() => setAiSubMode('text')} 
                  className={`px-6 py-2 rounded-md font-mono text-[10px] uppercase transition-all ${aiSubMode === 'text' ? 'bg-cyan text-dark shadow-[0_0_15px_#00D9FF]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {labels.aiText}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[500px]">
              {aiSubMode === 'live' ? (
                <LunaLive lang={sourceLang} />
              ) : (
                <AIAssistant lang={sourceLang} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
