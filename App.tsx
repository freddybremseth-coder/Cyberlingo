import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile, SourceLang, AppTab, LearnMode, SpeakMode,
  Lesson, ACHIEVEMENTS, isSubscriptionActive, todayString,
  getLevelFromXp,
} from './types';
import { INITIAL_LESSONS } from './data/lessons';

// Components
import AuthScreen from './components/AuthScreen';
import ApiKeySetup from './components/ApiKeySetup';
import SubscriptionModal from './components/SubscriptionModal';
import HomeMode from './components/HomeMode';
import ConversationMode from './components/ConversationMode';
import ProgressView from './components/ProgressView';
import SettingsScreen from './components/SettingsScreen';
import VerbMode from './components/VerbMode';
import VocabMode from './components/VocabMode';
import PhraseMode from './components/PhraseMode';
import VisionMode from './components/VisionMode';
import AIAssistant from './components/AIAssistant';
import LunaLive from './components/LunaLive';
import QuizComponent from './components/QuizComponent';
import NeuralDecoder from './components/NeuralDecoder';

// ─── Default user factory ──────────────────────────────────────────────────
const createNewUser = (username: string, lang: SourceLang): UserProfile => ({
  username,
  sourceLang: lang,
  completedLessonIds: [],
  masteredVocab: [],
  masteredPhrases: [],
  lastActive: Date.now(),
  streak: 0,
  lastStreakDate: '',
  xp: 0,
  level: 1,
  subscription: {
    plan: 'trial',
    trialStartDate: Date.now(),
    subscribedDate: null,
    expiresAt: null,
  },
  apiKey: '',
  achievements: [],
  dailyGoalXp: 50,
  todayXp: 0,
  lastGoalDate: todayString(),
  conversationsCompleted: 0,
});

// ─── Save / load helpers ───────────────────────────────────────────────────
const saveUser = (user: UserProfile) => {
  const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
  users[user.username] = user;
  localStorage.setItem('cyberlingo_users', JSON.stringify(users));
  localStorage.setItem('cyberlingo_current_user', user.username);
};

// ─── Bottom nav item ───────────────────────────────────────────────────────
const NavItem: React.FC<{
  tab: AppTab;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all"
    style={{ color: active ? 'var(--primary)' : 'var(--text-faint)' }}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    {active && (
      <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />
    )}
  </button>
);

