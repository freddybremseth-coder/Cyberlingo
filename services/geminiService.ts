import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SourceLang } from "../types";

// ─── Provider detection ────────────────────────────────────────────────────
export type AIProvider = 'gemini' | 'claude' | 'openai';

export const detectProvider = (key: string): AIProvider => {
  if (key.startsWith('AIza')) return 'gemini';
  if (key.startsWith('sk-ant-')) return 'claude';
  return 'openai';
};

// ─── API key management ────────────────────────────────────────────────────
export const getStoredApiKey = (): string =>
  localStorage.getItem('cyberlingo_api_key') || (process.env.API_KEY ?? '');

export const setStoredApiKey = (key: string): void =>
  localStorage.setItem('cyberlingo_api_key', key);

export const clearStoredApiKey = (): void =>
  localStorage.removeItem('cyberlingo_api_key');

const getAI = (): GoogleGenAI => {
  const key = getStoredApiKey();
  if (!key) throw new Error('Ingen API-nøkkel funnet. Gå til Profil → Innstillinger.');
  return new GoogleGenAI({ apiKey: key });
};

// ─── Low-level fetch helpers ───────────────────────────────────────────────
const claudePost = (key: string, body: object): Promise<Response> =>
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

const openaiPost = (key: string, body: object): Promise<Response> =>
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

/**
 * Strip markdown code fences from AI JSON responses.
 * Models sometimes wrap JSON in ```json ... ``` even when told not to.
 */
const stripJSON = (text: string): string => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
};

/**
 * Robustly extract an array from a parsed JSON value.
 * Handles: direct array, object wrapping (any key), or empty fallback.
 */
const extractArray = (parsed: unknown): unknown[] => {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const arr = Object.values(parsed as Record<string, unknown>).find(v => Array.isArray(v));
    if (arr) return arr as unknown[];
  }
  return [];
};

/** Generate plain text with any provider */
const callText = async (systemPrompt: string, userPrompt: string, temp = 0.7): Promise<string> => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);

  if (provider === 'gemini') {
    const resp = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPrompt,
      config: { temperature: temp, systemInstruction: systemPrompt },
    });
    return resp.text || '';
  }

  if (provider === 'claude') {
    const resp = await claudePost(key, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Claude API feil');
    return data.content[0].text;
  }

  // OpenAI
  const resp = await openaiPost(key, {
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'OpenAI API feil');
  return data.choices[0].message.content;
};

/** Generate JSON with Claude/OpenAI (Gemini handles schema itself in each function) */
const callJSON = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const sys = systemPrompt + '\n\nRespond ONLY with valid JSON. No markdown, no extra text.';

  if (provider === 'claude') {
    const resp = await claudePost(key, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: sys,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Claude API feil');
    return stripJSON(data.content[0].text);
  }

  // OpenAI – no json_object mode so arrays can be returned directly
  const resp = await openaiPost(key, {
    model: 'gpt-4o-mini',
    max_tokens: 2048,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: userPrompt },
    ],
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'OpenAI API feil');
  return stripJSON(data.choices[0].message.content);
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

// ─── Validate API key ──────────────────────────────────────────────────────
export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const provider = detectProvider(key);

    if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Di "hola"',
        config: { maxOutputTokens: 5 },
      });
      return true;
    }

    if (provider === 'claude') {
      const resp = await claudePost(key, {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Di "hola"' }],
      });
      return resp.ok;
    }

    // OpenAI
    const resp = await openaiPost(key, {
      model: 'gpt-4o-mini',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Di "hola"' }],
    });
    return resp.ok;
  } catch {
    return false;
  }
};

