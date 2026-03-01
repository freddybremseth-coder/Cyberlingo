export type SourceLang = 'no' | 'ru' | 'en' | 'de';

export type AppTab = 'home' | 'learn' | 'speak' | 'progress' | 'profile';
export type LearnMode = 'lessons' | 'vocab' | 'verbs' | 'phrases' | 'vision';
export type SpeakMode = 'conversation' | 'luna-live' | 'luna-text';

export interface SubscriptionStatus {
  plan: 'trial' | 'monthly' | 'none';
  trialStartDate: number;       // timestamp ms
  subscribedDate: number | null;
  expiresAt: number | null;     // null = active until cancelled
}

export interface UserProfile {
  username: string;
  sourceLang: SourceLang;
  completedLessonIds: string[];
  masteredVocab: string[];
  masteredPhrases: string[];
  lastActive: number;

  // Progress & gamification
  streak: number;
  lastStreakDate: string;   // 'YYYY-MM-DD'
  xp: number;
  level: number;            // 1–10, based on XP

  // SaaS
  subscription: SubscriptionStatus;
  apiKey: string;

  // Achievements
  achievements: string[];   // list of achievement ids

  // Daily goal
  dailyGoalXp: number;
  todayXp: number;
  lastGoalDate: string;     // 'YYYY-MM-DD'

  // Conversation practice count
  conversationsCompleted: number;
}

export interface LessonContent {
  title: string;
  description: string;
  content: string;
}

export interface Lesson {
  id: string;
  level: 'Nybegynner' | 'Mellomnivå' | 'Ekspert';
  category: 'Grammatikk' | 'Ordforråd' | 'Struktur' | 'Samtale';
  icon: string;
  no: LessonContent;
  ru: LessonContent;
  en: LessonContent;
  de: LessonContent;
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

export interface ConversationScenario {
  id: string;
  icon: string;
  titleNo: string;
  descriptionNo: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context: string;  // system-prompt context for AI
  starterPhrases: string[];
}

export interface Achievement {
  id: string;
  icon: string;
  nameNo: string;
  descNo: string;
  xpReward: number;
}

// ─── Achievement definitions ───────────────────────────────────────────────
export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_lesson: {
    id: 'first_lesson', icon: '🎯',
    nameNo: 'Første Steg',
    descNo: 'Fullførte din første leksjon',
    xpReward: 50,
  },
  vocab_50: {
    id: 'vocab_50', icon: '📚',
    nameNo: 'Ordsamler',
    descNo: 'Lærte 50 spanske ord',
    xpReward: 100,
  },
  vocab_200: {
    id: 'vocab_200', icon: '📖',
    nameNo: 'Ordrik',
    descNo: 'Lærte 200 spanske ord',
    xpReward: 250,
  },
  vocab_500: {
    id: 'vocab_500', icon: '🏅',
    nameNo: 'Ordmester',
    descNo: 'Lærte 500 spanske ord',
    xpReward: 500,
  },
  phrases_50: {
    id: 'phrases_50', icon: '🗣️',
    nameNo: 'Frasermaker',
    descNo: 'Mestret 50 spanske fraser',
    xpReward: 100,
  },
  streak_3: {
    id: 'streak_3', icon: '🔥',
    nameNo: '3-Dagers Streak',
    descNo: 'Øvde 3 dager på rad',
    xpReward: 30,
  },
  streak_7: {
    id: 'streak_7', icon: '🔥',
    nameNo: 'Ukesmester',
    descNo: 'Øvde 7 dager på rad',
    xpReward: 75,
  },
  streak_30: {
    id: 'streak_30', icon: '🏆',
    nameNo: 'Månedsmester',
    descNo: 'Øvde 30 dager på rad',
    xpReward: 300,
  },
  conversation_first: {
    id: 'conversation_first', icon: '💬',
    nameNo: 'Første Samtale',
    descNo: 'Fullførte din første samtaleøvelse',
    xpReward: 75,
  },
  conversation_10: {
    id: 'conversation_10', icon: '🎙️',
    nameNo: 'Samtalemester',
    descNo: 'Fullførte 10 samtaleøvelser',
    xpReward: 200,
  },
  all_beginner: {
    id: 'all_beginner', icon: '⭐',
    nameNo: 'Nybegynnermester',
    descNo: 'Fullførte alle nybegynnerleksjoner',
    xpReward: 150,
  },
  all_intermediate: {
    id: 'all_intermediate', icon: '🌟',
    nameNo: 'Videregående Mester',
    descNo: 'Fullførte alle mellomnivåleksjoner',
    xpReward: 250,
  },
  all_expert: {
    id: 'all_expert', icon: '💫',
    nameNo: 'Ekspertspråker',
    descNo: 'Fullførte alle ekspertleksjoner',
    xpReward: 400,
  },
};