// ─── SVG icons ─────────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconLearn = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconSpeak = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconProgress = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconProfile = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ─── Main App ──────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [learnMode, setLearnMode] = useState<LearnMode>('lessons');
  const [speakMode, setSpeakMode] = useState<SpeakMode>('conversation');
  const [sourceLang, setSourceLang] = useState<SourceLang>('no');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // ─── Auto-login ────────────────────────────────────────────────────────
  useEffect(() => {
    const lastUser = localStorage.getItem('cyberlingo_current_user');
    if (lastUser) {
      const users = JSON.parse(localStorage.getItem('cyberlingo_users') || '{}');
      if (users[lastUser]) {
        initUser(users[lastUser]);
      }
    }
  }, []);

  // ─── Persist on change ─────────────────────────────────────────────────
  useEffect(() => {
    if (user) saveUser(user);
  }, [user]);

  // ─── Init user: streak, daily reset ───────────────────────────────────
  const initUser = useCallback((u: UserProfile) => {
    const today = todayString();
    let updated = { ...u };

    // Ensure new fields exist (for existing users upgrading)
    if (!updated.subscription) {
      updated.subscription = {
        plan: 'trial',
        trialStartDate: Date.now(),
        subscribedDate: null,
        expiresAt: null,
      };
    }
    if (!updated.achievements) updated.achievements = [];
    if (!updated.xp) updated.xp = 0;
    if (!updated.conversationsCompleted) updated.conversationsCompleted = 0;
    if (!updated.dailyGoalXp) updated.dailyGoalXp = 50;

    // Reset today's XP if it's a new day
    if (updated.lastGoalDate !== today) {
      updated.todayXp = 0;
      updated.lastGoalDate = today;
    }

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (updated.lastStreakDate === today) {
      // Already logged today, no change
    } else if (updated.lastStreakDate === yStr) {
      // Consecutive day – increment
      updated.streak += 1;
      updated.lastStreakDate = today;
    } else {
      // Missed days – reset or start
      updated.streak = 1;
      updated.lastStreakDate = today;
    }

    updated.level = getLevelFromXp(updated.xp);
    setSourceLang(updated.sourceLang);
    setUser(updated);

    // Check if API key is needed
    const storedKey = localStorage.getItem('cyberlingo_api_key') || updated.apiKey;
    if (!storedKey) {
      setNeedsApiKey(true);
    }
  }, []);

  // ─── Login handler ─────────────────────────────────────────────────────
  const handleLogin = (newUser: UserProfile) => {
    initUser(newUser);
  };

  // ─── Logout ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('cyberlingo_current_user');
    setUser(null);
    setActiveTab('home');
    setSelectedLesson(null);
  };

  // ─── Earn XP ───────────────────────────────────────────────────────────
  const earnXp = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const newXp = prev.xp + amount;
      const newTodayXp = prev.todayXp + amount;
      const newLevel = getLevelFromXp(newXp);
      return { ...prev, xp: newXp, todayXp: newTodayXp, level: newLevel };
    });
  }, []);

  // ─── Mark lesson mastered ──────────────────────────────────────────────
  const markLessonMastered = useCallback((id: string) => {
    setUser(prev => {
      if (!prev || prev.completedLessonIds.includes(id)) return prev;
      const updated = {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, id],
      };
      // Check achievements
      const achs = [...updated.achievements];
      if (!achs.includes('first_lesson')) achs.push('first_lesson');
      const beginnerLessons = INITIAL_LESSONS.filter(l => l.level === 'Nybegynner');
      if (
        !achs.includes('all_beginner') &&
        beginnerLessons.every(l => updated.completedLessonIds.includes(l.id))
      ) achs.push('all_beginner');
      return { ...updated, achievements: achs };
    });
    earnXp(30);
  }, [earnXp]);

  // ─── Mark vocab mastered ───────────────────────────────────────────────
  const updateMasteredVocab = useCallback((words: string[]) => {
    setUser(prev => {
      if (!prev) return prev;
      const achs = [...prev.achievements];
      if (!achs.includes('vocab_50') && words.length >= 50) achs.push('vocab_50');
      if (!achs.includes('vocab_200') && words.length >= 200) achs.push('vocab_200');
      if (!achs.includes('vocab_500') && words.length >= 500) achs.push('vocab_500');
      return { ...prev, masteredVocab: words, achievements: achs };
    });
  }, []);

  // ─── Conversation completed ────────────────────────────────────────────
  const onConversationComplete = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const count = (prev.conversationsCompleted || 0) + 1;
      const achs = [...prev.achievements];
      if (!achs.includes('conversation_first')) achs.push('conversation_first');
      if (!achs.includes('conversation_10') && count >= 10) achs.push('conversation_10');
      return { ...prev, conversationsCompleted: count, achievements: achs };
    });
    earnXp(20);
  }, [earnXp]);

  // ─── Streak badge check ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const achs = [...user.achievements];
    let changed = false;
    if (!achs.includes('streak_3') && user.streak >= 3) { achs.push('streak_3'); changed = true; }
    if (!achs.includes('streak_7') && user.streak >= 7) { achs.push('streak_7'); changed = true; }
    if (!achs.includes('streak_30') && user.streak >= 30) { achs.push('streak_30'); changed = true; }
    if (changed) setUser(prev => prev ? { ...prev, achievements: achs } : prev);
  }, [user?.streak]);

  // ─── API key save ──────────────────────────────────────────────────────
  const handleApiKeySave = (key: string) => {
    localStorage.setItem('cyberlingo_api_key', key);
    setUser(prev => prev ? { ...prev, apiKey: key } : prev);
    setNeedsApiKey(false);
  };

  // ─── Subscription mock ─────────────────────────────────────────────────
  const handleSubscribe = () => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        subscription: {
          plan: 'monthly',
          trialStartDate: prev.subscription?.trialStartDate || Date.now(),
          subscribedDate: Date.now(),
          expiresAt: null,
        },
      };
    });
    setShowSubModal(false);
  };

  // ─── Subscription active check ─────────────────────────────────────────
  const checkSubscription = useCallback((): boolean => {
    if (!user) return false;
    const active = isSubscriptionActive(user.subscription);
    if (!active) setShowSubModal(true);
    return active;
  }, [user]);

  // ─── Lesson navigation ─────────────────────────────────────────────────
  const groupedLessons = INITIAL_LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);
  const levelsOrder: Lesson['level'][] = ['Nybegynner', 'Mellomnivå', 'Ekspert'];

  // ─── Gate: not logged in ───────────────────────────────────────────────
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // ─── Gate: no API key ──────────────────────────────────────────────────
  if (needsApiKey) {
    return <ApiKeySetup onSave={handleApiKeySave} username={user.username} />;
  }

  // ─── Tab nav change ────────────────────────────────────────────────────
  const handleTabChange = (tab: AppTab) => {
    if ((tab === 'learn' || tab === 'speak') && !checkSubscription()) return;
    setActiveTab(tab);
    setSelectedLesson(null);
  };

  const subActive = isSubscriptionActive(user.subscription);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ── Subscription modal ── */}
      {showSubModal && (
        <SubscriptionModal
          user={user}
          onSubscribe={handleSubscribe}
          onClose={() => setShowSubModal(false)}
        />
      )}

      {/* ── Top header ── */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: 'rgba(15,23,42,0.97)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-lg font-black"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
          >
            ¡
          </div>
          <span className="font-black text-lg tracking-tight text-gradient">Hola!</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1">
            <span className="animate-flame text-lg">🔥</span>
            <span className="text-sm font-bold" style={{ color: 'var(--warning)' }}>{user.streak}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full badge badge-primary">
            <span>⚡</span>
            <span className="font-bold">{user.xp} XP</span>
          </div>

          {/* Lang toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
          >
            {(['no', 'en', 'de', 'ru'] as SourceLang[]).map(l => (
              <button
                key={l}
                onClick={() => { setSourceLang(l); setUser(prev => prev ? { ...prev, sourceLang: l } : prev); }}
                className="px-2 py-1 text-xs font-bold transition-all"
                style={{
                  background: sourceLang === l ? 'var(--primary)' : 'transparent',
                  color: sourceLang === l ? 'white' : 'var(--text-muted)',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>

        {/* ── HOME ─────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <HomeMode
            user={user}
            onNavigate={(tab) => handleTabChange(tab)}
            onNavigateLearn={(mode) => { handleTabChange('learn'); setLearnMode(mode); }}
            onNavigateSpeak={() => handleTabChange('speak')}
          />
        )}

        {/* ── LEARN ────────────────────────────────────────────────────── */}
        {activeTab === 'learn' && (
          <div className="animate-fadeIn">
            {/* Sub-nav */}
            <div
              className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar sticky top-0 z-20"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
            >
              {([
                { id: 'lessons', label: 'Leksjoner', icon: '📖' },
                { id: 'vocab',   label: 'Vokabular', icon: '🔤' },
                { id: 'verbs',   label: 'Verb',      icon: '⚡' },
                { id: 'phrases', label: 'Fraser',    icon: '💬' },
                { id: 'vision',  label: 'Kamera',    icon: '📷' },
              ] as { id: LearnMode; label: string; icon: string }[]).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setLearnMode(item.id); setSelectedLesson(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: learnMode === item.id ? 'var(--primary)' : 'var(--bg-card)',
                    color: learnMode === item.id ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${learnMode === item.id ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 pb-24">
              {learnMode === 'lessons' && (
                <div>
                  {!selectedLesson ? (
                    <div className="space-y-6 animate-fadeInUp">
                      <div>
                        <h2 className="text-2xl font-black mb-1">Leksjoner</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Lær spansk grammatikk systematisk fra A1 til B2
                        </p>
                      </div>

                      {levelsOrder.map((level, li) => (
                        <div key={level} className="animate-fadeInUp" style={{ animationDelay: `${li * 0.1}s` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">
                              {level === 'Nybegynner' ? '🌱' : level === 'Mellomnivå' ? '🌿' : '🌳'}
                            </span>
                            <h3 className="font-bold" style={{ color: 'var(--text)' }}>{level}</h3>
                            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {(groupedLessons[level] || []).filter(l =>
                                user.completedLessonIds.includes(l.id)).length}/{(groupedLessons[level] || []).length}
                            </span>
                          </div>

                          <div className="grid gap-3">
                            {(groupedLessons[level] || []).map((lesson, idx) => {
                              const done = user.completedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                                  style={{
                                    background: done ? 'rgba(74,222,128,0.06)' : 'var(--bg-card)',
                                    border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                                    animationDelay: `${idx * 0.05}s`,
                                  }}
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                    style={{
                                      background: done
                                        ? 'rgba(74,222,128,0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    }}
                                  >
                                    {done ? '✅' : lesson.icon || '📝'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>
                                      {lesson[sourceLang].title}
                                    </p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                      {lesson[sourceLang].description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className="badge text-xs"
                                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                                    >
                                      {lesson.category}
                                    </span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-faint)' }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto animate-fadeInUp">
                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="flex items-center gap-2 mb-6 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: 'var(--primary)' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Tilbake til leksjoner
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{selectedLesson.icon || '📝'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge badge-primary text-xs">{selectedLesson.level}</span>
                            <span className="badge badge-secondary text-xs">{selectedLesson.category}</span>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-2xl font-black mb-1">{selectedLesson[sourceLang].title}</h2>
                      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                        {selectedLesson[sourceLang].description}
                      </p>

                      <div
                        className="p-5 rounded-2xl mb-6 text-sm leading-relaxed"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      >
                        {selectedLesson[sourceLang].content}
                      </div>

                      <QuizComponent
                        topic={selectedLesson[sourceLang].title}
                        lang={sourceLang}
                        onMastered={() => markLessonMastered(selectedLesson.id)}
                      />

                      <div className="mt-8">
                        <NeuralDecoder initialSentence="Hola, me gusta aprender español." lang={sourceLang} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {learnMode === 'vocab' && (
                <VocabMode lang={sourceLang} onMasteredUpdate={updateMasteredVocab} />
              )}
              {learnMode === 'verbs' && <VerbMode lang={sourceLang} />}
              {learnMode === 'phrases' && <PhraseMode lang={sourceLang} />}
              {learnMode === 'vision' && <VisionMode lang={sourceLang} />}
            </div>
          </div>
        )}

        {/* ── SPEAK ────────────────────────────────────────────────────── */}
        {activeTab === 'speak' && (
          <div className="animate-fadeIn">
            {/* Sub-nav */}
            <div
              className="px-4 py-3 flex gap-2 sticky top-0 z-20"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
            >
              {([
                { id: 'conversation', label: 'Samtale', icon: '🎭' },
                { id: 'luna-live',    label: 'Luna Live', icon: '🎙️' },
                { id: 'luna-text',    label: 'Assistent', icon: '🤖' },
              ] as { id: SpeakMode; label: string; icon: string }[]).map(item => (
                <button
                  key={item.id}
                  onClick={() => setSpeakMode(item.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: speakMode === item.id ? 'var(--primary)' : 'var(--bg-card)',
                    color: speakMode === item.id ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${speakMode === item.id ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 pb-24">
              {speakMode === 'conversation' && (
                <ConversationMode lang={sourceLang} onComplete={onConversationComplete} />
              )}
              {speakMode === 'luna-live' && <LunaLive lang={sourceLang} />}
              {speakMode === 'luna-text' && <AIAssistant lang={sourceLang} />}
            </div>
          </div>
        )}

        {/* ── PROGRESS ─────────────────────────────────────────────────── */}
        {activeTab === 'progress' && (
          <div className="p-4 pb-24 animate-fadeIn">
            <ProgressView user={user} totalLessons={INITIAL_LESSONS.length} />
          </div>
        )}

        {/* ── PROFILE / SETTINGS ───────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="p-4 pb-24 animate-fadeIn">
            <SettingsScreen
              user={user}
              onLogout={handleLogout}
              onApiKeySave={handleApiKeySave}
              onSubscribe={handleSubscribe}
              onLangChange={(l) => {
                setSourceLang(l);
                setUser(prev => prev ? { ...prev, sourceLang: l } : prev);
              }}
            />
          </div>
        )}
      </main>

      {/* ── Bottom navigation ── */}
      <nav
        className="bottom-nav shrink-0 flex relative pb-safe"
        style={{ minHeight: 56 }}
      >
        {([
          { tab: 'home',     icon: <IconHome />,     label: 'Hjem' },
          { tab: 'learn',    icon: <IconLearn />,    label: 'Lær' },
          { tab: 'speak',    icon: <IconSpeak />,    label: 'Snakk' },
          { tab: 'progress', icon: <IconProgress />, label: 'Fremgang' },
          { tab: 'profile',  icon: <IconProfile />,  label: 'Profil' },
        ] as { tab: AppTab; icon: React.ReactNode; label: string }[]).map(item => (
          <NavItem
            key={item.tab}
            tab={item.tab}
            active={activeTab === item.tab}
            icon={item.icon}
            label={item.label}
            onClick={() => handleTabChange(item.tab)}
          />
        ))}
      </nav>
    </div>
  );
};

export default App;
