import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SourceLang } from "../types";

// ─── API key management ────────────────────────────────────────────────────
export const getStoredApiKey = (): string =>
  localStorage.getItem('cyberlingo_api_key') || (process.env.API_KEY ?? '');

export const setStoredApiKey = (key: string): void =>
  localStorage.setItem('cyberlingo_api_key', key);

export const clearStoredApiKey = (): void =>
  localStorage.removeItem('cyberlingo_api_key');

/** Create a GoogleGenAI instance with the current key. Throws if no key. */
const getAI = (): GoogleGenAI => {
  const key = getStoredApiKey();
  if (!key) throw new Error('Ingen API-nøkkel funnet. Gå til Profil → Innstillinger for å legge til din Gemini API-nøkkel.');
  return new GoogleGenAI({ apiKey: key });
};

// ─── Audio helpers ─────────────────────────────────────────────────────────
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioContext;
};

const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const dataInt16 = new Int16Array(arrayBuffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

// ─── Validate API key with a minimal request ───────────────────────────────
export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Di "hola"',
      config: { maxOutputTokens: 5 },
    });
    return true;
  } catch {
    return false;
  }
};

// ─── Text-to-Speech ────────────────────────────────────────────────────────
export const generateSpeech = async (text: string): Promise<void> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Say clearly and naturally in Spanish: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts.find(
      p => p.inlineData?.data
    );
    if (audioPart?.inlineData?.data) {
      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const audioBuffer = await decodeAudioData(decode(audioPart.inlineData.data), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error('TTS failed:', error);
  }
};

