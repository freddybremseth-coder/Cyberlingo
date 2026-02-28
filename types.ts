
export type SourceLang = 'no' | 'ru';

export interface UserProfile {
  username: string;
  sourceLang: SourceLang;
  completedLessonIds: string[];
  masteredVocab: string[];
  masteredPhrases: string[];
  lastActive: number;
}

export interface LessonContent {
  title: string;
  description: string;
  content: string;
}

export interface Lesson {
  id: string;
  level: 'Nybegynner' | 'Mellomnivå' | 'Ekspert';
  category: 'Grammatikk' | 'Ordforråd' | 'Struktur';
  no: LessonContent;
  ru: LessonContent;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VerbConjugation {
  tense: string;
  yo: string;
  tu: string;
  el: string;
  nosotros: string;
  vosotros: string;
  ellos: string;
}

export interface VerbData {
  infinitive: string;
  meaning: string;
  conjugations: VerbConjugation[];
}
