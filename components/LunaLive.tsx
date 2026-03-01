
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SourceLang } from '../types';
import { getStoredApiKey, detectProvider } from '../services/geminiService';
import NeonButton from './NeonButton';

interface LunaLiveProps {
  lang: SourceLang;
}

const LunaLive: React.FC<LunaLiveProps> = ({ lang }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{user: string, bot: string}[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startConnection = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: getStoredApiKey() });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Visualizer
      const source = inputCtx.createMediaStreamSource(stream);
      const analyzer = inputCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      drawVisualizer();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `Du er Luna, en AI-mentor for spansk. Snakk spansk med brukeren, men gi korte forklaringer på ${{ no: 'norsk', ru: 'russisk', en: 'engelsk', de: 'tysk' }[lang] ?? 'engelsk'} hvis de gjør feil. Oppmuntre til samtale.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + msg.serverContent.inputTranscription.text);
            }
            if (msg.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + msg.serverContent.outputTranscription.text);
            }
            if (msg.serverContent?.turnComplete) {
              setTranscript(prev => [...prev, { user: currentInput, bot: currentOutput }].slice(-5));
              setCurrentInput('');
              setCurrentOutput('');
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx);
              const node = ctx.createBufferSource();
              node.buffer = buffer;
              node.connect(ctx.destination);
              node.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(node);
              node.onended = () => sourcesRef.current.delete(node);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopConnection(),
          onerror: (e) => setError("Link brutt. Prøv igjen.")
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      setError("Kunne ikke koble til nevralt nettverk.");
      console.error(err);
    }
  };

  const stopConnection = () => {
    setIsActive(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    sourcesRef.current.forEach(s => s.stop());
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 40;

      // Draw Neural Core
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius + 20);
      gradient.addColorStop(0, '#00D9FF');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + (dataArray[0] / 4), 0, Math.PI * 2);
      ctx.fill();

      // Draw Data Waves
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FF006E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const r = radius + (v * 20);
        const angle = (i / bufferLength) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };
    draw();
  };

  const labels = ({
    no: {
      title: 'Neural Voice Link',
      sub: 'Luna sanntids-interaksjon',
      connect: 'Etabler Link',
      disconnect: 'Koble fra',
      status: 'Status',
      online: 'SYNKRONISERT',
      offline: 'OFFLINE',
      hint: 'Begynn å snakke spansk for å aktivere dekoding.',
    },
    ru: {
      title: 'Голосовая связь',
      sub: 'Луна в реальном времени',
      connect: 'Установить связь',
      disconnect: 'Отключить',
      status: 'Статус',
      online: 'СИНХРОНИЗИРОВАНО',
      offline: 'ОФФЛАЙН',
      hint: 'Начните говорить по-испански для активации декодирования.',
    },
    en: {
      title: 'Neural Voice Link',
      sub: 'Luna real-time interaction',
      connect: 'Establish Link',
      disconnect: 'Disconnect',
      status: 'Status',
      online: 'SYNCHRONISED',
      offline: 'OFFLINE',
      hint: 'Start speaking Spanish to activate decoding.',
    },
    de: {
      title: 'Neuraler Sprach-Link',
      sub: 'Luna Echtzeit-Interaktion',
      connect: 'Verbindung herstellen',
      disconnect: 'Trennen',
      status: 'Status',
      online: 'SYNCHRONISIERT',
      offline: 'OFFLINE',
      hint: 'Beginne Spanisch zu sprechen, um die Dekodierung zu aktivieren.',
    },
  } as Record<string, { title: string; sub: string; connect: string; disconnect: string; status: string; online: string; offline: string; hint: string }>)[lang] ?? {
    title: 'Neural Voice Link',
    sub: 'Luna real-time interaction',
    connect: 'Establish Link',
    disconnect: 'Disconnect',
    status: 'Status',
    online: 'SYNCHRONISED',
    offline: 'OFFLINE',
    hint: 'Start speaking Spanish to activate decoding.',
  };

  const storedKey = getStoredApiKey();
  if (storedKey && detectProvider(storedKey) !== 'gemini') {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-4xl mb-3">🎙️</div>
        <p className="font-bold mb-1">Luna Live krever Gemini API</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sanntids stemmesamtale er kun tilgjengelig med Google Gemini API-nøkkel (starter med AIza...).
          Bytt nøkkel under Profil → AI API-nøkkel.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-lg border border-cyan/30 flex flex-col items-center gap-8 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading text-cyan neon-text-cyan uppercase">{labels.title}</h2>
          <p className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase">{labels.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-lime animate-pulse shadow-[0_0_8px_#FFBE0B]' : 'bg-white/10'}`}></div>
          <span className="text-[10px] font-mono text-white/40">{labels.status}: {isActive ? labels.online : labels.offline}</span>
        </div>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <canvas ref={canvasRef} width={256} height={256} className="absolute inset-0" />
        <div className={`w-24 h-24 rounded-full border-4 border-cyan/20 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 shadow-[0_0_40px_rgba(0,217,255,0.3)]' : 'scale-90 opacity-20'}`}>
          <div className="w-12 h-12 bg-magenta rounded-sm rotate-45 flex items-center justify-center animate-pulse">
             <span className="text-dark font-heading font-bold -rotate-45 text-xl">Ñ</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        {isActive ? (
          <>
            <div className="glass-panel p-4 rounded bg-dark/60 min-h-[100px] border border-cyan/10">
              <p className="text-[9px] font-mono text-cyan/40 uppercase mb-2">Sanntids Dekoding:</p>
              <p className="text-white font-body text-sm italic">{currentInput || labels.hint}</p>
              <p className="text-cyan font-body text-sm mt-4">{currentOutput}</p>
            </div>
            <NeonButton variant="magenta" className="w-full" onClick={stopConnection}>
              {labels.disconnect}
            </NeonButton>
          </>
        ) : (
          <NeonButton variant="cyan" className="w-full py-4" onClick={startConnection}>
            {labels.connect}
          </NeonButton>
        )}
        {error && <p className="text-magenta font-mono text-[10px] text-center">{error}</p>}
      </div>

      <div className="w-full space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
        {transcript.map((t, i) => (
          <div key={i} className="text-[10px] font-mono border-l border-white/10 pl-3 opacity-40">
            <p className="text-white">USER: {t.user}</p>
            <p className="text-cyan">LUNA: {t.bot}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LunaLive;