// ─── Vision / camera ───────────────────────────────────────────────────────
export const analyzeVision = async (base64Image: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        {
          text: `Identify the main objects in this image. For each object provide:
Spanish word (with article), translation in ${lang === 'no' ? 'Norwegian' : 'Russian'},
a short useful Spanish sentence using that word, and pronunciation guide.
Return max 5 objects.`
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: { type: Type.STRING },
            translation: { type: Type.STRING },
            example: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
};

// ─── Grammar explanation ───────────────────────────────────────────────────
export const getGrammarExplanation = async (topic: string, query: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const langLabel = lang === 'no' ? 'Norwegian' : 'Russian';
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Explain the following about ${topic} in Spanish: ${query}.
Use ${langLabel} for all explanations. Be concise, practical, and include examples.`,
    config: {
      temperature: 0.7,
      systemInstruction: `You are an expert, encouraging Spanish teacher for ${langLabel}-speaking students.
Focus on practical usage. Use simple language. Always give real-world examples.`,
    },
  });
  return response.text;
};

// ─── Sentence analysis ─────────────────────────────────────────────────────
export const analyzeSentence = async (sentence: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const langLabel = lang === 'no' ? 'Norwegian' : 'Russian';
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Analyze this Spanish sentence: "${sentence}". Break it into individual words with their grammatical role.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          literalTranslation: { type: Type.STRING },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                analysis: { type: Type.STRING, description: `Explanation in ${langLabel}` },
                type: { type: Type.STRING, description: 'Grammatical type' },
              },
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '{}');
};

// ─── Quiz generation ───────────────────────────────────────────────────────
export const generateQuiz = async (topic: string, count = 5, level = 1, lang: SourceLang = 'no') => {
  const ai = getAI();
  const langLabel = lang === 'no' ? 'Norwegian' : 'Russian';
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Generate ${count} multiple-choice questions about "${topic}" in Spanish for a ${langLabel}-speaking student at level ${level}/3.
Make questions practical and test real understanding, not just memorisation.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question:      { type: Type.STRING },
            options:       { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation:   { type: Type.STRING },
          },
          required: ['question', 'options', 'correctAnswer', 'explanation'],
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
};

// ─── Verb details ──────────────────────────────────────────────────────────
export const getVerbDetails = async (verb: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Provide full conjugations for the Spanish verb "${verb}" in present, preterite, and imperfect tenses.
Include ${lang === 'no' ? 'Norwegian' : 'Russian'} meaning.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          infinitive: { type: Type.STRING },
          meaning: { type: Type.STRING },
          conjugations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tense:    { type: Type.STRING },
                yo:       { type: Type.STRING },
                tu:       { type: Type.STRING },
                el:       { type: Type.STRING },
                nosotros: { type: Type.STRING },
                vosotros: { type: Type.STRING },
                ellos:    { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '{}');
};

// ─── Verb example sentences ────────────────────────────────────────────────
export const getVerbSentenceExamples = async (verb: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Generate 3 natural, diverse Spanish example sentences using the verb "${verb}".
Include ${lang === 'no' ? 'Norwegian' : 'Russian'} translations. Use different tenses.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish:     { type: Type.STRING },
            translation: { type: Type.STRING },
          },
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
};

// ─── Vocabulary batch ──────────────────────────────────────────────────────
export const getVocabBatch = async (category: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Provide exactly 50 of the most important, high-frequency Spanish words for the category: "${category}".
Include ${lang === 'no' ? 'Norwegian' : 'Russian'} translation and clear pronunciation guide.
Prioritise words that appear most in everyday conversation.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish:       { type: Type.STRING },
            translation:   { type: Type.STRING },
            pronunciation: { type: Type.STRING, description: 'Phonetic guide for beginners' },
          },
          required: ['spanish', 'translation', 'pronunciation'],
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
};

// ─── Phrase batch ──────────────────────────────────────────────────────────
export const getPhraseBatch = async (category: string, lang: SourceLang = 'no') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Provide exactly 50 extremely useful, natural Spanish phrases for the category: "${category}".
Include ${lang === 'no' ? 'Norwegian' : 'Russian'} translation and practical usage context.
Focus on phrases native speakers actually use.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish:     { type: Type.STRING },
            translation: { type: Type.STRING },
            context:     { type: Type.STRING, description: 'When/how to use this phrase' },
          },
          required: ['spanish', 'translation', 'context'],
        },
      },
    },
  });
  return JSON.parse(response.text || '[]');
};

// ─── Conversation practice ─────────────────────────────────────────────────
export const generateConversationResponse = async (
  systemContext: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  userMessage: string,
  lang: SourceLang = 'no',
): Promise<string> => {
  const ai = getAI();
  const langLabel = lang === 'no' ? 'Norwegian' : 'Russian';
  const contents = [
    ...history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      temperature: 0.85,
      systemInstruction: `${systemContext}

IMPORTANT: Always respond primarily in Spanish.
After your Spanish response, add a brief language tip in ${langLabel} in parentheses like: (Tips: ...).
Keep your response to 2-3 sentences maximum. Be encouraging.`,
    },
  });
  return response.text || '';
};

// ─── Pronunciation feedback ────────────────────────────────────────────────
export const getPronunciationTips = async (word: string, lang: SourceLang = 'no'): Promise<string> => {
  const ai = getAI();
  const langLabel = lang === 'no' ? 'Norwegian' : 'Russian';
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Give practical pronunciation tips for the Spanish word/phrase: "${word}".
Explain in ${langLabel} how to pronounce it, what sounds are tricky for ${langLabel} speakers,
and give a simple phonetic breakdown. Be concise and practical.`,
    config: { temperature: 0.5 },
  });
  return response.text || '';
};

// ─── Daily word / phrase ───────────────────────────────────────────────────
export const getDailyWord = async (lang: SourceLang = 'no'): Promise<{
  word: string; translation: string; example: string; pronunciation: string;
}> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Give me one useful, intermediate-level Spanish word for today's vocabulary focus.
Include ${lang === 'no' ? 'Norwegian' : 'Russian'} translation, a natural example sentence, and pronunciation.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word:          { type: Type.STRING },
          translation:   { type: Type.STRING },
          example:       { type: Type.STRING },
          pronunciation: { type: Type.STRING },
        },
      },
    },
  });
  return JSON.parse(response.text || '{}');
};
