import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Mic2,
  Mic,
  MicOff,
  Music,
  Sliders,
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
        gradient.addColorStop(0, 'rgba(230, 139, 166, 0.4)');
        gradient.addColorStop(1, 'rgba(240, 161, 91, 0.05)');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B0C10]/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#191C25] border border-[#343744] rounded-[20px] shadow-dialog flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#343744] bg-[#12141B] z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#E68BA6]/15 border border-[#E68BA6]/35 flex items-center justify-center text-[#E68BA6] shrink-0">
              <Mic2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm sm:text-base font-semibold text-[#F2F0EC] truncate max-w-xs sm:max-w-md">
                  {currentTrack?.title || 'Lirik Musik'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[#E68BA6]/15 text-[#E68BA6] font-semibold border border-[#E68BA6]/35 shrink-0">
                  Real-Time Karaoke
                </span>
              </div>
              <p className="text-xs text-[#A2A4B1] truncate">{currentTrack?.artist || 'FazuraStream'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync calibration toggle button */}
            <button
              onClick={() => setShowSyncControls((prev) => !prev)}
              title="Kalibrasi Waktu Lirik"
              className={`p-2 rounded-[10px] transition-colors ${
                showSyncControls
                  ? 'bg-[#F0A15B] text-[#0B0C10] font-semibold'
                  : 'text-[#A2A4B1] hover:text-[#F2F0EC] hover:bg-[#232633]'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Karaoke Live Mic Toggle */}
            <button
              onClick={toggleMic}
              title={isMicActive ? 'Matikan Mic Karaoke' : 'Aktifkan Mic Karaoke'}
              className={`p-2 rounded-[10px] transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isMicActive
                  ? 'bg-[#E68BA6] text-[#0B0C10]'
                  : 'text-[#A2A4B1] hover:text-[#E68BA6] hover:bg-[#232633]'
              }`}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMicActive ? 'Mic Aktif' : 'Mic Karaoke'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowLyrics(false)}
              aria-label="Tutup Lirik"
              className="p-2 rounded-[10px] text-[#A2A4B1] hover:text-[#F2F0EC] hover:bg-[#232633] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Controls Toolbar (Expandable) */}
        {showSyncControls && (
          <div className="px-6 py-2.5 bg-[#12141B] border-b border-[#343744] flex flex-wrap items-center justify-between gap-3 text-xs z-20">
            <div className="flex items-center gap-2">
              <span className="text-[#A2A4B1] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#E68BA6]" /> Kalibrasi Delay:
              </span>
              <span className="font-mono font-semibold text-[#E68BA6] bg-[#E68BA6]/10 px-2 py-0.5 rounded-[6px] border border-[#E68BA6]/25">
                {offsetMs > 0 ? `+${offsetMs}ms (Maju)` : offsetMs < 0 ? `${offsetMs}ms (Mundur)` : '0ms (Pas)'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateOffset(offsetMs - 500)}
                className="px-2 py-1 rounded-[6px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] transition-colors"
                title="Mundurkan lirik 0.5s"
              >
                -0.5s
              </button>
              <button
                onClick={() => updateOffset(offsetMs - 200)}
                className="px-2 py-1 rounded-[6px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] transition-colors"
                title="Mundurkan lirik 0.2s"
              >
                -0.2s
              </button>
              <button
                onClick={() => updateOffset(0)}
                className="px-2 py-1 rounded-[6px] bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] transition-colors"
                title="Reset ke 0ms"
              >
                Reset
              </button>
              <button
                onClick={() => updateOffset(offsetMs + 200)}
                className="px-2 py-1 rounded-[6px] bg-[#E68BA6]/15 hover:bg-[#E68BA6]/25 text-[#E68BA6] transition-colors"
                title="Majukan lirik 0.2s"
              >
                +0.2s
              </button>
              <button
                onClick={() => updateOffset(offsetMs + 500)}
                className="px-2 py-1 rounded-[6px] bg-[#E68BA6]/20 hover:bg-[#E68BA6]/30 text-[#E68BA6] font-semibold transition-colors"
                title="Majukan lirik 0.5s"
              >
                +0.5s
              </button>
            </div>
          </div>
        )}

        {/* Live Mic VU Sound Meter Bar (When Mic is active) */}
        {isMicActive && (
          <div className="px-6 py-2 bg-[#12141B] border-b border-[#343744] flex items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#E68BA6]" />
              <span className="text-[11px] font-semibold text-[#F2F0EC]">Vocal Input:</span>
            </div>

            <div className="flex-1 max-w-sm h-2.5 bg-[#232633] rounded-full overflow-hidden p-0.5 border border-[#343744]">
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.max(4, micLevel)}%`,
                  background: '#E68BA6',
                }}
              />
            </div>

            <span className="text-[10px] font-mono text-[#A2A4B1] shrink-0 w-8 text-right">
              {micLevel}%
            </span>
          </div>
        )}

        {micError && (
          <div className="px-6 py-2 bg-rose-500/15 text-rose-300 text-xs border-b border-rose-500/30 flex items-center justify-between">
            <span>{micError}</span>
            <button onClick={() => setMicError(null)} className="underline">
              Tutup
            </button>
          </div>
        )}

        {/* Lyrics Body */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-y-auto px-6 py-8 space-y-5 text-center select-none"
        >
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
                  className={`cursor-pointer transition-all duration-200 py-2 px-4 rounded-[10px] ${
                    isActive
                      ? 'text-xl sm:text-2xl font-bold text-[#F0A15B] bg-[#232633] border border-[#F0A15B]/35'
                      : isPast
                      ? 'text-sm sm:text-base font-medium text-[#A2A4B1] hover:text-[#F2F0EC]'
                      : 'text-sm sm:text-base font-normal text-[#747887] hover:text-[#A2A4B1]'
                  }`}
                >
                  <p className="leading-relaxed">{line.text}</p>
                  {isActive && (
                    <span className="text-[10px] text-[#E68BA6] mt-1 block font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 space-y-4">
              <div className="w-14 h-14 rounded-[10px] bg-[#232633] border border-[#343744] flex items-center justify-center text-[#A2A4B1] mx-auto">
                <Music className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-base font-semibold text-[#F2F0EC]">
                  Lirik Belum Tersedia Sinkronisasi
                </h4>
                <p className="text-xs text-[#A2A4B1] max-w-sm mx-auto">
                  Lagu ini tetap dapat dinikmati bersama fitur Mic Karaoke real-time FazuraStream.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Player Time */}
        <div className="px-6 py-3 border-t border-[#343744] bg-[#12141B] text-center text-[11px] text-[#A2A4B1] flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span>Klik baris lirik untuk melompat</span>
            <span className="hidden sm:inline text-[#555967]">•</span>
            <button
              onClick={() => updateOffset(offsetMs === 350 ? 0 : 350)}
              className="hidden sm:inline text-[#A2A4B1] hover:text-[#E68BA6] underline decoration-dotted"
            >
              Antisipasi Lirik: {offsetMs}ms
            </button>
          </div>
          <span className="text-[#E68BA6] font-medium font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