// ─── Conversation scenarios ────────────────────────────────────────────────
export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: 'cafe',
    icon: '☕',
    titleNo: 'På Kafeen',
    descriptionNo: 'Bestill kaffe og mat på en spansk kafé',
    difficulty: 'beginner',
    context: `You are a friendly Spanish café waiter/waitress. The student is ordering coffee and food.
Speak naturally in Spanish, but keep sentences simple for beginners.
After each response, gently note 1 grammar/vocabulary tip in Norwegian in parentheses.
Use common café vocabulary: café, té, agua, croissant, bocadillo, menú del día, la cuenta.`,
    starterPhrases: [
      'Buenos días, ¿qué desea?',
      'Hola, ¿me puede traer un café con leche?',
      'Quisiera ver el menú, por favor.',
    ],
  },
  {
    id: 'hotel',
    icon: '🏨',
    titleNo: 'På Hotellet',
    descriptionNo: 'Sjekk inn og spør om rom og fasiliteter',
    difficulty: 'beginner',
    context: `You are a helpful hotel receptionist in Spain. The student is checking in.
Speak in clear, simple Spanish. After each response, give 1 tip in Norwegian in parentheses.
Key vocabulary: habitación, reserva, llave, desayuno, piscina, wifi, planta.`,
    starterPhrases: [
      'Buenas tardes, tengo una reserva.',
      '¿Cuánto cuesta la habitación?',
      '¿Está incluido el desayuno?',
    ],
  },
  {
    id: 'directions',
    icon: '🗺️',
    titleNo: 'Finne Veien',
    descriptionNo: 'Spør om veibeskrivelser i en spansk by',
    difficulty: 'beginner',
    context: `You are a friendly local in a Spanish city. The student is asking for directions.
Use common direction vocabulary: a la derecha, a la izquierda, todo recto, la calle, la plaza, el semáforo.
Give simple directions and tips in Norwegian after each exchange.`,
    starterPhrases: [
      'Perdona, ¿dónde está la plaza mayor?',
      '¿Cómo llego al museo?',
      '¿Está lejos de aquí?',
    ],
  },
  {
    id: 'shopping',
    icon: '🛍️',
    titleNo: 'Shopping',
    descriptionNo: 'Handle klær og suvenirer på et spansk marked',
    difficulty: 'intermediate',
    context: `You are a helpful shop assistant in a Spanish market/store. The student is shopping.
Key vocabulary: precio, talla, color, probador, descuento, ¿tiene...?, más barato, caro, barato.
Be enthusiastic and helpful. Add Norwegian tips after each response.`,
    starterPhrases: [
      '¿Cuánto cuesta esto?',
      '¿Tienen esto en azul?',
      'Me lo llevo, ¿dónde pago?',
    ],
  },
  {
    id: 'restaurant',
    icon: '🍽️',
    titleNo: 'Restaurant',
    descriptionNo: 'Bestill middag på en spansk restaurant',
    difficulty: 'intermediate',
    context: `You are an experienced Spanish restaurant waiter. The student is ordering dinner.
Vocabulary: mesa para dos, primero, segundo, postre, la cuenta, ¿qué recomienda?, sin gluten, vegetariano.
Be warm and professional. Add Norwegian tips in parentheses.`,
    starterPhrases: [
      'Una mesa para dos, por favor.',
      '¿Qué recomienda de primero?',
      'La cuenta, por favor.',
    ],
  },
  {
    id: 'new_friend',
    icon: '🤝',
    titleNo: 'Bli Kjent',
    descriptionNo: 'Introduser deg selv og bli kjent med en spanjol',
    difficulty: 'intermediate',
    context: `You are a friendly Spanish person meeting someone for the first time.
Topics: name, origin, profession, hobbies, family, age.
Keep conversation natural and engaging. Add Norwegian language tips in parentheses.`,
    starterPhrases: [
      '¡Hola! Me llamo Ana. ¿Y tú?',
      '¿De dónde eres?',
      '¿A qué te dedicas?',
    ],
  },
  {
    id: 'doctor',
    icon: '🏥',
    titleNo: 'Hos Legen',
    descriptionNo: 'Beskriv symptomer og spør om hjelp',
    difficulty: 'advanced',
    context: `You are a Spanish-speaking doctor. The student is a patient describing symptoms.
Key vocabulary: me duele, tengo fiebre, alergia, receta, farmacia, hospital, síntomas.
Be professional but approachable. Add Norwegian medical vocabulary tips in parentheses.`,
    starterPhrases: [
      'Me duele la cabeza.',
      'Tengo fiebre desde ayer.',
      '¿Necesito receta para este medicamento?',
    ],
  },
  {
    id: 'work',
    icon: '💼',
    titleNo: 'Jobbsamtale',
    descriptionNo: 'Diskuter arbeid og prosjekter på spansk',
    difficulty: 'advanced',
    context: `You are a Spanish-speaking work colleague. Discuss work topics: projects, meetings, deadlines, teams.
Key vocabulary: reunión, proyecto, plazo, equipo, jefe, informe, presentación.
Keep it professional. Add Norwegian business Spanish tips in parentheses.`,
    starterPhrases: [
      '¿Cuándo es la reunión?',
      'Tenemos que presentar el proyecto mañana.',
      '¿Puedes ayudarme con el informe?',
    ],
  },
];

// ─── XP thresholds per level ───────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000, 13000];

export const getLevelFromXp = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getXpProgress = (xp: number): { current: number; needed: number; pct: number } => {
  const level = getLevelFromXp(xp);
  const start = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const end = LEVEL_THRESHOLDS[level] ?? start + 1000;
  const current = xp - start;
  const needed = end - start;
  return { current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
};

// ─── Subscription helpers ──────────────────────────────────────────────────
export const TRIAL_DAYS = 7;
export const SUBSCRIPTION_PRICE_NOK = 30;

export const getTrialDaysLeft = (sub: SubscriptionStatus): number => {
  if (sub.plan !== 'trial') return 0;
  const msLeft = (sub.trialStartDate + TRIAL_DAYS * 86400_000) - Date.now();
  return Math.max(0, Math.ceil(msLeft / 86400_000));
};

export const isSubscriptionActive = (sub: SubscriptionStatus): boolean => {
  if (sub.plan === 'trial') return getTrialDaysLeft(sub) > 0;
  if (sub.plan === 'monthly') return true;  // mock – always active once subscribed
  return false;
};

export const todayString = (): string =>
  new Date().toISOString().slice(0, 10);
