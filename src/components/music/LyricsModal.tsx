import React, { useEffect, useRef } from 'react';
import { X, Mic2, Music, Sparkles } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function LyricsModal() {
  const { currentTrack, currentTime, duration, showLyrics, setShowLyrics, isPlaying, seekTo } = useMusic();
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lyrics = currentTrack?.lyrics || [];

  // Determine active lyric line
  const activeIndex = lyrics.findIndex((line, idx) => {
    const nextLine = lyrics[idx + 1];
    if (nextLine) {
      return currentTime >= line.time && currentTime < nextLine.time;
    }
    return currentTime >= line.time;
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

  if (!showLyrics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#121620] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954]">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {currentTrack?.title || 'Lirik Musik'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30">
                  Real-time Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentTrack?.artist || 'FAZURAVERSE'}</p>
            </div>
          </div>

          <button
            onClick={() => setShowLyrics(false)}
            aria-label="Tutup Lirik"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 text-center select-none"
        >
          {lyrics.length > 0 ? (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seekTo(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-1.5 px-4 rounded-xl ${
                    isActive
                      ? 'text-xl sm:text-2xl font-black text-[#1DB954] scale-105 bg-[#1DB954]/10 shadow-[0_0_20px_rgba(29,185,84,0.15)]'
                      : isPast
                      ? 'text-sm sm:text-base font-semibold text-slate-400 hover:text-slate-200'
                      : 'text-sm sm:text-base font-medium text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <p>{line.text}</p>
                  {isActive && (
                    <span className="text-[10px] text-[#1DB954]/80 mt-1 block font-mono">
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
                  Lagu ini tetap dapat diputar secara lancar melalui YouTube player FAZURAVERSE.
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Bernyanyi bersama {currentTrack?.artist}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/40 text-center text-[11px] text-slate-400 flex items-center justify-between">
          <span>Klik baris lirik untuk melompat ke waktu tersebut</span>
          <span className="text-[#1DB954] font-medium font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
