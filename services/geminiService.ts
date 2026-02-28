
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { SourceLang } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Singleton AudioContext for gjenbruk og ytelse
let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioContext;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly in Spanish: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData && p.inlineData.data);
    const base64Audio = audioPart?.inlineData?.data;

    if (base64Audio) {
      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS failed", error);
  }
};

export const analyzeVision = async (base64Image: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Identify the main objects in this image. For each object, provide the Spanish word (with article), the translation in ${lang === 'no' ? 'Norwegian' : 'Russian'}, and a short useful sentence in Spanish using that word.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: { type: Type.STRING },
            translation: { type: Type.STRING },
            example: { type: Type.STRING },
            pronunciation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getGrammarExplanation = async (topic: string, query: string, lang: SourceLang = 'no') => {
  const targetUser = lang === 'no' ? 'norske elever' : 'русскоязычных учеников';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the following about ${topic} in Spanish: ${query}. Use ${lang === 'no' ? 'Norwegian' : 'Russian'} for explanations.`,
    config: {
      temperature: 0.7,
      systemInstruction: `You are an expert Spanish teacher for ${targetUser}.`,
    }
  });
  return response.text;
};

export const analyzeSentence = async (sentence: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the Spanish sentence: "${sentence}". Break it down into parts.`,
    config: {
      responseMimeType: "application/json",
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
                analysis: { type: Type.STRING, description: `In ${lang === 'no' ? 'Norwegian' : 'Russian'}` },
                type: { type: Type.STRING, description: "Grammatical type" }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateQuiz = async (topic: string, count: number = 7, level: number = 1, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} multiple choice questions about ${topic} in Spanish for a ${lang === 'no' ? 'Norwegian' : 'Russian'} student. Level: ${level}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getVerbDetails = async (verb: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Conjugations for "${verb}" in present, preterite, imperfect. Include ${lang === 'no' ? 'Norwegian' : 'Russian'} meaning.`,
    config: {
      responseMimeType: "application/json",
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
                tense: { type: Type.STRING },
                yo: { type: Type.STRING },
                tu: { type: Type.STRING },
                el: { type: Type.STRING },
                nosotros: { type: Type.STRING },
                vosotros: { type: Type.STRING },
                ellos: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getVerbSentenceExamples = async (verb: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 diverse Spanish example sentences using the verb "${verb}". Include ${lang === 'no' ? 'Norwegian' : 'Russian'} translations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: { type: Type.STRING },
            translation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getVocabBatch = async (category: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide exactly 50 of the most common Spanish words for the category: "${category}". Provide translations in ${lang === 'no' ? 'Norwegian' : 'Russian'}. Ensure high quality and accuracy.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: { type: Type.STRING },
            translation: { type: Type.STRING },
            pronunciation: { type: Type.STRING, description: "Phonetic guide for non-Spanish speakers" }
          },
          required: ["spanish", "translation", "pronunciation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getPhraseBatch = async (category: string, lang: SourceLang = 'no') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide exactly 50 common and extremely useful Spanish phrases for the category: "${category}". Provide translations in ${lang === 'no' ? 'Norwegian' : 'Russian'}. Include contextual usage notes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            spanish: { type: Type.STRING },
            translation: { type: Type.STRING },
            context: { type: Type.STRING, description: "When and how to use this phrase" }
          },
          required: ["spanish", "translation", "context"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
