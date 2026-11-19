import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Mic2,
  Mic,
  MicOff,
  Music,
  Sparkles,
  Sliders,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Radio,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const STORAGE_KEY_OFFSET = 'fazura_lyrics_offset_ms';

export function LyricsModal() {
  const { currentTrack, currentTime, duration, showLyrics, setShowLyrics, isPlaying, seekTo } = useMusic();
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calibration offset (default: 350ms advance anticipation so lyrics illuminate right as singer breathes/vocalizes)
  const [offsetMs, setOffsetMs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFSET);
      return saved !== null ? parseInt(saved, 10) : 350;
    } catch {
      return 350;
    }
  });

  const [showSyncControls, setShowSyncControls] = useState<boolean>(false);

  // Live Microphone / Karaoke Feature
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lyrics = currentTrack?.lyrics || [];

  // Update offset with localStorage persistence
  const updateOffset = (newOffset: number) => {
    setOffsetMs(newOffset);
    try {
      localStorage.setItem(STORAGE_KEY_OFFSET, newOffset.toString());
    } catch {
      // ignore storage errors
    }
  };

  // Calculate synchronized active time with anticipation offset
  const effectiveTime = Math.max(0, currentTime + offsetMs / 1000);

  // Determine active lyric line
  const activeIndex = lyrics.findIndex((line, idx) => {
    const nextLine = lyrics[idx + 1];
    if (nextLine) {
      return effectiveTime >= line.time && effectiveTime < nextLine.time;
    }
    return effectiveTime >= line.time;
  });

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  // Clean up Mic resources
  const stopMic = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setMicLevel(0);
  }, []);

  // Toggle Live Microphone input & VU Meter
  const toggleMic = async () => {
    if (isMicActive) {
      stopMic();
      return;
    }

    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsMicActive(true);

      const processAudio = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);

        // Compute Root Mean Square (RMS) volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Normalize 0 to 100 with dynamic curve
        const normalized = Math.min(100, Math.round((avg / 128) * 100 * 1.5));
        setMicLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      setMicError('Izin mikrofon ditolak atau perangkat tidak ditemukan.');
      setIsMicActive(false);
    }
  };

  // Stop mic when modal closes
  useEffect(() => {
    if (!showLyrics) {
      stopMic();
    }
  }, [showLyrics, stopMic]);

  // Animated background waveform canvas when audio is playing
  useEffect(() => {
    if (!canvasRef.current || !showLyrics) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw subtle glowing frequency spectrum bars
      const barCount = 32;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const dynamicHeight = isPlaying
          ? Math.sin(phase + i * 0.35) * (height * 0.35) + height * 0.4
          : height * 0.08;

        const x = i * barWidth;
        const y = height - dynamicHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, 'rgba(29, 185, 84, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, dynamicHeight);
      }

      phase += 0.08;
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [showLyrics, isPlaying]);

  if (!showLyrics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#121620] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-[#161b29]/90 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] shrink-0 shadow-lg shadow-[#1DB954]/20">
              <Mic2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md">
                  {currentTrack?.title || 'Lirik Musik'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30 shrink-0">
                  Real-Time Karaoke
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{currentTrack?.artist || 'FAZURAVERSE'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync calibration toggle button */}
            <button
              onClick={() => setShowSyncControls((prev) => !prev)}
              title="Kalibrasi Waktu Lirik"
              className={`p-2 rounded-xl transition-all ${
                showSyncControls
                  ? 'bg-[#1DB954] text-black font-bold shadow-md shadow-[#1DB954]/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Karaoke Live Mic Toggle */}
            <button
              onClick={toggleMic}
              title={isMicActive ? 'Matikan Mic Karaoke' : 'Aktifkan Mic Karaoke'}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                isMicActive
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                  : 'text-slate-400 hover:text-[#1DB954] hover:bg-white/10'
              }`}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMicActive ? 'Mic Aktif' : 'Mic Karaoke'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowLyrics(false)}
              aria-label="Tutup Lirik"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Controls Toolbar (Expandable) */}
        {showSyncControls && (
          <div className="px-6 py-2.5 bg-[#0e121a] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1DB954]" /> Kalibrasi Delay:
              </span>
              <span className="font-mono font-bold text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-md border border-[#1DB954]/20">
                {offsetMs > 0 ? `+${offsetMs}ms (Maju)` : offsetMs < 0 ? `${offsetMs}ms (Mundur)` : '0ms (Pas)'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateOffset(offsetMs - 500)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Mundurkan lirik 0.5s"
              >
                -0.5s
              </button>
              <button
                onClick={() => updateOffset(offsetMs - 200)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Mundurkan lirik 0.2s"
              >
                -0.2s
              </button>
              <button
                onClick={() => updateOffset(0)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Reset ke 0ms"
              >
                Reset
              </button>
              <button
                onClick={() => updateOffset(offsetMs + 200)}
                className="px-2 py-1 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] transition-colors"
                title="Majukan lirik 0.2s"
              >
                +0.2s
              </button>
              <button
                onClick={() => updateOffset(offsetMs + 500)}
                className="px-2 py-1 rounded-lg bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] font-bold transition-colors"
                title="Majukan lirik 0.5s"
              >
                +0.5s
              </button>
            </div>
          </div>
        )}

        {/* Live Mic VU Sound Meter Bar (When Mic is active) */}
        {isMicActive && (
          <div className="px-6 py-2 bg-gradient-to-r from-black/80 via-[#181827] to-black/80 border-b border-white/10 flex items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[11px] font-bold text-slate-300">Vocal Input:</span>
            </div>

            {/* Animated Dynamic Sound Level Meter */}
            <div className="flex-1 max-w-sm h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.max(4, micLevel)}%`,
                  background:
                    micLevel > 80
                      ? 'linear-gradient(to right, #1DB954, #F59E0B, #F43F5E)'
                      : micLevel > 50
                      ? 'linear-gradient(to right, #1DB954, #F59E0B)'
                      : '#1DB954',
                }}
              />
            </div>

            <span className="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">
              {micLevel}%
            </span>
          </div>
        )}

        {micError && (
          <div className="px-6 py-2 bg-rose-500/20 text-rose-300 text-xs border-b border-rose-500/30 flex items-center justify-between">
            <span>{micError}</span>
            <button onClick={() => setMicError(null)} className="underline">
              Tutup
            </button>
          </div>
        )}

        {/* Lyrics Body */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-y-auto px-6 py-8 space-y-6 text-center select-none"
        >
          {/* Subtle Background Audio Visualizer Canvas */}
          <canvas
            ref={canvasRef}
            width={400}
            height={80}
            className="absolute bottom-0 left-0 right-0 w-full h-20 opacity-20 pointer-events-none"
          />

          {lyrics.length > 0 ? (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seekTo(Math.max(0, line.time - offsetMs / 1000))}
                  className={`cursor-pointer transition-all duration-200 py-2 px-4 rounded-2xl ${
                    isActive
                      ? 'text-xl sm:text-2xl font-black text-[#1DB954] scale-105 bg-[#1DB954]/15 shadow-[0_0_25px_rgba(29,185,84,0.2)] border border-[#1DB954]/30'
                      : isPast
                      ? 'text-sm sm:text-base font-semibold text-slate-400 hover:text-slate-200'
                      : 'text-sm sm:text-base font-medium text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <p className="leading-relaxed">{line.text}</p>
                  {isActive && (
                    <span className="text-[10px] text-[#1DB954]/90 mt-1 block font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
                <Music className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Lirik Belum Tersedia Sinkronisasi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Lagu ini tetap dapat dinikmati bersama fitur Mic Karaoke real-time FAZURAVERSE.
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Bernyanyi bersama {currentTrack?.artist}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Player Time */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/60 text-center text-[11px] text-slate-400 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span>Klik baris lirik untuk melompat</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <button
              onClick={() => updateOffset(offsetMs === 350 ? 0 : 350)}
              className="hidden sm:inline text-slate-400 hover:text-[#1DB954] underline decoration-dotted"
            >
              Antisipasi Lirik: {offsetMs}ms
            </button>
          </div>
          <span className="text-[#1DB954] font-medium font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