// ─── Text-to-Speech ────────────────────────────────────────────────────────
export const generateSpeech = async (text: string): Promise<void> => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);

  if (provider !== 'gemini') {
    // Fallback: browser Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Say clearly and naturally in Spanish: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData?.data);
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
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const promptText = `Identify the main objects in this image. For each object provide: Spanish word (with article), ${langLabel} translation, a short useful Spanish sentence using that word, and pronunciation guide. Max 5 objects.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: promptText },
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
    return JSON.parse(stripJSON(response.text || '[]'));
  }

  const jsonPrompt = promptText + ' Return JSON array: [{"spanish":"...","translation":"...","example":"...","pronunciation":"..."}]';

  if (provider === 'openai') {
    const resp = await openaiPost(key, {
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          { type: 'text', text: jsonPrompt },
        ],
      }],
    });
    const data = await resp.json();
    return extractArray(JSON.parse(stripJSON(data.choices[0].message.content)));
  }

  // Claude vision
  const resp = await claudePost(key, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: 'Respond with valid JSON array only. No markdown.',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
        { type: 'text', text: jsonPrompt },
      ],
    }],
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Claude API feil');
  return JSON.parse(stripJSON(data.content[0].text || '[]'));
};

// ─── Grammar explanation ───────────────────────────────────────────────────
export const getGrammarExplanation = async (topic: string, query: string, lang: SourceLang = 'no') => {
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  return callText(
    `You are an expert, encouraging Spanish teacher for ${langLabel}-speaking students. Focus on practical usage. Use simple language. Always give real-world examples.`,
    `Explain the following about ${topic} in Spanish: ${query}. Use ${langLabel} for all explanations. Be concise, practical, and include examples.`,
    0.7,
  );
};

// ─── Sentence analysis ─────────────────────────────────────────────────────
export const analyzeSentence = async (sentence: string, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
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
    return JSON.parse(stripJSON(response.text || '{}'));
  }

  const text = await callJSON(
    `You are a Spanish grammar expert. Use ${langLabel} for explanations.`,
    `Analyze this Spanish sentence: "${sentence}". Return JSON: {"translation":"${langLabel} translation","literalTranslation":"literal ${langLabel} translation","breakdown":[{"word":"...","analysis":"${langLabel} explanation","type":"grammatical type"}]}`,
  );
  return JSON.parse(stripJSON(text));
};

// ─── Quiz generation ───────────────────────────────────────────────────────
export const generateQuiz = async (topic: string, count = 5, level = 1, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Generate ${count} multiple-choice questions about "${topic}" in Spanish for a ${langLabel}-speaking student at level ${level}/3. Make questions practical and test real understanding, not just memorisation.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '[]'));
  }

  const text = await callJSON(
    `You are a Spanish teacher. Generate quiz questions. Use ${langLabel} for explanations.`,
    prompt + ` Return a JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":"correct option text","explanation":"${langLabel} explanation"}]`,
  );
  return extractArray(JSON.parse(stripJSON(text)));
};

// ─── Verb details ──────────────────────────────────────────────────────────
export const getVerbDetails = async (verb: string, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Provide full conjugations for the Spanish verb "${verb}" in present, preterite, and imperfect tenses. Include ${langLabel} meaning.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '{}'));
  }

  const text = await callJSON(
    'You are a Spanish language expert.',
    prompt + ' Return JSON: {"infinitive":"...","meaning":"...","conjugations":[{"tense":"Presente","yo":"...","tu":"...","el":"...","nosotros":"...","vosotros":"...","ellos":"..."},{"tense":"Pretérito","yo":"...","tu":"...","el":"...","nosotros":"...","vosotros":"...","ellos":"..."},{"tense":"Imperfecto","yo":"...","tu":"...","el":"...","nosotros":"...","vosotros":"...","ellos":"..."}]}',
  );
  return JSON.parse(stripJSON(text));
};

// ─── Verb example sentences ────────────────────────────────────────────────
export const getVerbSentenceExamples = async (verb: string, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Generate 3 natural, diverse Spanish example sentences using the verb "${verb}". Include ${langLabel} translations. Use different tenses.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '[]'));
  }

  const text = await callJSON(
    'You are a Spanish teacher.',
    prompt + ' Return a JSON array: [{"spanish":"...","translation":"..."}]',
  );
  return extractArray(JSON.parse(stripJSON(text)));
};

