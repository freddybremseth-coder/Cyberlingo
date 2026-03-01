
import React, { useState, useRef, useEffect } from 'react';
import { analyzeVision } from '../services/geminiService';
import { SourceLang } from '../types';
import TTSButton from './TTSButton';
import NeonButton from './NeonButton';

interface VisionResult {
  spanish: string;
  translation: string;
  example: string;
  pronunciation: string;
}

const VisionMode: React.FC<{ lang: SourceLang }> = ({ lang }) => {
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [results, setResults] = useState<VisionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const labels = ({
    no: {
      title: 'Vision Link',
      sub: 'Nevral gjenkjenning av omgivelser',
      activate: 'Koble til Kamera',
      capture: 'Skann Omgivelser',
      loading: 'Dekoder visuelle data...',
      example: 'Eksempel',
      pronunciation: 'Uttale',
      error: 'Systemfeil',
      waiting: 'Venter på visuell input...',
      stop: 'Koble fra',
      retry: 'Prøv Igjen',
    },
    ru: {
      title: 'Vision Link',
      sub: 'Нейронное распознавание окружения',
      activate: 'Подключить камеру',
      capture: 'Сканировать окружение',
      loading: 'Декодирование данных...',
      example: 'Пример',
      pronunciation: 'Произношение',
      error: 'Ошибка системы',
      waiting: 'Ожидание визуальных данных...',
      stop: 'Отключить',
      retry: 'Повторить',
    },
    en: {
      title: 'Vision Link',
      sub: 'Neural environment recognition',
      activate: 'Activate Camera',
      capture: 'Scan Environment',
      loading: 'Decoding visual data...',
      example: 'Example',
      pronunciation: 'Pronunciation',
      error: 'System error',
      waiting: 'Waiting for visual input...',
      stop: 'Disconnect',
      retry: 'Try Again',
    },
    de: {
      title: 'Vision Link',
      sub: 'Neuronale Umgebungserkennung',
      activate: 'Kamera aktivieren',
      capture: 'Umgebung scannen',
      loading: 'Visuelle Daten dekodieren...',
      example: 'Beispiel',
      pronunciation: 'Aussprache',
      error: 'Systemfehler',
      waiting: 'Warte auf visuelle Eingabe...',
      stop: 'Trennen',
      retry: 'Erneut versuchen',
    },
  } as Record<string, { title: string; sub: string; activate: string; capture: string; loading: string; example: string; pronunciation: string; error: string; waiting: string; stop: string; retry: string }>)[lang] ?? {
    title: 'Vision Link',
    sub: 'Neural environment recognition',
    activate: 'Activate Camera',
    capture: 'Scan Environment',
    loading: 'Decoding visual data...',
    example: 'Example',
    pronunciation: 'Pronunciation',
    error: 'System error',
    waiting: 'Waiting for visual input...',
    stop: 'Disconnect',
    retry: 'Try Again',
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsCameraRequested(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraRequested(true);
    
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsStreaming(true);
          }).catch(e => {
            console.error("Video play error:", e);
            setCameraError("Kunne ikke starte video-avspilling.");
          });
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let msg = "Ingen tilgang til kamera.";
      if (err.name === 'NotAllowedError') msg = "Kameratilgang ble nektet av nettleseren.";
      if (err.name === 'NotFoundError') msg = "Fant ikke kamera på denne enheten.";
      setCameraError(msg);
      setIsCameraRequested(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;
    
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Venter på bilde-signal...");
      return;
    }

    setLoading(true);
    setCameraError(null);

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Image = dataUrl.split(',')[1];
        
        const data = await analyzeVision(base64Image, lang);
        setResults(data);
      } catch (err) {
        console.error("Vision analysis failed", err);
        setCameraError("Analyse feilet. Vennligst prøv igjen.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto pb-24">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading text-cyan neon-text-cyan mb-2 uppercase">{labels.title}</h1>
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">{labels.sub}</p>
        </div>
        {isCameraRequested && (
          <button 
            onClick={stopCamera}
            className="text-[10px] font-mono text-magenta/60 border border-magenta/30 px-3 py-1 rounded hover:bg-magenta/10 transition-all uppercase"
          >
            {labels.stop}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass-panel aspect-video rounded-lg border-2 border-cyan/20 overflow-hidden relative bg-black shadow-[0_0_30px_rgba(0,217,255,0.1)]">
            {!isCameraRequested ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-dark/40">
                {cameraError && (
                  <div className="mb-6 p-4 bg-magenta/10 border border-magenta/30 text-magenta text-xs font-mono rounded max-w-xs">
                    <span className="block mb-1 font-bold">⚠️ {labels.error}</span>
                    {cameraError}
                  </div>
                )}
                <NeonButton variant="cyan" onClick={startCamera}>
                  {labels.activate}
                </NeonButton>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted
                  playsInline 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                />
                {isStreaming && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan/50 shadow-[0_0_15px_#00D9FF] animate-[scan_3s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-cyan/10 rounded pointer-events-none"></div>
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan"></div>
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan"></div>
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan"></div>
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan"></div>
                  </div>
                )}
                {!isStreaming && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark/60">
                    <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-dark/70 backdrop-blur-md flex flex-col items-center justify-center z-40">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-cyan/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00D9FF]"></div>
                </div>
                <p className="text-cyan font-mono text-[11px] animate-pulse tracking-[0.3em] uppercase">{labels.loading}</p>
              </div>
            )}
            
            {isStreaming && !loading && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <button 
                  onClick={captureAndAnalyze}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/30 transition-all flex items-center justify-center group shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-90"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 group-hover:scale-110 transition-transform"></div>
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="p-4 glass-panel border border-white/5 rounded text-[10px] font-mono text-white/40 leading-relaxed bg-dark/30">
            <div className="flex items-center justify-between mb-2">
               <p className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-lime animate-pulse' : 'bg-white/10'}`}></span>
                INTERFACE_STATUS: {isStreaming ? 'ACTIVE_LINK' : 'LINK_OFFLINE'}
              </p>
              <p>SECURE_CHANNEL: YES</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full min-h-[400px]">
          {results.length > 0 ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar pr-2">
              {results.map((res, i) => (
                <div key={i} className="glass-panel p-5 rounded border border-cyan/20 hover:border-cyan/50 transition-all group bg-dark/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-heading text-white group-hover:text-cyan transition-colors">{res.spanish}</h3>
                      <p className="text-white/50 text-sm font-mono uppercase tracking-widest">{res.translation}</p>
                    </div>
                    <TTSButton text={res.spanish} />
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-[9px] font-mono text-cyan/30 uppercase block mb-1">{labels.example}</span>
                    <p className="text-white/80 italic text-sm leading-relaxed">{res.example}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] font-mono text-white/20 uppercase">{labels.pronunciation}:</span>
                       <span className="text-[10px] font-mono text-cyan/60">/{res.pronunciation}/</span>
                     </div>
                     <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 glass-panel rounded-lg border border-white/5 flex flex-col items-center justify-center p-10 text-center text-white/20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               <p className="font-heading text-sm uppercase tracking-widest">{labels.waiting}</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default VisionMode;