// ─── Vocabulary batch ──────────────────────────────────────────────────────
export const getVocabBatch = async (category: string, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Provide exactly 50 of the most important, high-frequency Spanish words for the category: "${category}". Include ${langLabel} translation and clear pronunciation guide. Prioritise words that appear most in everyday conversation.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '[]'));
  }

  const text = await callJSON(
    'You are a Spanish vocabulary expert.',
    prompt + ' Return a JSON array of exactly 50 items: [{"spanish":"...","translation":"...","pronunciation":"phonetic guide"}]',
  );
  return extractArray(JSON.parse(stripJSON(text)));
};

// ─── Phrase batch ──────────────────────────────────────────────────────────
export const getPhraseBatch = async (category: string, lang: SourceLang = 'no') => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Provide exactly 50 extremely useful, natural Spanish phrases for the category: "${category}". Include ${langLabel} translation and practical usage context. Focus on phrases native speakers actually use.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '[]'));
  }

  const text = await callJSON(
    'You are a Spanish language expert.',
    prompt + ' Return a JSON array of exactly 50 items: [{"spanish":"...","translation":"...","context":"when/how to use this phrase"}]',
  );
  return extractArray(JSON.parse(stripJSON(text)));
};

// ─── Conversation practice ─────────────────────────────────────────────────
export const generateConversationResponse = async (
  systemContext: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  userMessage: string,
  lang: SourceLang = 'no',
): Promise<string> => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const systemInstruction = `${systemContext}

IMPORTANT: Always respond primarily in Spanish.
After your Spanish response, add a brief language tip in ${langLabel} in parentheses like: (Tips: ...).
Keep your response to 2-3 sentences maximum. Be encouraging.`;

  if (provider === 'gemini') {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user' as const, parts: [{ text: userMessage }] },
    ];
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: { temperature: 0.85, systemInstruction },
    });
    return response.text || '';
  }

  // Convert Gemini history format to OpenAI/Claude format
  const messages = [
    ...history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.text,
    })),
    { role: 'user', content: userMessage },
  ];

  if (provider === 'claude') {
    const resp = await claudePost(key, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemInstruction,
      messages,
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Claude API feil');
    return data.content[0].text;
  }

  // OpenAI
  const resp = await openaiPost(key, {
    model: 'gpt-4o-mini',
    max_tokens: 512,
    temperature: 0.85,
    messages: [{ role: 'system', content: systemInstruction }, ...messages],
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'OpenAI API feil');
  return data.choices[0].message.content;
};

// ─── Pronunciation feedback ────────────────────────────────────────────────
export const getPronunciationTips = async (word: string, lang: SourceLang = 'no'): Promise<string> => {
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  return callText(
    `You are a Spanish pronunciation expert for ${langLabel} speakers.`,
    `Give practical pronunciation tips for the Spanish word/phrase: "${word}". Explain in ${langLabel} how to pronounce it, what sounds are tricky for ${langLabel} speakers, and give a simple phonetic breakdown. Be concise and practical.`,
    0.5,
  );
};

// ─── Daily word / phrase ───────────────────────────────────────────────────
export const getDailyWord = async (lang: SourceLang = 'no'): Promise<{
  word: string; translation: string; example: string; pronunciation: string;
}> => {
  const key = getStoredApiKey();
  const provider = detectProvider(key);
  const langLabel = ({ no: 'Norwegian', ru: 'Russian', en: 'English', de: 'German' } as Record<string, string>)[lang] ?? 'English';
  const prompt = `Give me one useful, intermediate-level Spanish word for today's vocabulary focus. Include ${langLabel} translation, a natural example sentence, and pronunciation.`;

  if (provider === 'gemini') {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
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
    return JSON.parse(stripJSON(response.text || '{}'));
  }

  const text = await callJSON(
    'You are a Spanish vocabulary teacher.',
    prompt + ' Return JSON: {"word":"...","translation":"...","example":"Spanish example sentence","pronunciation":"phonetic guide"}',
  );
  return JSON.parse(stripJSON(text));
};
